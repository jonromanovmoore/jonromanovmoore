(() => {
  // src/sciads/utils/log.js
  var noop = () => {
  };
  var log = window.location.search.match(/debug=ads/) ? console.debug.bind(window.console) : noop;

  // src/sciads/perf.js
  var PERF_KEYS = {
    libLoaded: "ads:library_loaded",
    consent: "ads:consent_determined",
    measureConsent: "ads:time_to_consent",
    page: "ads:page_requested",
    gptLoaded: "ads:gpt_loaded",
    gptQueue: "ads:gpt_queue_init",
    firstCall: "ads:first_call",
    firstLoaded: "ads:first_loaded",
    measureFirstCall: "ads:time_to_first_call",
    measureFirstLoad: "ads:time_to_first_ad"
  };
  function logMeasurement(key, message) {
    let t = Math.round(performance.getEntriesByName(key)[0].duration);
    log(`${message}: ${t}ms`);
  }
  function trackPerformanceFirstCall(gptAd) {
    if (!performance.getEntriesByName(PERF_KEYS.firstCall).length) {
      performance.mark(PERF_KEYS.firstCall);
      performance.measure(PERF_KEYS.measureFirstCall, PERF_KEYS.page, PERF_KEYS.firstCall);
    }
  }
  function trackPerformanceFirstLoad(gptAd) {
    if (!performance.getEntriesByName(PERF_KEYS.firstLoaded).length) {
      performance.mark(PERF_KEYS.firstLoaded);
      performance.measure(PERF_KEYS.measureFirstLoad, PERF_KEYS.page, PERF_KEYS.firstLoaded);
      logMeasurement(PERF_KEYS.measureFirstLoad, "Time to first ad");
      let t = Math.round(performance.getEntriesByName(PERF_KEYS.measureFirstLoad)[0].duration);
    }
  }

  // src/sciads/utils/cookies.js
  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // src/sciads/consent.js
  var optOuts = {
    ads: false
  };
  function isOptedOut() {
    return optOuts.ads;
  }
  window.consentQueue = window.consentQueue || [];
  function getConsent() {
    return new Promise((resolve) => {
      if (navigator.globalPrivacyControl) {
        optOuts.ads = true;
        resolve();
        return;
      }
      window.consentQueue.push(() => {
        optOuts.ads = !window.sncc?.user.getConsent().C04;
        resolve();
      });
    }).then(() => {
      performance.mark(PERF_KEYS.consent);
      performance.measure(PERF_KEYS.measureConsent, PERF_KEYS.libLoaded, PERF_KEYS.consent);
      logMeasurement(PERF_KEYS.measureConsent, "Time to determine consent status");
      if (isOptedOut()) {
        log(`Ads: user opted out. Showing nonpersonalized ads only.`);
      }
    });
  }

  // src/sciads/constants.js
  var IAB_SIZES = ["320x50", "300x250", "300x600", "728x90", "970x250"];
  var PREMIUM_SIZES = ["320x450", "970x350"];

  // node_modules/jwt-decode/build/esm/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";
  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
      let code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    }));
  }
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("base64 string is not of the correct length");
    }
    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }
  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
      decoded = base64UrlDecode(part);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
  }

  // src/sciads/utils/user.js
  function getUserData() {
    const auth0Cookie = document.cookie.split(";").map((c) => c.trim()).filter((c) => c.startsWith("sa_user."))[0];
    if (!auth0Cookie) {
      return null;
    }
    const cookieValue = auth0Cookie.split("=")[1];
    const data = jwtDecode(cookieValue);
    return data;
  }

  // src/sciads/utils/geo.js
  var geoData;
  async function getGeo() {
    if (geoData) {
      return geoData;
    }
    try {
      geoData = await fetch("/api/geo/", {
        method: "GET",
        headers: { Accept: "application/json" }
      }).then((res) => {
        return res.json();
      });
    } catch (e) {
      console.error(e);
    }
    return geoData;
  }

  // src/sciads/plugins/ppid.js
  var ppid;
  function getPublisherProvidedId() {
    return ppid;
  }
  async function hash(message) {
    if (!message) return;
    if (window.location.protocol !== "https:") {
      log("[ads] insecure context, will not pass PPID because crypto hashing is unavailable");
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }
  async function publisherProvidedId() {
    const geo = await getGeo();
    if (geo?.country !== "USA") {
      return;
    }
    if (isOptedOut()) {
      return;
    }
    const user = getUserData();
    const id = user?.["https://sciam.com/user_id"];
    if (!id) return null;
    ppid = await hash(id);
    return ppid;
  }

  // src/sciads/gpt.js
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];
  var gptQueue = [];
  gptQueue.push = (fn) => {
    window.googletag.cmd.push(() => {
      try {
        fn();
      } catch (e) {
        console.log(e);
      }
    });
  };
  function parseSize(sizeStr) {
    if (sizeStr === "fluid") {
      return sizeStr;
    }
    let size = sizeStr.split("x").map((num) => parseInt(num, 10));
    return size;
  }
  function defineSlot(gptAd) {
    const slot = googletag.defineSlot(gptAd.unitpath, gptAd.getSizesForBreakpoint(), gptAd.id);
    const responsiveSizeMapping = googletag.sizeMapping();
    gptAd.breakpoints.forEach((breakpoint) => {
      responsiveSizeMapping.addSize([breakpoint.width, 0], breakpoint.sizes.map(parseSize));
    });
    slot.defineSizeMapping(responsiveSizeMapping.build());
    for (let key in gptAd.targeting) {
      const value = gptAd.targeting[key];
      if (value) {
        slot.setTargeting(key, gptAd.targeting[key]);
      }
    }
    slot.addService(googletag.pubads());
    googletag.display(gptAd.id);
    log(`[ads] GPT slot defined for ${gptAd.id}`, gptAd, slot);
    return slot;
  }
  function setPageLevelTargeting() {
    const targeting = getAdsConfig().targeting;
    log(`[ads] GPT targeting set:`, targeting);
    googletag.setConfig({ targeting });
    log(`[ads] Targeting is now`, googletag.getConfig("targeting"));
  }
  function enableGptServices() {
    log("[ads] GPT Services enabled");
    googletag.setConfig({ singleRequest: true });
    googletag.setConfig({ disableInitialLoad: true });
    googletag.setConfig({ collapseDiv: "ON_NO_FILL" });
    if (isOptedOut()) {
      googletag.setConfig({
        privacyTreatments: { treatments: ["disablePersonalization"] }
      });
    }
    googletag.pubads().setPrivacySettings({
      nonPersonalizedAds: isOptedOut(),
      restrictDataProcessing: isOptedOut(),
      limitedAds: isOptedOut()
      // childDirectedTreatment: false, // @TODO: maybe set this if we can categorize institutions some day
    });
    const ppid2 = getPublisherProvidedId();
    if (ppid2) {
      googletag.pubads().setPublisherProvidedId(ppid2);
      log("[ads] PPID enabled");
    }
    googletag.enableServices();
  }
  function bindGptEventHandlers() {
    googletag.pubads().addEventListener("slotRequested", (event) => {
      trackPerformanceFirstCall();
      const gptAd = getGptAdById(event.slot.getSlotElementId());
      gptAd.called = true;
      gptAd.element.classList.add("is-called");
    });
    googletag.pubads().addEventListener("slotRenderEnded", (event) => {
      trackPerformanceFirstLoad();
      const gptAd = getGptAdById(event.slot.getSlotElementId());
      gptAd.slotRenderedEvent = event;
      const possibleClasses = [
        // No way we got here without these
        "is-called",
        "is-registered",
        "is-empty",
        "is-loaded",
        "is-custom-size",
        "is-fluid-size",
        "is-standard-size"
      ];
      let desiredClasses = ["is-registered", "is-called"];
      desiredClasses.push(event.isEmpty ? "is-empty" : "is-loaded");
      gptAd.loaded = true;
      if (event.size) {
        gptAd.size = event.size;
        let size = event.size;
        if (Array.isArray(size)) {
          size = size.join("x");
        }
        if (IAB_SIZES.includes(size)) {
          desiredClasses.push("is-standard-size");
        } else if (size === "fluid") {
          desiredClasses.push("is-fluid-size");
        } else if (PREMIUM_SIZES.includes(size)) {
          desiredClasses.push("is-premium-size");
        } else {
          desiredClasses.push("is-custom-size");
        }
      }
      possibleClasses.forEach((cls) => {
        if (desiredClasses.includes(cls)) {
          gptAd.element.classList.add(cls);
        } else {
          gptAd.element.classList.remove(cls);
        }
      });
      if (event.isEmpty) {
        log(`[ads] ${gptAd.id}: rendered empty`);
        return;
      }
      log(`[ads] ${gptAd.id}: loaded as ${event.size.join("x")}`);
    });
    googletag.pubads().addEventListener("impressionViewable", (event) => {
      const gptAd = getGptAdById(event.slot.getSlotElementId());
      gptAd.viewableImpression = true;
      log(`[ads] ${gptAd.id}: viewable-impression`);
    });
  }
  function callAds(gptAds2) {
    if (!gptAds2.length) return;
    log("[ads] called:", gptAds2.map((ad) => ad.id).join(", "));
    const slots = gptAds2.map((gptAd) => gptAd.slot);
    gptAds2.forEach((ad) => {
      ad.called = true;
    });
    googletag.pubads().refresh(slots);
  }

  // src/sciads/observers.js
  var OBSERVERS = {};
  function bindLazyLoadIntersectionObserver(gptAd) {
    if (!OBSERVERS["lazyload"]) {
      const lazyLoadDistance = Math.max(window.innerHeight, 750);
      OBSERVERS["lazyload"] = new IntersectionObserver(
        (entries) => {
          entries.map((entry) => {
            const gptAd2 = getGptAdById(entry.target.id);
            gptAd2.inLazyRange = entry.isIntersecting;
          });
        },
        {
          rootMargin: `0px 0px ${lazyLoadDistance}px 0px`
        }
      );
    }
    const observer = OBSERVERS["lazyload"];
    observer.unobserve(gptAd.element);
    observer.observe(gptAd.element);
  }
  function bindRefreshLoadIntersectionObserver(gptAd) {
    if (!OBSERVERS["lazyload-200"]) {
      OBSERVERS["refresh"] = new IntersectionObserver(
        (entries) => {
          entries.map((entry) => {
            const gptAd2 = getGptAdById(entry.target.id);
            gptAd2.inRefreshRange = entry.isIntersecting;
          });
        },
        {
          rootMargin: `0px 0px 0px 0px`
        }
      );
    }
    const observer = OBSERVERS["refresh"];
    observer.unobserve(gptAd.element);
    observer.observe(gptAd.element);
  }
  var BREAKPOINTS = [];
  function handleCrossBreakpoint({ width }) {
    const gptAds2 = getAllAds().filter((gptAd) => {
      const matchingBreakpoint = gptAd.breakpoints.map((bp) => bp.width).includes(width);
      return matchingBreakpoint && gptAd.called;
    }).forEach((gptAd) => {
      gptAd.reset();
    });
  }
  function bindBreakpointObserver(gptAd) {
    gptAd.breakpoints.forEach((bp) => {
      if (BREAKPOINTS.includes(bp)) {
        return;
      }
      BREAKPOINTS.push(bp);
      window.matchMedia(`(min-width: ${bp.width}px)`).addEventListener("change", (e) => {
        handleCrossBreakpoint({ width: bp.width });
      });
      log(`Registered ad breakpoint at ${bp.width}px`);
    });
  }

  // src/sciads/debug.js
  var params = new URLSearchParams(window.location.search);
  var excludedSizes = void 0;
  function debugExcludeSizes(sizes) {
    if (sizes.length === 0) {
      return;
    }
    if (excludedSizes === void 0) {
      excludedSizes = (params.get("debug:ads-exclude") || "").split(",");
      if (excludedSizes.length) {
        log(`[ads] debug:ads-exclude active, filtering out sizes`, excludedSizes);
      }
    }
    if (excludedSizes === null) {
      return sizes;
    }
    sizes = sizes.filter((size) => {
      return excludedSizes.indexOf(size) === -1;
    });
    if (sizes.length === 0) {
      sizes.push("404x1");
    }
    return sizes;
  }

  // src/sciads/models.js
  var adCounter = 0;
  var gptAds = [];
  var adsConfig = {
    unitpath: "",
    targeting: {}
  };
  function setKeyValues(params2) {
    for (let key in params2) {
      adsConfig.targeting[key] = params2[key];
    }
  }
  function setAdsConfig(newConfig, reset = false) {
    if (reset) {
      adsConfig = newConfig;
    } else {
      Object.assign(adsConfig, newConfig);
    }
    if (!adsConfig.unitpath) {
      console.error("unitpath was not set. Ads will not work.");
    }
  }
  function getAdsConfig() {
    return adsConfig;
  }
  var GptAd = class {
    constructor(gptElement) {
      gptElement.classList.add("is-registered");
      this.element = gptElement;
      this.getPropertiesFromElement();
      this.setId();
      this.slotRenderedEvent = null;
      this.called = false;
      this.loaded = false;
      this.empty = false;
      this.viewableImpression = false;
      this.size = null;
      gptQueue.push(() => {
        this.slot = defineSlot(this);
      });
      this.inLazyRange = false;
      this.inRefreshRange = false;
      bindLazyLoadIntersectionObserver(this);
      bindRefreshLoadIntersectionObserver(this);
      bindBreakpointObserver(this);
    }
    /**
     * Clear out the ad and make it eligible for refresh.
     */
    reset() {
      const id = this.element.id;
      this.element.removeAttribute("id");
      this.element.classList.remove("is-registered");
      gptAds.splice(gptAds.indexOf(this), 1);
      log(`[ad] reset for ${id}`);
      requestAnimationFrame(() => {
        registerAds();
      });
    }
    /**
     * Convert HTML into data structure
     */
    getPropertiesFromElement() {
      this.unitpath = adsConfig.unitpath;
      if (this.element.getAttribute("unitpath")) {
        this.unitpath = this.unitpath + "/" + this.element.getAttribute("unitpath");
      }
      const attributes = Object.values(this.element.attributes);
      this.targeting = {};
      attributes.filter((attr) => attr.name.startsWith("targeting-")).forEach((attr) => {
        let key = attr.name.replace(/^targeting-/, "");
        this.targeting[key] = attr.value;
      });
      this.breakpoints = [];
      attributes.filter((attr) => attr.name.startsWith("sizes-from-")).forEach((attr) => {
        let width = parseInt(attr.name.replace(/^sizes-from-/, ""), 10);
        let sizes = attr.value.split(",");
        sizes = debugExcludeSizes(sizes);
        this.breakpoints.push({ width, sizes });
      });
      this.breakpoints = this.breakpoints.sort((a, b) => {
        return a.width - b.width;
      });
    }
    setId() {
      adCounter++;
      const template = this.element.getAttribute("id-format") || "gpt-unit-{}";
      const id = template.replace("{}", adCounter);
      this.id = id;
      this.element.setAttribute("id", id);
    }
    getSizesForBreakpoint() {
      let sizes = [];
      for (let bp of this.breakpoints) {
        if (bp.width <= window.innerWidth) {
          sizes = bp.sizes;
        }
      }
      return sizes;
    }
  };
  function registerAds() {
    [...document.querySelectorAll("gpt-ad:not(.is-registered)")].forEach((el) => {
      let ad = new GptAd(el);
      gptAds.push(ad);
      log(`Registered <gpt-ad> for ${ad.id}`, ad);
    });
  }
  function getGptAdById(id) {
    return gptAds.find((ad) => {
      return ad.id === id;
    });
  }
  function getAllAds() {
    return gptAds;
  }

  // src/sciads/utils/load.js
  function loadScript(src, async = true) {
    const script = document.createElement("script");
    script.src = src;
    if (async) {
      script.setAttribute("async", 1);
    }
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // src/sciads/plugins/mediatrust.js
  function mediaTrust() {
    const src = "https://scripts.webcontentassessor.com/scripts/4ca93f8138ee391320844a5f73486804166750feebd4d600d41de59ec8102b3d";
    return loadScript(src);
  }

  // src/sciads/plugins/polar.js
  function polar() {
    const src = "https://cdn.mediavoice.com/nativeads/script/scientificamerican/pl-track.js";
    const isSponsorContent = window.location.pathname.startsWith("/custom-media/");
    if (isSponsorContent) {
      loadScript(src);
    }
  }

  // src/sciads/plugins/testing.js
  function testingKeyValues() {
    const params2 = new URLSearchParams(window.location.search);
    let targeting = {};
    [...params2.keys()].filter((key) => {
      return key.startsWith("adkv_");
    }).forEach((key) => {
      let value = params2.getAll(key);
      let tkey = key.replace("adkv_", "", 1);
      targeting[tkey] = value;
    });
    setKeyValues(targeting);
  }

  // src/sciads/plugins/entitlements.js
  function getStateKey(uid) {
    return `_ad_user_state-${uid}`;
  }
  var state = {
    features: []
    // Chargebee
  };
  function loadState(uid) {
    try {
      let data = sessionStorage.getItem(getStateKey(uid));
      if (data) {
        state = JSON.parse(data);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
  function userDataTargeting() {
    return new Promise((resolve) => {
      const user = getUserData();
      if (!user) {
        log(`[ads] user not logged in`);
        state.resources = [];
        setKeyValues({ entitlements: ["no"] });
        return resolve();
      }
      const entitlements = user?.features ?? [];
      if (entitlements) {
        state.features = entitlements ?? [];
        setKeyValues({ entitlements: entitlements ?? ["no"] });
        return resolve();
      }
      const uid = user["https://sciam.com/user_id"];
      const hasCachedState = loadState(uid);
      if (hasCachedState) {
        log(`[ads] using entitlements from session cache`, state);
        resolve();
      }
    });
  }
  function getIsAdFree() {
    const cb_adfree = (state.features || []).includes("ad-free-access");
    return cb_adfree;
  }

  // src/sciads/plugins/upsapi.js
  function upsapi() {
    log("[ads] creating __uspapi");
    window.__uspapi = function(command, versionRequested, callback) {
      if (command !== "getUSPData") {
        console.error(`Command <${command}> not implemented. Only <getUSPData> is supported.`);
        return;
      }
      const version = 1;
      const noticeGiven = "Y";
      const optedOut = isOptedOut() ? "Y" : "N";
      const limited_service_provider_agreement_member = "-";
      callback(
        {
          version,
          uspString: [version, noticeGiven, optedOut, limited_service_provider_agreement_member].join(
            ""
          )
        },
        true
      );
    };
  }

  // src/sciads/plugins/interests.js
  function interests() {
    if (isOptedOut()) return;
    let travel = readCookie("sciam_interest-travel");
    if (travel) {
      setKeyValues({ travel: travel.split(",") });
    }
  }

  // src/sciads/plugins/index.js
  var PERF_KEYS2 = {
    pluginsStart: "ads:plugins_start",
    pluginsEnd: "ads:plugins_ready",
    measurePlugins: "ads:measure_plugins"
  };
  async function runPlugins() {
    performance.mark(PERF_KEYS2.pluginsStart);
    await Promise.allSettled([
      upsapi(),
      testingKeyValues(),
      userDataTargeting(),
      mediaTrust(),
      polar(),
      publisherProvidedId(),
      interests()
    ]);
    performance.mark(PERF_KEYS2.pluginsEnd);
    performance.measure(PERF_KEYS2.measurePlugins, PERF_KEYS2.pluginsStart, PERF_KEYS2.pluginsEnd);
    logMeasurement(PERF_KEYS2.measurePlugins, "Ads: plugins complete in");
  }

  // src/sciads/rendering.js
  var _scrollPos = Math.round(window.scrollY);
  function render() {
    let previousScrollPos = _scrollPos;
    _scrollPos = window.scrollY;
    let scrollDelta = Math.abs(previousScrollPos - _scrollPos);
    if (scrollDelta > 500) {
      log("Scrolling too fast - ad render skipped");
      return;
    }
    let adsToRender = getAllAds().filter((gptAd) => {
      return !gptAd.called && gptAd.inLazyRange;
    });
    callAds(adsToRender);
  }

  // src/sciads/utils/testing.js
  var abTestGroup;
  function getABTestGroup() {
    if (abTestGroup !== void 0) {
      return abTestGroup;
    }
    abTestGroup = Math.floor(Math.random() * 10) + 1;
    log(`[ads] ABT group ${abTestGroup}`);
    setKeyValues({ abt: abTestGroup.toString() });
    return abTestGroup;
  }

  // src/sciads/controller.js
  async function initAdsLifeCycle() {
    getABTestGroup();
    registerAds();
    await getConsent();
    const gptSrc = isOptedOut() ? "https://pagead2.googlesyndication.com/tag/js/gpt.js" : "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    loadScript(gptSrc).then(() => {
      log("GPT loaded");
      performance.mark(PERF_KEYS.gptLoaded);
    });
    await runPlugins();
    if (getIsAdFree()) {
      log(`[ads] Premium user, no ads`);
      return;
    }
    gptQueue.push(() => {
      performance.mark(PERF_KEYS.gptQueue);
      log("Started GPT Queue");
      setPageLevelTargeting();
      bindGptEventHandlers();
      enableGptServices();
      render();
      setInterval(() => {
        registerAds();
        render();
      }, 250);
    });
  }

  // src/sciads/commands.js
  var COMMANDS = {
    /**
     * The "pagview" describes the page fo adtech
     * purposes. This starts the lifecycle.
     *
     * @param {adsConfig} adsConfig
     */
    page: function(adsConfig2) {
      performance.mark(PERF_KEYS.page);
      setAdsConfig(adsConfig2, true);
      initAdsLifeCycle();
    },
    get: function(id) {
      console.log(getGptAdById(id));
    }
  };
  function handleCommand(cmdArr) {
    const [cmd, args] = cmdArr;
    log(`SciAds command "${cmd}"`, args);
    const callback = COMMANDS[cmd];
    if (callback) {
      callback(args);
    }
  }

  // src/sciads.js
  performance.mark(PERF_KEYS.libLoaded);
  function createApi() {
    window.__ads = window.__ads || [];
    window.__ads.push = handleCommand;
    window.__ads.forEach(handleCommand);
  }
  function init() {
    log("Hello SciAds");
    createApi();
  }
  init();
})();
//# sourceMappingURL=sciads.js.map
