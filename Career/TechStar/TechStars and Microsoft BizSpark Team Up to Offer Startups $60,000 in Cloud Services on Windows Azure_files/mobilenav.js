define(['jquery','mmenu'],function($,mmenu){var $=window.jQuery;var site;if($('body').hasClass('prnuk')){site='prnuk';}else if($('body').hasClass('cnw')){site='cnw';}else if($('body').hasClass('prncom_international')||$('body').hasClass('international-news-detail')||$('body').hasClass('arabic_hebrew')||$('body').hasClass('prweb-site')){site='prncom-intl'}else if($('body').hasClass('prnj')||$('header').hasClass('prnmedia')){site='prnj';}else{site='prncom';}
var currentPagepath=window.location.href;var prnMobileNav;(prnMobileNav=function prnMobileNav(site){require([],function(){var navMobile=$('nav#nav-mobile');var navTabHelpers=$('.mobile-nav-tabs');var navTabs=[];$.each(navTabHelpers,function(i,v){var tabValue=$(v).val();var tabName=tabValue.charAt(0)+tabValue.substr(1);var tabNameFormatted=tabValue.replace(/\s+/g,'-').toLowerCase();var tabLink=$(v).data('link');if(site=='prncom-intl'){var tab='<li class="tab"><a class="tier-one panel-link" href="'+
tabLink+
'">'+
tabName+
'</a></li>';}else{var tab='<li class="tab"><a class="tier-one panel-link '+
tabNameFormatted+
'" href="#mm-panel-'+
tabNameFormatted+
'">'+
tabName+
'</a></li>';if(tabValue=='profnet'){tab='<li class="tab"><a class="tier-one panel-link '+
tabNameFormatted+
'" href="'+
tabLink+
'">'+
tabName+
'</a></li>';}}
navTabs.push(tab);});navMobile.mmenu({extensions:['border-full'],offCanvas:{zposition:'front'},iconPanels:true,counters:true,keyboardNavigation:{enable:true,enhance:true},navbar:{add:true,title:null},navbars:[{position:'top',content:['close'],height:1},{position:'top',content:navTabs,height:1}]});var api=navMobile.data('mmenu');var headerIcons=$('.header-mobile a.dropdown-toggle, .header-mobile .lang-switcher');api.bind('open',function(){if($(window).width()<481){$(headerIcons).fadeOut();}
$('#mm-panel-contact a[role="tab"]').on('show.bs.tab',function(e){var target=e.currentTarget.hash.replace('#','');$('.contact-nav').selectpicker('val',target);api.close();});});api.bind('open',function(){this.path=window.location.pathname.replace(/\/$/,'');var self=this;var match=false;if(self.path!='/prncom'&&!match){if(self.path.indexOf('-list')>-1){var p=self.path.substr(0,self.path.lastIndexOf('/'));}else{var p=self.path;if(window.location.hash){p=p+window.location.hash;}}
$.each($('#nav-mobile li:not(.mm-footer) a:not(.panel-link,.mm-title,.mm-btn,.mm-next)'),function(){var l=$(this).attr('href').replace(/\/$/,'').replace(/\/#/,'#');self.hash=window.location.hash||null;if(p.indexOf('contact-us')>-1&&p.indexOf('#')<0&&self.hash===null){p=p+'#general';}
if(p===l){match=true;api.setSelected($(this).parent('li'));api.openPanel($(this).closest('.mm-panel'));return false;}});if(!match){var p=self.path;if((p.match(new RegExp('/','g'))||[]).length>2){p=self.path.substr(0,self.path.lastIndexOf('/'));}
if(p.indexOf('news-releases')>-1){p='/news-releases';}
switch(p){case '/news-releases':api.openPanel($('#mm-panel-news'));break;case '/solutions':api.openPanel($('#mm-panel-products'));break;case '/knowledge-center':api.openPanel($('#mm-panel-resources'));break;case '/blog':api.openPanel($('#mm-panel-resources'));case '/contact-us':api.openPanel($('#mm-panel-contact'));}}}});api.bind('openPanel',function(){var currentSection=$('.mm-panel.mm-opened').find('ul').data('section');if(currentSection){$('.panel-link').removeClass('active');$('.panel-link[href="#mm-panel-'+currentSection+'"]').addClass('active');}});api.bind('closing',function(){if($(window).width()<481){$(headerIcons).fadeIn();}});$('.mm-close').click(function(){api.close();});var resizeTimer;$(window).on('resize',function(e){clearTimeout(resizeTimer);resizeTimer=setTimeout(function(){if($(window).width()>769){api.close();}},250);});});})(site);return prnMobileNav;});