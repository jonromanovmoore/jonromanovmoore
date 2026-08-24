(function ($) {
var c = {
    bgcolor: '#333132',
    fgcolor: '#FFF',
    linkcolor: '#FFF',
    infoLink: 'http://royalsociety.org/about-us/website/cookies/',
    ga: '',
    showpopup: function () {
        var CookiesOk = c.getCookie("CookiesOK");
        if (CookiesOk == null) {
            styleData = '<style type="text/css" rel="stylesheet">.cookieConsent { display:block;background-color:' + c.bgcolor + '; bottom: 0 !important; left: 0 !important; position: fixed !important; width: 100% !important; z-index: 99999998 !important; height:40px;}'
            styleData = styleData + '.cookieConsent p {text-align:left;margin:10px;width:98%;font-family:"ULight", helvetica, arial, Sans-Serif; color:' + c.fgcolor + ';} .cookieConsent p input {float:right;} .cookieConsent a {color:' + c.linkcolor + ';text-decoration:underline;}</style>';
            data = styleData + '<div class="cookieConsent"><p><input id="btnHide" type="button" value="Close"  ' + c.ga + '/>We use cookies to help us improve this website. <a href="' + c.infoLink + '">Learn more</a></p></div>';
            $("body").prepend(data);
            $("#btnHide").click(c.dontShow);
        }
    }
            ,
    dontShow: function () {
        var c = new Date();
        c.setDate(c.getDate() + 730);
        document.cookie = "CookiesOK=True; expires=" + c.toUTCString() + "; path=/";
        $(".cookieConsent").hide();
    }
            ,
    getCookie: function (cookieName) {
        var results = document.cookie.match(cookieName);
        if (results)
            return (results);
        else
            return null;
    }
}
c.showpopup();
})(jQuery);;
