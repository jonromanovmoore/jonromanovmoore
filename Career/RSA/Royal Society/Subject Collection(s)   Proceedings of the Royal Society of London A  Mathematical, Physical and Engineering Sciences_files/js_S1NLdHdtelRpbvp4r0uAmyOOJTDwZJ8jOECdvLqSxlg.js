/*
  Formalize - version 1.1

  Note: This file depends on the jQuery library.
*/

// Module pattern:
// http://yuiblog.com/blog/2007/06/12/module-pattern
var FORMALIZE = (function($, window, document, undefined) {
  // Private constants.
  var PLACEHOLDER_SUPPORTED = 'placeholder' in document.createElement('input');
  var AUTOFOCUS_SUPPORTED = 'autofocus' in document.createElement('input');
  var IE6 = !!($.browser.msie && parseInt($.browser.version, 10) === 6);
  var IE7 = !!($.browser.msie && parseInt($.browser.version, 10) === 7);

  // Expose innards of FORMALIZE.
  return {
    // FORMALIZE.go
    go: function() {
      for (var i in FORMALIZE.init) {
        FORMALIZE.init[i]();
      }
    },
    // FORMALIZE.init
    init: {
      // FORMALIZE.init.ie6_skin_inputs
      ie6_skin_inputs: function() {
        // Test for Internet Explorer 6.
        if (!IE6 || !$('input, select, textarea').length) {
          // Exit if the browser is not IE6,
          // or if no form elements exist.
          return;
        }

        // For <input type="submit" />, etc.
        var button_regex = /button|submit|reset/;

        // For <input type="text" />, etc.
        var type_regex = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;

        $('input').each(function() {
          var el = $(this);

          // Is it a button?
          if (this.getAttribute('type').match(button_regex)) {
            el.addClass('ie6-button');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6-button-disabled');
            }
          }
          // Or is it a textual input?
          else if (this.getAttribute('type').match(type_regex)) {
            el.addClass('ie6-input');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6-input-disabled');
            }
          }
        });

        $('textarea, select').each(function() {
          /* Is it disabled? */
          if (this.disabled) {
            $(this).addClass('ie6-input-disabled');
          }
        });
      },
      // FORMALIZE.init.autofocus
      autofocus: function() {
        if (AUTOFOCUS_SUPPORTED || !$(':input[autofocus]').length) {
          return;
        }

        $(':input[autofocus]:visible:first').focus();
      },
      // FORMALIZE.init.placeholder
      placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        FORMALIZE.misc.add_placeholder();

        $(':input[placeholder]').each(function() {
          var el = $(this);
          var text = el.attr('placeholder');

          el.focus(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder-text');
            }
          }).blur(function() {
            FORMALIZE.misc.add_placeholder();
          });

          // Prevent <form> from accidentally
          // submitting the placeholder text.
          el.closest('form').submit(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder-text');
            }
          }).bind('reset', function() {
            setTimeout(FORMALIZE.misc.add_placeholder, 50);
          });
        });
      }
    },
    // FORMALIZE.misc
    misc: {
      // FORMALIZE.misc.add_placeholder
      add_placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        $(':input[placeholder]').each(function() {
          var el = $(this);
          var text = el.attr('placeholder');

          if (!el.val() || el.val() === text) {
            el.val(text).addClass('placeholder-text');
          }
        });
      }
    }
  };
// Alias jQuery, window, document.
})(jQuery, this, this.document);

// Automatically calls all functions in FORMALIZE.init
jQuery(document).ready(function() {
  FORMALIZE.go();
});;
/**
 * @todo
 */

Drupal.omega = Drupal.omega || {};

(function($) {
  /**
   * @todo
   */
  var current;
  var previous;
  
  /**
   * @todo
   */
  var setCurrentLayout = function (index) {
    index = parseInt(index);
    previous = current;
    current = Drupal.settings.omega.layouts.order.hasOwnProperty(index) ? Drupal.settings.omega.layouts.order[index] : 'mobile';

    if (previous != current) {      
      $('body').removeClass('responsive-layout-' + previous).addClass('responsive-layout-' + current);      
      $.event.trigger('responsivelayout', {from: previous, to: current});
    }
  };
  
  /**
   * @todo
   */
  Drupal.omega.getCurrentLayout = function () {
    return current;
  };
  
  /**
   * @todo
   */
  Drupal.omega.getPreviousLayout = function () {
    return previous;
  };
  
  /**
   * @todo
   */
  Drupal.omega.crappyBrowser = function () {
    return $.browser.msie && parseInt($.browser.version, 10) < 9;
  };
  
  /**
   * @todo
   */
  Drupal.omega.checkLayout = function (layout) {
    if (Drupal.settings.omega.layouts.queries.hasOwnProperty(layout) && Drupal.settings.omega.layouts.queries[layout]) {
      var output = Drupal.omega.checkQuery(Drupal.settings.omega.layouts.queries[layout]);
      
      if (!output && layout == Drupal.settings.omega.layouts.primary) {
        var dummy = $('<div id="omega-check-query"></div>').prependTo('body');       

        dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-check-query { z-index: 100; }</style><![endif]-->');
        
        output = parseInt(dummy.css('z-index')) == 100;

        dummy.remove();
      }
      
      return output;
    }

    return false;
  };
  
  /**
   * @todo
   */
  Drupal.omega.checkQuery = function (query) {
    var dummy = $('<div id="omega-check-query"></div>').prependTo('body');       
    
    dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
    dummy.append('<style media="' + query + '">#omega-check-query { z-index: 100; }</style>');

    var output = parseInt(dummy.css('z-index')) == 100;
    
    dummy.remove();

    return output;
  };
  
  /**
   * @todo
   */
  Drupal.behaviors.omegaMediaQueries = {
    attach: function (context) {
      $('body', context).once('omega-mediaqueries', function () {
        var primary = $.inArray(Drupal.settings.omega.layouts.primary, Drupal.settings.omega.layouts.order);
        var dummy = $('<div id="omega-media-query-dummy"></div>').prependTo('body');

        dummy.append('<style media="all">#omega-media-query-dummy { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-media-query-dummy { z-index: ' + primary + '; }</style><![endif]-->');

        for (var i in Drupal.settings.omega.layouts.order) {
          dummy.append('<style media="' + Drupal.settings.omega.layouts.queries[Drupal.settings.omega.layouts.order[i]] + '">#omega-media-query-dummy { z-index: ' + i + '; }</style>');
        }

        $(window).bind('resize.omegamediaqueries', function () {
          setCurrentLayout(dummy.css('z-index'));
        }).load(function () {
          $(this).trigger('resize.omegamediaqueries');
        });
      });
    }
  };
})(jQuery);;
/**
 * @todo
 */

(function($) {
  /**
   * @todo
   */
  Drupal.behaviors.omegaEqualHeights = {
    attach: function (context) {
      $('body', context).once('omega-equalheights', function () {
        $(window).bind('resize.omegaequalheights', function () {
          $($('.equal-height-container').get().reverse()).each(function () {
            var elements = $(this).children('.equal-height-element').css('height', '');
            
            if (!Drupal.behaviors.hasOwnProperty('omegaMediaQueries') || Drupal.omega.getCurrentLayout() != 'mobile') {
              var tallest = 0;

              elements.each(function () {    
                if ($(this).height() > tallest) {
                  tallest = $(this).height();
                }
              }).each(function() {
                if ($(this).height() < tallest) {
                  $(this).css('height', tallest);
                }
              });
            }
          });
        }).load(function () {
          $(this).trigger('resize.omegaequalheights');
        });
      });
    }
  };
})(jQuery);;
/**
 * This function returns the current matching Breakpoint layout using
 * enquire.js. Falls back to legacy Drupal.omega.getCurrentLayout();
 *
 * An example where this is used is the onActivate method for clueTip popups.
 */
 
Drupal.highwireResponsive = Drupal.highwireResponsive || {};
 
(function($) {

  var baseLayout = 'mobile';
  var current = baseLayout;
  var previous = baseLayout;
  var order = [];
  var index = 0;
  var breakpointsReady = false;

  /**
   * Fired when breakpoint matches
   */
  var breakpointMatch = function(key){
    previous = current || baseLayout;
    current = key;
    triggerTransition();
  }

  /**
   * Fired when breakpoint unmatches
   */
  var breakpointUnmatch = function(key){
    previous = key;
    var i = order.indexOf(key);
    current = order[i-1] || baseLayout;
    triggerTransition();
  }

  /**
   * Return the current layout for the page, based on Breakpoint media queries.
   * Fall back to legacy Drupal.omega.getCurrentLayout().
   *
   * @param bool distinctMobileLayouts
   *  If false, will group all the mobile layouts into a single "mobile" layout.
   *  Defaults to false.
   *
   * @return
   *  A string matching the current breakpoint layout name based on viewport size.
   *
   * @see Drupal.highwireResponsive.getMobileLayouts
   */
  Drupal.highwireResponsive.getCurrentLayout = function (distinctMobileLayouts) {
    if (typeof distinctMobileLayouts == 'undefined') {
      distinctMobileLayouts = false;
    }
    if (breakpointsReady) {
      if (!distinctMobileLayouts && Drupal.highwireResponsive.isCurrentLayoutMobile(current)) {
        return baseLayout;
      }
      else {
        return current;
      }
    }
    else if (typeof Drupal.omega != 'undefined') {
      return Drupal.omega.getCurrentLayout(); // See omega-mediaqueries.js in the Omega theme
    }
  };
  
  /**
   * Return previous layout state
   * Fall back to legacy Drupal.omega.getPreviousLayout().
   *
   * @param bool distinctMobileLayouts
   *  If false, will group all the mobile layouts into a single "mobile" layout.
   *  Defaults to false.
   *  
   * @return
   *  A string matching the previous breakpoint layout name based on viewport size.
   *
   * @see Drupal.highwireResponsive.getMobileLayouts
   */
  Drupal.highwireResponsive.getPreviousLayout = function (distinctMobileLayouts) {
    if (typeof distinctMobileLayouts == 'undefined') {
      distinctMobileLayouts = false;
    }
    if (breakpointsReady) { 
      if (!distinctMobileLayouts && Drupal.highwireResponsive.isCurrentLayoutMobile(previous)) {
        return baseLayout;
      }
      else {
        return previous;
      }
    }
    else if (typeof Drupal.omega != 'undefined') {
      return Drupal.omega.getPreviousLayout(); // See omega-mediaqueries.js in the Omega theme
    }
  };

  /**
   * Determine whether the layout is part of the mobile layout group.
   *
   * @param string layout
   *  The layout to check.
   *
   * @return
   *  True if the layout is part of the mobile group, otherwise false.
   *
   * @see Drupal.highwireResponsive.getMobileLayouts
   */
  Drupal.highwireResponsive.isCurrentLayoutMobile = function (layout) {
    layout = layout || baseLayout;
    var mobileLayouts = Drupal.highwireResponsive.getMobileLayouts();
    if (mobileLayouts.indexOf(layout) != -1) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * Get the layouts that should be grouped together as "mobile".
   *
   * @return
   *  An array of layout keys.
   */
  Drupal.highwireResponsive.getMobileLayouts = function () {
    return [
      'mobile',
      'zero',
      'xsmall'
    ];
  };
  
 /**
  *  This adds responsive body classes, i.e. hw-responsive-layout-narrow 
  *  This also adds a global trigger event which fires on the transition, similar to Omega's resize.responsivelayout event.
  *
  *  // Example
  *  $('body').bind('highwireResponsiveLayoutTransition', function(e, d) {
  *    if(d.from != d.to) {
  *      // Do something when transitioning between any mediaquery state
  *    }
  *  });
  */
  var triggerTransition = function() {
    $('body').removeClass('hw-responsive-layout-' + previous).addClass('hw-responsive-layout-' + current); 
    $.event.trigger('highwireResponsiveLayoutTransition', {from: previous, to: current});
  }

  Drupal.behaviors.highwireResponsiveMediaQueries = {
    attach: function (context, settings) {
      if (typeof Drupal.settings.highwireResponsive != 'undefined' &&  Drupal.settings.highwireResponsive.enquire_enabled === 1 && Drupal.settings.highwireResponsive.breakpoints_configured === 1) {
        if (typeof Drupal.settings.highwireResponsive.breakpoints != 'undefined') {
          breakpointsReady = true;
        }
      }
      /**
       * Setup and register enquire.js callbacks based on breakpoints
       * If Breakpoints are configured but no match is made, this will often return 'mobile'.
       * This is done to support mobile-first design - in practice you shouldn't be
       * defining a "mobile" media query as it should be assumed to be the default.
       */
      if (breakpointsReady) {
        // Breakpoints should be defined in order of smallest to largest
        var breakpoints = Drupal.settings.highwireResponsive.breakpoints;
        $.each(breakpoints, function( key, value ) {
          order[index] = key;
          index++;
          enquire.register(value, {
            match : function() {
              breakpointMatch(key);
            },
            unmatch : function() {
              breakpointUnmatch(key);
            }
          });

        });
        // Trigger transition on initial page load
        $(window, context).bind('load', function(){
          triggerTransition();
        });
      }
    }
  };

})(jQuery); 
;
