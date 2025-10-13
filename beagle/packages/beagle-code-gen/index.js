"use strict";var _with=_interopRequireDefault(require("with")),_build=_interopRequireDefault(require("beagle-runtime/build")),_beagleAttrs=_interopRequireDefault(require("beagle-attrs")),_constantinople=_interopRequireDefault(require("constantinople")),_doctypes=_interopRequireDefault(require("doctypes")),_beagleError=_interopRequireDefault(require("beagle-error")),_beagleRuntime=_interopRequireDefault(require("beagle-runtime")),_voidElements=_interopRequireDefault(require("void-elements")),_jsStringify=_interopRequireDefault(require("js-stringify"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}const WHITE_SPACE_SENSITIVE_TAGS={pre:!0,textarea:!0},INTERNAL_VARIABLES=["pug","pug_mixins","pug_interp","pug_debug_filename","pug_debug_line","pug_debug_sources","pug_html"];module.exports=generateCode,module.exports.CodeGenerator=Compiler;function generateCode(a,b){return new Compiler(a,b).compile()}function isConstant(a){return(0,_constantinople.default)(a,{pug:_beagleRuntime.default,pug_interp:void 0})}function toConstant(a){return _constantinople.default.toConstant(a,{pug:_beagleRuntime.default,pug_interp:void 0})}function isIdentifier(a){return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(a)}function Compiler(a,b){if(this.options=b=b||{},this.node=a,this.bufferedConcatenationCount=0,this.hasCompiledDoctype=!1,this.hasCompiledTag=!1,this.pp=b.pretty||!1,this.pp&&"string"!=typeof this.pp&&(this.pp="  "),this.pp&&!/^\s+$/.test(this.pp))throw new Error("The pretty parameter should either be a boolean or whitespace only string");if(this.options.templateName&&!isIdentifier(this.options.templateName))throw new Error("The templateName parameter must be a valid JavaScript identifier if specified.");if(this.doctype&&(this.doctype.includes("<")||this.doctype.includes(">")))throw new Error("Doctype can not contain \"<\" or \">\"");if(this.options.globals&&!this.options.globals.every(isIdentifier))throw new Error("The globals option must be an array of valid JavaScript identifiers if specified.");this.debug=!1!==b.compileDebug,this.indents=0,this.parentIndents=0,this.terse=!1,this.mixins={},this.dynamicMixins=!1,this.eachCount=0,b.doctype&&this.setDoctype(b.doctype),this.runtimeFunctionsUsed=[],this.inlineRuntimeFunctions=b.inlineRuntimeFunctions||!1,this.debug&&this.inlineRuntimeFunctions&&this.runtimeFunctionsUsed.push("rethrow")}/**
 * Compiler prototype.
 */Compiler.prototype={runtime:function(a){return this.inlineRuntimeFunctions?(this.runtimeFunctionsUsed.push(a),"pug_"+a):"pug."+a},error:function(a,b,c){let d=(0,_beagleError.default)(b,a,{line:c.line,column:c.column,filename:c.filename});throw d},/**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */compile:function(){if(this.buf=[],this.pp&&this.buf.push("var pug_indent = [];"),this.lastBufferedIdx=-1,this.visit(this.node),!this.dynamicMixins){let c=Object.keys(this.mixins);for(let d of c)if(!d.used)for(var a=0;a<d.instances.length;a++)for(var b=d.instances[a].start;b<d.instances[a].end;b++)this.buf[b]=""}let c=this.buf.join("\n"),d=this.options.globals?this.options.globals.concat(INTERNAL_VARIABLES):INTERNAL_VARIABLES;return c=this.options.self?"var self = locals || {};"+c:(0,_with.default)("locals || {}",c,d.concat(this.runtimeFunctionsUsed.map(function(a){return"pug_"+a}))),this.debug&&(this.options.includeSources&&(c="var pug_debug_sources = "+(0,_jsStringify.default)(this.options.includeSources)+";\n"+c),c="var pug_debug_filename, pug_debug_line;try {"+c+"} catch (err) {"+(this.inlineRuntimeFunctions?"pug_rethrow":"pug.rethrow")+"(err, pug_debug_filename, pug_debug_line"+(this.options.includeSources?", pug_debug_sources[pug_debug_filename]":"")+");}"),(0,_build.default)(this.runtimeFunctionsUsed)+"function "+(this.options.templateName||"template")+"(locals) {var pug_html = \"\", pug_mixins = {}, pug_interp;"+c+";return pug_html;}"},/**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */setDoctype:function(a){this.doctype=_doctypes.default[a.toLowerCase()]||"<!DOCTYPE "+a+">",this.terse="<!doctype html>"==this.doctype.toLowerCase(),this.xml=0==this.doctype.indexOf("<?xml")},/**
   * Buffer the given `str` exactly as is or with interpolation
   *
   * @param {String} str
   * @param {Boolean} interpolate
   * @api public
   */buffer:function(a){a=(0,_jsStringify.default)(a),a=a.substr(1,a.length-2),this.lastBufferedIdx==this.buf.length&&100>this.bufferedConcatenationCount?("code"===this.lastBufferedType&&(this.lastBuffered+=" + \"",this.bufferedConcatenationCount++),this.lastBufferedType="text",this.lastBuffered+=a,this.buf[this.lastBufferedIdx-1]="pug_html = pug_html + "+this.bufferStartChar+this.lastBuffered+"\";"):(this.bufferedConcatenationCount=0,this.buf.push("pug_html = pug_html + \""+a+"\";"),this.lastBufferedType="text",this.bufferStartChar="\"",this.lastBuffered=a,this.lastBufferedIdx=this.buf.length)},/**
   * Buffer the given `src` so it is evaluated at run time
   *
   * @param {String} src
   * @api public
   */bufferExpression:function(a){return isConstant(a)?this.buffer(toConstant(a)+""):void(this.lastBufferedIdx==this.buf.length&&100>this.bufferedConcatenationCount?(this.bufferedConcatenationCount++,"text"===this.lastBufferedType&&(this.lastBuffered+="\""),this.lastBufferedType="code",this.lastBuffered+=" + ("+a+")",this.buf[this.lastBufferedIdx-1]="pug_html = pug_html + ("+this.bufferStartChar+this.lastBuffered+");"):(this.bufferedConcatenationCount=0,this.buf.push("pug_html = pug_html + ("+a+");"),this.lastBufferedType="code",this.bufferStartChar="",this.lastBuffered="("+a+")",this.lastBufferedIdx=this.buf.length))},/**
   * Buffer an indent based on the current `indent`
   * property and an additional `offset`.
   *
   * @param {Number} offset
   * @param {Boolean} newline
   * @api public
   */prettyIndent:function(a,b){a=a||0,b=b?"\n":"",this.buffer(b+Array(this.indents+a).join(this.pp)),this.parentIndents&&this.buf.push("pug_html = pug_html + pug_indent.join(\"\");")},/**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */visit:function(a,b){let c=this.debug;if(!a){let c;throw c=b?"A child of "+b.type+" ("+(b.filename||"Pug")+":"+b.line+")":"A top-level node",c+=" is "+a+", expected a Pug AST Node.",new TypeError(c)}if(c&&!1!==a.debug&&"Block"!==a.type&&a.line){let b=";pug_debug_line = "+a.line;a.filename&&(b+=";pug_debug_filename = "+(0,_jsStringify.default)(a.filename)),this.buf.push(b+";")}if(!this["visit"+a.type]){let c;switch(c=b?"A child of "+b.type:"A top-level node",c+=" ("+(a.filename||"Pug")+":"+a.line+") is of type "+a.type+", which is not supported by beagle-code-gen.",a.type){case"Filter":c+=" Please use beagle-filters to preprocess this AST.";break;case"Extends":case"Include":case"NamedBlock":case"FileReference":c+=" Please use beagle-linker to preprocess this AST."}throw new TypeError(c)}this.visitNode(a)},/**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */visitNode:function(a){return this["visit"+a.type](a)},/**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */visitCase:function(a){this.buf.push("switch ("+a.expr+"){"),this.visit(a.block,a),this.buf.push("}")},/**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */visitWhen:function(a){"default"==a.expr?this.buf.push("default:"):this.buf.push("case "+a.expr+":"),a.block&&(this.visit(a.block,a),this.buf.push("  break;"))},/**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */visitLiteral:function(a){this.buffer(a.str)},visitNamedBlock:function(a){return this.visitBlock(a)},/**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */visitBlock:function(a){let b=this.escapePrettyMode,c=this.pp;// Pretty print multi-line text
c&&1<a.nodes.length&&!b&&"Text"===a.nodes[0].type&&"Text"===a.nodes[1].type&&this.prettyIndent(1,!0);for(let d=0;d<a.nodes.length;++d)c&&0<d&&!b&&"Text"===a.nodes[d].type&&"Text"===a.nodes[d-1].type&&/\n$/.test(a.nodes[d-1].val)&&this.prettyIndent(1,!1),this.visit(a.nodes[d],a)},/**
   * Visit a mixin's `block` keyword.
   *
   * @param {MixinBlock} block
   * @api public
   */visitMixinBlock:function(){this.pp&&this.buf.push("pug_indent.push("+(0,_jsStringify.default)(Array(this.indents+1).join(this.pp))+");"),this.buf.push("block && block();"),this.pp&&this.buf.push("pug_indent.pop();")},/**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */visitDoctype:function(a){a&&(a.val||!this.doctype)&&this.setDoctype(a.val||"html"),this.doctype&&this.buffer(this.doctype),this.hasCompiledDoctype=!0},/**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */visitMixin:function(a){let b="pug_mixins[",c=a.args||"",d=a.block,e=a.attrs,f=this.attributeBlocks(a.attributeBlocks),g=this.pp,h="#"===a.name[0],i=a.name;if(h&&(this.dynamicMixins=!0),b+=(h?a.name.substr(2,a.name.length-3):"\""+a.name+"\"")+"]",this.mixins[i]=this.mixins[i]||{used:!1,instances:[]},a.call){if(this.mixins[i].used=!0,g&&this.buf.push("pug_indent.push("+(0,_jsStringify.default)(Array(this.indents+1).join(g))+");"),d||e.length||f.length){if(this.buf.push(b+".call({"),d){this.buf.push("block: function(){"),this.parentIndents++;let b=this.indents;this.indents=0,this.visit(a.block,a),this.indents=b,this.parentIndents--,e.length||f.length?this.buf.push("},"):this.buf.push("}")}if(f.length){if(e.length){let a=this.attrs(e);f.unshift(a)}1<f.length?this.buf.push("attributes: "+this.runtime("merge")+"(["+f.join(",")+"])"):this.buf.push("attributes: "+f[0])}else if(e.length){let a=this.attrs(e);this.buf.push("attributes: "+a)}c?this.buf.push("}, "+c+");"):this.buf.push("});")}else this.buf.push(b+"("+c+");");g&&this.buf.push("pug_indent.pop();")}else{let e=this.buf.length;c=c?c.split(","):[];let f;c.length&&/^\.\.\./.test(c[c.length-1].trim())&&(f=c.pop().trim().replace(/^\.\.\./,"")),this.buf.push(b+" = pug_interp = function("+c.join(",")+"){"),this.buf.push("var block = (this && this.block), attributes = (this && this.attributes) || {};"),f&&(this.buf.push("var "+f+" = [];"),this.buf.push("for (pug_interp = "+c.length+"; pug_interp < arguments.length; pug_interp++) {"),this.buf.push("  "+f+".push(arguments[pug_interp]);"),this.buf.push("}")),this.parentIndents++,this.visit(d,a),this.parentIndents--,this.buf.push("};");let g=this.buf.length;this.mixins[i].instances.push({start:e,end:g})}},/**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @param {boolean} interpolated
   * @api public
   */visitTag:function(a,b){function c(){b?f.bufferExpression(a.expr):f.buffer(d)}this.indents++;let d=a.name,e=this.pp,f=this;!0===WHITE_SPACE_SENSITIVE_TAGS[a.name]&&(this.escapePrettyMode=!0),this.hasCompiledTag||(!this.hasCompiledDoctype&&"html"==d&&this.visitDoctype(),this.hasCompiledTag=!0),e&&!a.isInline&&this.prettyIndent(0,!0),a.selfClosing||!this.xml&&_voidElements.default[a.name]?(this.buffer("<"),c(),this.visitAttributes(a.attrs,this.attributeBlocks(a.attributeBlocks)),this.terse&&!a.selfClosing?this.buffer(">"):this.buffer("/>"),(a.code||a.block&&("Block"!==a.block.type||0!==a.block.nodes.length)&&a.block.nodes.some(function(a){return"Text"!==a.type||!/^\s*$/.test(a.val)}))&&this.error(d+" is a self closing element: <"+d+"/> but contains nested content.","SELF_CLOSING_CONTENT",a)):(this.buffer("<"),c(),this.visitAttributes(a.attrs,this.attributeBlocks(a.attributeBlocks)),this.buffer(">"),a.code&&this.visitCode(a.code),this.visit(a.block,a),e&&!a.isInline&&!0!==WHITE_SPACE_SENSITIVE_TAGS[a.name]&&!tagCanInline(a)&&this.prettyIndent(0,!0),this.buffer("</"),c(),this.buffer(">")),!0===WHITE_SPACE_SENSITIVE_TAGS[a.name]&&(this.escapePrettyMode=!1),this.indents--},/**
   * Visit InterpolatedTag.
   *
   * @param {InterpolatedTag} tag
   * @api public
   */visitInterpolatedTag:function(a){return this.visitTag(a,!0)},/**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */visitText:function(a){this.buffer(a.val)},/**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */visitComment:function(a){a.buffer&&(this.pp&&this.prettyIndent(1,!0),this.buffer("<!--"+a.val+"-->"))},/**
   * Visit a `YieldBlock`.
   *
   * This is necessary since we allow compiling a file with `yield`.
   *
   * @param {YieldBlock} block
   * @api public
   */visitYieldBlock:function(){},/**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */visitBlockComment:function(a){a.buffer&&(this.pp&&this.prettyIndent(1,!0),this.buffer("<!--"+(a.val||"")),this.visit(a.block,a),this.pp&&this.prettyIndent(1,!0),this.buffer("-->"))},/**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */visitCode:function(a){// Wrap code blocks with {}.
// we only wrap unbuffered code blocks ATM
// since they are usually flow control
// Buffer code
if(a.buffer){let b=a.val.trim();b="null == (pug_interp = "+b+") ? \"\" : pug_interp",!1!==a.mustEscape&&(b=this.runtime("escape")+"("+b+")"),this.bufferExpression(b)}else this.buf.push(a.val);// Block support
a.block&&(!a.buffer&&this.buf.push("{"),this.visit(a.block,a),!a.buffer&&this.buf.push("}"))},/**
   * Visit `Conditional`.
   *
   * @param {Conditional} cond
   * @api public
   */visitConditional:function(a){let b=a.test;this.buf.push("if ("+b+") {"),this.visit(a.consequent,a),this.buf.push("}"),a.alternate&&("Conditional"===a.alternate.type?(this.buf.push("else"),this.visitConditional(a.alternate)):(this.buf.push("else {"),this.visit(a.alternate,a),this.buf.push("}")))},/**
   * Visit `While`.
   *
   * @param {While} loop
   * @api public
   */visitWhile:function(a){let b=a.test;this.buf.push("while ("+b+") {"),this.visit(a.block,a),this.buf.push("}")},/**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */visitEach:function(a){let b=a.key||"pug_index"+this.eachCount;this.eachCount++,this.buf.push("// iterate "+a.obj+"\n;(function(){\n  var $$obj = "+a.obj+";\n  if ('number' == typeof $$obj.length) {"),a.alternate&&this.buf.push("    if ($$obj.length) {"),this.buf.push("      for (var "+b+" = 0, $$l = $$obj.length; "+b+" < $$l; "+b+"++) {\n        var "+a.val+" = $$obj["+b+"];"),this.visit(a.block,a),this.buf.push("      }"),a.alternate&&(this.buf.push("    } else {"),this.visit(a.alternate,a),this.buf.push("    }")),this.buf.push("  } else {\n    var $$l = 0;\n    for (var "+b+" in $$obj) {\n      $$l++;\n      var "+a.val+" = $$obj["+b+"];"),this.visit(a.block,a),this.buf.push("    }"),a.alternate&&(this.buf.push("    if ($$l === 0) {"),this.visit(a.alternate,a),this.buf.push("    }")),this.buf.push("  }\n}).call(this);\n")},visitEachOf:function(a){this.buf.push("// iterate "+a.obj+"\nfor (const "+a.val+" of "+a.obj+") {\n"),this.visit(a.block,a),this.buf.push("}\n")},/**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */visitAttributes:function(a,b){if(b.length){if(a.length){let c=this.attrs(a);b.unshift(c)}1<b.length?this.bufferExpression(this.runtime("attrs")+"("+this.runtime("merge")+"(["+b.join(",")+"]), "+(0,_jsStringify.default)(this.terse)+")"):this.bufferExpression(this.runtime("attrs")+"("+b[0]+", "+(0,_jsStringify.default)(this.terse)+")")}else a.length&&this.attrs(a,!0)},/**
   * Compile attributes.
   */attrs:function(a,b){let c=(0,_beagleAttrs.default)(a,{terse:this.terse,format:b?"html":"object",runtime:this.runtime.bind(this)});return b&&this.bufferExpression(c),c},/**
   * Compile attribute blocks.
   */attributeBlocks:function(a){return a&&a.slice().map(function(a){return a.val})}};function tagCanInline(a){function b(a){// Recurse if the node is a block
return"Block"===a.type?a.nodes.every(b):!("YieldBlock"!==a.type)||"Text"===a.type&&!/\n/.test(a.val)||a.isInline;// When there is a YieldBlock here, it is an indication that the file is
// expected to be included but is not. If this is the case, the block
// must be empty.
}return a.block.nodes.every(b)}