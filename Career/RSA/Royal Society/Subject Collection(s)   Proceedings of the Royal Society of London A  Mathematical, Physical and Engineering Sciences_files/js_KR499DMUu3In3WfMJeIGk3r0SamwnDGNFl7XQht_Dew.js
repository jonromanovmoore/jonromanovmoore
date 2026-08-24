/**
 * @file
 * JCore theme behaviors.
 */

(function ($) {

  Drupal.behaviors.hwJcore1ThemeScripts = {
    attach: function(context, settings) {
      // Give the login form some love.
      $('#user-login-form .login-submit-link', context).click(function () {
        $('#user-login-form').submit();
        return false;
      });
      
      $('#region-menu .nice-menu > .menuparent > a, .parent-link-disabled .nice-menu > .menuparent > a', context).click(function (event) {
        event.preventDefault();
      });

      // Search icon cross-browser click handler.
      $('#highwire-search-form .form-item-txtsimple .form-text + .icon-search, [id^="search-block-form"] .form-item-search-block-form .form-text + .icon-search, .highwire-quicksearch .button-wrapper.button-mini, .highwire-quicksearch .button-wrapper .icon-search', context).click(function () {
         $(this).parents('form:first').submit();
      });

      // Disable :focus styles on mouse clicks but retain them on keyboard entry
      $("body").on("mousedown", 'a', function(e) {
        $(this).focus(function() {
          $(this).blur();
          $(this).hideFocus=true; //IE
        });
      });
    }
  };
  Drupal.theme.jCarouselButton = function(type) {
    // Add text for buttons for accessibility.
    if(type == 'previous') {
      var linkText = "Previous Slide";
    } else if (type == 'next') {
      var linkText = "Next Slide";
    }
    return '<a href="javascript:void(0)"><span class="element-invisible">' + linkText + '</span></a>';
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.RS = {
    attach: function (context, settings) {
      // Displays subject collection items and appends a more link.
      Drupal.jcoreRSCreateSeeAllSubjectCollectionLink(context);

      // Remove peer review links when variant doesn't exist.
      Drupal.jcoreRSRemovePeerReviewLinks(context);

      // Opens link elements in a new window.
      Drupal.jcoreRSOpenLinkElementInNewWindow(context);

      // Fix the peer review tab link.
      Drupal.jcoreRSChangePeerReviewLinks(context);

      // Replaces the author contributor on the homepage featured article carousel.
      Drupal.jcoreRSReplaceContributorOnFeaturedArticleCarousel(context);

      // Add download attribute to download link for article tools.
      Drupal.jcoreRSAddDownloadAttributeToDownloadPdf(context);

      // Add uri to the external login link.
      Drupal.jcoreRSAddUriToExternalLoginLinks(context);

      // Replaces the arrow on the corresponding author under 'author information' on the article page.
      Drupal.jcoreRSReplaceArrowOnContributorAuthorList(context);

      // Adds 'Vol:' as a label to the archive volume navigation elements.
      Drupal.jcoreRSAddLabelToArchiveVolNavigationElements(context);

      // Change the default 'no terms available for' text.
      Drupal.jcoreRSChangeNoTermsAvailableText(context);
    }
  };

  /**
   * Creates and displays the number of subject collection items to show on load and append a see all link.
   */
  Drupal.jcoreRSCreateSeeAllSubjectCollectionLink = function (context) {
    var $subjectCollectionList = $('div.subject-collections .pane-content', context);
    // Set the number (starts at 0 by index) of subject collection items to show on load.
    var subjectCollectionItemMax = 17;
    // Get the li children of the ul.
    var $subjectCollectionItems = $subjectCollectionList.find('ul').children();
    // Create a see all link.
    var collection_page_url = Drupal.settings.basePath + 'collection';
    var $showSeeAllWrapper = $('<div></div>', context);
    var showSeeAllLink = 'See all';
    var subjectCollectionFontAwesomeClasses = 'show-more-subject-collection more-articles-link';
    $showSeeAllWrapper.addClass(subjectCollectionFontAwesomeClasses).html(
      '<a href="' + collection_page_url + '">' + showSeeAllLink + '</a>'
    );

    if ($subjectCollectionItems.length > subjectCollectionItemMax) {
      // Add a hidden class to the rest of the items based on the total number of items to show.
      $subjectCollectionItems.each(function(index) {
        if (index > subjectCollectionItemMax) {
          $(this).addClass('hidden');
        }
      });
    }

    // Append a 'see all' link.
    $subjectCollectionList.find("#collection").append($showSeeAllWrapper);
  };

  /**
   * Opens link elements in a new window.
   */
  Drupal.jcoreRSOpenLinkElementInNewWindow = function (context) {
    // Open PDF files in a new window.
    $('a.panels-ajax-tab-tab[data-panel-name="roysoc_tab_pdf"], ' +
      'a.highwire-article-nav-jumplink[data-panel-ajax-tab="roysoc_tab_pdf"], ' +
      '.pane-highwire-article-data-supp span a, ' +
      '#cc-by-logo .snippet-content a',
      context).unbind('click').attr('target', '_blank');
  };

  /**
   * Alter peer review tab.
   *
   * Panels ajax tabs does some funky altering of the requested page based on
   * tab variables, so to provide the link to the PDF in the tab we need to swap
   * it out so that the file is served over the pane.
   */
  Drupal.jcoreRSChangePeerReviewLinks = function (context) {
    $('a[data-panel-name="roysoc_tab_peer_review"], ' +
      'a[data-panel-ajax-tab="roysoc_tab_peer_review"]',
      context).each(function () {
        var $peerReviewTabLink = $(this);
        var href = $peerReviewTabLink.attr('href');
        var newhref = href.replace('.review-history', '.reviewer-comments.pdf');
        $peerReviewTabLink.once('replace-link').attr('href', newhref);
      });
  };

  /*
   * Replaces the author contributor on the homepage featured article carousel.
   */
  Drupal.jcoreRSReplaceContributorOnFeaturedArticleCarousel = function (context) {
    // The contributor child selector number to replace.
    var contributor_selector_number = 3;

    // Get the third contributor.
    $contributors = $(".pane-hw-article-carousel div.views-field-field-highwire-a-contributors-1 " +
      "span:nth-child(" + contributor_selector_number + ")",
      context);

    // Replace the contributor with 'et al'.
    $contributors.text("et al");
  };

  /**
   * Add download attribute to download link for article tools.
   */
  Drupal.jcoreRSAddDownloadAttributeToDownloadPdf = function (context) {
    var $downloadPDFLink = $('div.pane-roysoc-art-tools .download-pdf .pane-content a', context);
    $downloadPDFLink.attr('download', true);
  };

  /**
   * Add uri to the external login link.
   */
  Drupal.jcoreRSAddUriToExternalLoginLinks = function (context) {
    var $externalLink = $('a.external-login-link', context);

    // Get the external link href element.
    var href = $externalLink.attr("href");

    // Attach the site url to uri if the variable is not empty.
    if (href != "") {
      $externalLink.attr('href', href + '/?uri=' + document.location.origin);
    }
  };

  /**
   * Adds 'Vol:' as a label to the archive volume navigation elements.
   */
  Drupal.jcoreRSAddLabelToArchiveVolNavigationElements = function (context) {
    // Add label to each archive volume navigation elements.
    $('.pane-highwire-issue-archive-vol-nav .issue-browser a, ' +
      '.page-content-by-volume .pane-highwire-issue-archive .pane-content .archive-title, ' +
      '.pane-highwire-issue-archive-vol-nav .issue-browser a.active',
      context).each(function () {
        $(this).prepend('Vol: ').html();
      });
  };

  /**
   * Remove peer review links.
   *
   * While this is also hidden / shown on a site level by satellite bridge module,
   * we also need to add a check on a node level to remove the links when the variant
   * is missing on the article.
   */
  Drupal.jcoreRSRemovePeerReviewLinks = function (context) {
    $('.hide-peer-review-tab a[data-panel-ajax-tab="roysoc_tab_peer_review"], ' +
      '.hide-peer-review-tab a[data-panel-name="roysoc_tab_peer_review"]', context).parent().remove();
  };

  /**
   * Replaces the arrow on the corresponding author under 'author information' on the article page.
   */
  Drupal.jcoreRSReplaceArrowOnContributorAuthorList = function (context) {
    // Replace the arrow in the corresponding reference html link.
    $('.highwire-markup ol.contributor-list .xref-up-link', context).children().html('&nbsp;*');
  };

  /**
   * Replaces the 'No terms available for' text with 'No terms available'.
   */
  Drupal.jcoreRSChangeNoTermsAvailableText = function (context) {
    var $subjectCollectionContent = $('.pane-highwire-subject-collections .pane-content', context);

    if ($subjectCollectionContent.text().trim() == 'No terms available for') {
      $subjectCollectionContent.text("No terms available");
    }
  };

  // Override HighWire drupal behaviour for altmetrics.
  Drupal.behaviors.HighWire_AltMetrics = {

    attach: function (context, settings) {
      // Listening DOM changes on the widget wrapper. The service is a singe JS resource, which either fails or succeed.
      // The is no known way of detecting the success so we need this little trick to hide/show the label and disabled text.
      jQuery('.altmetric-embed', context).bind("DOMSubtreeModified", function () {
        var $this = jQuery(this);
        var $wrapper = $this.parent();
        var $disabledText = jQuery('.altmetrics-disabled', $wrapper);

        var is_success = jQuery('img', $this).length > 0;
        is_success ? $disabledText.hide() : $disabledText.show();
      });
    }
  };

  // Override HighWire drupal behaviour for hwJcore1ThemeScripts.
  Drupal.behaviors.hwJcore1ThemeScripts = {
    attach: function(context, settings) {
      // Give the login form some love.
      $('#user-login-form .login-submit-link', context).click(function () {
        $('#user-login-form').submit();
        return false;
      });

      $('#region-menu .nice-menu > .menuparent > a, .parent-link-disabled .nice-menu > .menuparent > a', context).click(function (event) {
        event.preventDefault();
      });

      // Search icon cross-browser click handler.
      $('#highwire-search-form .form-item-txtsimple .form-text + .icon-search, [id^="search-block-form"] .form-item-search-block-form .form-text + .icon-search, .highwire-quicksearch .button-wrapper.button-mini, .highwire-quicksearch .button-wrapper .icon-search', context).click(function () {
        $(this).parents('form:first').submit();
      });

    }
  };

})(jQuery);
;
