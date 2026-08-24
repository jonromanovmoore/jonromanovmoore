(function(window){'use strict';var slice=Array.prototype.slice;function noop(){}
function defineBridget($){if(!$){return;}
function addOptionMethod(PluginClass){if(PluginClass.prototype.option){return;}
PluginClass.prototype.option=function(opts){if(!$.isPlainObject(opts)){return;}
this.options=$.extend(true,this.options,opts);};}
var logError=typeof console==='undefined'?noop:function(message){console.error(message);};function bridge(namespace,PluginClass){$.fn[namespace]=function(options){if(typeof options==='string'){var args=slice.call(arguments,1);for(var i=0,len=this.length;i<len;i++){var elem=this[i];var instance=$.data(elem,namespace);if(!instance){logError("cannot call methods on "+namespace+" prior to initialization; "+
"attempted to call '"+options+"'");continue;}
if(!$.isFunction(instance[options])||options.charAt(0)==='_'){logError("no such method '"+options+"' for "+namespace+" instance");continue;}
var returnValue=instance[options].apply(instance,args);if(returnValue!==undefined){return returnValue;}}
return this;}else{return this.each(function(){var instance=$.data(this,namespace);if(instance){instance.option(options);instance._init();}else{instance=new PluginClass(this,options);$.data(this,namespace,instance);}});}};}
$.bridget=function(namespace,PluginClass){addOptionMethod(PluginClass);bridge(namespace,PluginClass);};return $.bridget;}
if(typeof define==='function'&&define.amd){define(['jquery'],defineBridget);}else if(typeof exports==='object'){defineBridget(require('jquery'));}else{defineBridget(window.jQuery);}})(window);