"use strict";var error=require("beagle-error");module.exports=stripComments;function unexpectedToken(a,b,c,d){throw error("UNEXPECTED_TOKEN","`"+a+"` encountered when "+b,{filename:c,line:d})}function stripComments(a,b){b=b||{};// Default: strip unbuffered comments and leave buffered ones alone
var c=!1!==b.stripUnbuffered,d=!0===b.stripBuffered,e=b.filename,f=!1,g=!1;// If we have encountered a comment token and are not sure if we have gotten
// out of the comment or not
// If we are sure that we are in a block comment and all tokens except
// `end-pipeless-text` should be ignored
return a.filter(function(a){switch(a.type){case"comment":if(f)unexpectedToken("comment","already in a comment",e,a.line);else return f=a.buffer?d:c,!f;case"start-pipeless-text":return!f||(g&&unexpectedToken("start-pipeless-text","already in pipeless text mode",e,a.line),g=!0,!1);case"end-pipeless-text":return!f||(g||unexpectedToken("end-pipeless-text","not in pipeless text mode",e,a.line),g=!1,f=!1,!1);// There might be a `text` right after `comment` but before
// `start-pipeless-text`. Treat it accordingly.
case"text":return!f;default:return!g&&(f=!1,!0)}})}