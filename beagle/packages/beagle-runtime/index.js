"use strict";var pug_has_own_property=Object.prototype.hasOwnProperty;/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */exports.merge=pug_merge;function pug_merge(c,a){if(1===arguments.length){for(var b=c[0],d=1;d<c.length;d++)b=pug_merge(b,c[d]);return b}for(var e in a)if("class"==e){var f=c[e]||[];c[e]=(Array.isArray(f)?f:[f]).concat(a[e]||[])}else if("style"===e){var f=pug_style(c[e]);f=f&&";"!==f[f.length-1]?f+";":f;var g=pug_style(a[e]);g=g&&";"!==g[g.length-1]?g+";":g,c[e]=f+g}else c[e]=a[e];return c}/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */exports.classes=pug_classes;function pug_classes_array(a,b){for(var c,d="",e="",f=Array.isArray(b),g=0;g<a.length;g++)c=pug_classes(a[g]),c&&(f&&b[g]&&(c=pug_escape(c)),d=d+e+c,e=" ");return d}function pug_classes_object(a){var b="",c="";for(var d in a)d&&a[d]&&pug_has_own_property.call(a,d)&&(b=b+c+d,c=" ");return b}function pug_classes(a,b){return Array.isArray(a)?pug_classes_array(a,b):a&&"object"==typeof a?pug_classes_object(a):a||""}/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */exports.style=pug_style;function pug_style(a){if(!a)return"";if("object"==typeof a){var b="";for(var c in a)/* istanbul ignore else */pug_has_own_property.call(a,c)&&(b=b+c+":"+a[c]+";");return b}return a+""}/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */exports.attr=pug_attr;function pug_attr(a,b,c,d){if(!1===b||null==b||!b&&("class"===a||"style"===a))return"";if(!0===b)return" "+(d?a:a+"=\""+a+"\"");var e=typeof b;return(("object"==e||"function"===e)&&"function"==typeof b.toJSON&&(b=b.toJSON()),"string"!=typeof b&&(b=JSON.stringify(b),!c&&-1!==b.indexOf("\"")))?" "+a+"='"+b.replace(/'/g,"&#39;")+"'":(c&&(b=pug_escape(b))," "+a+"=\""+b+"\"")}/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */exports.attrs=pug_attrs;function pug_attrs(a,b){var c="";for(var d in a)if(pug_has_own_property.call(a,d)){var e=a[d];if("class"===d){e=pug_classes(e),c=pug_attr(d,e,!1,b)+c;continue}"style"===d&&(e=pug_style(e)),c+=pug_attr(d,e,!1,b)}return c}/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */var pug_match_html=/["&<>]/;exports.escape=pug_escape;function pug_escape(a){var b=""+a,c=pug_match_html.exec(b);if(!c)return a;var d,e,f,g="";for(d=c.index,e=0;d<b.length;d++){switch(b.charCodeAt(d)){case 34:f="&quot;";break;case 38:f="&amp;";break;case 60:f="&lt;";break;case 62:f="&gt;";break;default:continue}e!==d&&(g+=b.substring(e,d)),e=d+1,g+=f}return e===d?g:g+b.substring(e,d)}/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */exports.rethrow=pug_rethrow;function pug_rethrow(a,b,c,d){if(!(a instanceof Error))throw a;if(("undefined"!=typeof window||!b)&&!d)throw a.message+=" on line "+c,a;var e,f,g,h;try{d=d||require("fs").readFileSync(b,{encoding:"utf8"}),e=3,f=d.split("\n"),g=Math.max(c-e,0),h=Math.min(f.length,c+e)}catch(d){return a.message+=" - could not read from "+b+" ("+d.message+")",void pug_rethrow(a,null,c)}// Error context
e=f.slice(g,h).map(function(a,b){var d=b+g+1;return(d==c?"  > ":"    ")+d+"| "+a}).join("\n"),a.path=b;try{a.message=(b||"Pug")+":"+c+"\n"+e+"\n\n"+a.message}catch(a){}throw a}