"use strict";var assert=require("assert"),TokenStream=require("token-stream"),error=require("beagle-error"),inlineTags=require("./lib/inline-tags");module.exports=parse,module.exports.Parser=Parser;function parse(a,b){var c=new Parser(a,b),d=c.parse();return JSON.parse(JSON.stringify(d))}/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @param {Object} options
 * @api public
 */function Parser(a,b){if(b=b||{},!Array.isArray(a))throw new Error("Expected tokens to be an Array but got \""+typeof a+"\"");if("object"!=typeof b)throw new Error("Expected \"options\" to be an object but got \""+typeof b+"\"");this.tokens=new TokenStream(a),this.filename=b.filename,this.src=b.src,this.inMixin=0,this.plugins=b.plugins||[]}/**
 * Parser prototype.
 */Parser.prototype={/**
   * Save original constructor
   */constructor:Parser,error:function(a,b,c){var d=error(a,b,{line:c.loc.start.line,column:c.loc.start.column,filename:this.filename,src:this.src});throw d},/**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */advance:function(){return this.tokens.advance()},/**
   * Single token lookahead.
   *
   * @return {Object}
   * @api private
   */peek:function(){return this.tokens.peek()},/**
   * `n` token lookahead.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */lookahead:function(a){return this.tokens.lookahead(a)},/**
   * Parse input returning a string of js for evaluation.
   *
   * @return {String}
   * @api public
   */parse:function(){for(var a=this.emptyBlock(0);"eos"!=this.peek().type;)if("newline"==this.peek().type)this.advance();else if("text-html"==this.peek().type)a.nodes=a.nodes.concat(this.parseTextHtml());else{var b=this.parseExpr();b&&("Block"===b.type?a.nodes=a.nodes.concat(b.nodes):a.nodes.push(b))}return a},/**
   * Expect the given type, or throw an exception.
   *
   * @param {String} type
   * @api private
   */expect:function(a){return this.peek().type===a?this.advance():void this.error("INVALID_TOKEN","expected \""+a+"\", but got \""+this.peek().type+"\"",this.peek())},/**
   * Accept the given `type`.
   *
   * @param {String} type
   * @api private
   */accept:function(a){if(this.peek().type===a)return this.advance()},initBlock:function(a,b){/* istanbul ignore if */if((0|a)!==a)throw new Error("`line` is not an integer");/* istanbul ignore if */if(!Array.isArray(b))throw new Error("`nodes` is not an array");return{type:"Block",nodes:b,line:a,filename:this.filename}},emptyBlock:function(a){return this.initBlock(a,[])},runPlugin:function(a,b){for(var c=[this],d=2;d<arguments.length;d++)c.push(arguments[d]);for(var e,f,d=0;d<this.plugins.length;d++)if(f=this.plugins[d],f[a]&&f[a][b.type]){if(e)throw new Error("Multiple plugin handlers found for context "+JSON.stringify(a)+", token type "+JSON.stringify(b.type));e=f[a]}if(e)return e[b.type].apply(e,c)},/**
   *   tag
   * | doctype
   * | mixin
   * | include
   * | filter
   * | comment
   * | text
   * | text-html
   * | dot
   * | each
   * | code
   * | yield
   * | id
   * | class
   * | interpolation
   */parseExpr:function(){switch(this.peek().type){case"tag":return this.parseTag();case"mixin":return this.parseMixin();case"block":return this.parseBlock();case"mixin-block":return this.parseMixinBlock();case"case":return this.parseCase();case"extends":return this.parseExtends();case"include":return this.parseInclude();case"doctype":return this.parseDoctype();case"filter":return this.parseFilter();case"comment":return this.parseComment();case"text":case"interpolated-code":case"start-pug-interpolation":return this.parseText({block:!0});case"text-html":return this.initBlock(this.peek().loc.start.line,this.parseTextHtml());case"dot":return this.parseDot();case"each":return this.parseEach();case"eachOf":return this.parseEachOf();case"code":return this.parseCode();case"blockcode":return this.parseBlockCode();case"if":return this.parseConditional();case"while":return this.parseWhile();case"call":return this.parseCall();case"interpolation":return this.parseInterpolation();case"yield":return this.parseYield();case"id":case"class":if(!this.peek().loc.start)debugger;return this.tokens.defer({type:"tag",val:"div",loc:this.peek().loc,filename:this.filename}),this.parseExpr();default:var a=this.runPlugin("expressionTokens",this.peek());if(a)return a;this.error("INVALID_TOKEN","unexpected token \""+this.peek().type+"\"",this.peek())}},parseDot:function(){return this.advance(),this.parseTextBlock()},/**
   * Text
   */parseText:function(a){var b=[],c=this.peek().loc.start.line,d=this.peek();loop:for(;;){switch(d.type){case"text":var e=this.advance();b.push({type:"Text",val:e.val,line:e.loc.start.line,column:e.loc.start.column,filename:this.filename});break;case"interpolated-code":var e=this.advance();b.push({type:"Code",val:e.val,buffer:e.buffer,mustEscape:!1!==e.mustEscape,isInline:!0,line:e.loc.start.line,column:e.loc.start.column,filename:this.filename});break;case"newline":if(!a||!a.block)break loop;var e=this.advance(),f=this.peek().type;("text"===f||"interpolated-code"===f)&&b.push({type:"Text",val:"\n",line:e.loc.start.line,column:e.loc.start.column,filename:this.filename});break;case"start-pug-interpolation":this.advance(),b.push(this.parseExpr()),this.expect("end-pug-interpolation");break;default:var g=this.runPlugin("textTokens",d,b);if(g)break;break loop}d=this.peek()}return 1===b.length?b[0]:this.initBlock(c,b)},parseTextHtml:function(){var a=[],b=null;loop:for(;;)switch(this.peek().type){case"text-html":var c=this.advance();b?b.val+="\n"+c.val:(b={type:"Text",val:c.val,filename:this.filename,line:c.loc.start.line,column:c.loc.start.column,isHtml:!0},a.push(b));break;case"indent":var d=this.block();d.nodes.forEach(function(c){c.isHtml?b?b.val+="\n"+c.val:(b=c,a.push(b)):(b=null,a.push(c))});break;case"code":b=null,a.push(this.parseCode(!0));break;case"newline":this.advance();break;default:break loop}return a},/**
   *   ':' expr
   * | block
   */parseBlockExpansion:function(){var a=this.accept(":");if(a){var b=this.parseExpr();return"Block"===b.type?b:this.initBlock(a.loc.start.line,[b])}return this.block()},/**
   * case
   */parseCase:function(){var a=this.expect("case"),b={type:"Case",expr:a.val,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename},c=this.emptyBlock(a.loc.start.line+1);for(this.expect("indent");"outdent"!=this.peek().type;)switch(this.peek().type){case"comment":case"newline":this.advance();break;case"when":c.nodes.push(this.parseWhen());break;case"default":c.nodes.push(this.parseDefault());break;default:var d=this.runPlugin("caseTokens",this.peek(),c);if(d)break;this.error("INVALID_TOKEN","Unexpected token \""+this.peek().type+"\", expected \"when\", \"default\" or \"newline\"",this.peek())}return this.expect("outdent"),b.block=c,b},/**
   * when
   */parseWhen:function(){var a=this.expect("when");return"newline"===this.peek().type?{type:"When",expr:a.val,debug:!1,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}:{type:"When",expr:a.val,block:this.parseBlockExpansion(),debug:!1,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},/**
   * default
   */parseDefault:function(){var a=this.expect("default");return{type:"When",expr:"default",block:this.parseBlockExpansion(),debug:!1,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},/**
   * code
   */parseCode:function(a){var b=this.expect("code");assert("boolean"==typeof b.mustEscape,"Please update to the newest version of beagle-lexer.");var c={type:"Code",val:b.val,buffer:b.buffer,mustEscape:!1!==b.mustEscape,isInline:!!a,line:b.loc.start.line,column:b.loc.start.column,filename:this.filename};// todo: why is this here?  It seems like a hacky workaround
if(c.val.match(/^ *else/)&&(c.debug=!1),a)return c;var d;// handle block
return d="indent"==this.peek().type,d&&(b.buffer&&this.error("BLOCK_IN_BUFFERED_CODE","Buffered code cannot have a block attached to it",this.peek()),c.block=this.block()),c},parseConditional:function(){var a=this.expect("if"),b={type:"Conditional",test:a.val,consequent:this.emptyBlock(a.loc.start.line),alternate:null,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};// handle block
"indent"==this.peek().type&&(b.consequent=this.block());for(var c=b;;)if("newline"===this.peek().type)this.expect("newline");else if("else-if"===this.peek().type)a=this.expect("else-if"),c=c.alternate={type:"Conditional",test:a.val,consequent:this.emptyBlock(a.loc.start.line),alternate:null,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename},"indent"==this.peek().type&&(c.consequent=this.block());else if("else"===this.peek().type){this.expect("else"),"indent"===this.peek().type&&(c.alternate=this.block());break}else break;return b},parseWhile:function(){var a=this.expect("while"),b={type:"While",test:a.val,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};// handle block
return b.block="indent"==this.peek().type?this.block():this.emptyBlock(a.loc.start.line),b},/**
   * block code
   */parseBlockCode:function(){var a=this.expect("blockcode"),b=a.loc.start.line,c=a.loc.start.column,d=this.peek(),e="";if("start-pipeless-text"===d.type){for(this.advance();"end-pipeless-text"!==this.peek().type;)switch(a=this.advance(),a.type){case"text":e+=a.val;break;case"newline":e+="\n";break;default:var f=this.runPlugin("blockCodeTokens",a,a);if(f){e+=f;break}this.error("INVALID_TOKEN","Unexpected token type: "+a.type,a)}this.advance()}return{type:"Code",val:e,buffer:!1,mustEscape:!1,isInline:!1,line:b,column:c,filename:this.filename}},/**
   * comment
   */parseComment:function(){var a,b=this.expect("comment");return(a=this.parseTextBlock())?{type:"BlockComment",val:b.val,block:a,buffer:b.buffer,line:b.loc.start.line,column:b.loc.start.column,filename:this.filename}:{type:"Comment",val:b.val,buffer:b.buffer,line:b.loc.start.line,column:b.loc.start.column,filename:this.filename}},/**
   * doctype
   */parseDoctype:function(){var a=this.expect("doctype");return{type:"Doctype",val:a.val,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},parseIncludeFilter:function(){var a=this.expect("filter"),b=[];return"start-attributes"===this.peek().type&&(b=this.attrs()),{type:"IncludeFilter",name:a.val,attrs:b,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},/**
   * filter attrs? text-block
   */parseFilter:function(){var a,b=this.expect("filter"),c=[];if("start-attributes"===this.peek().type&&(c=this.attrs()),"text"===this.peek().type){var d=this.advance();a=this.initBlock(d.loc.start.line,[{type:"Text",val:d.val,line:d.loc.start.line,column:d.loc.start.column,filename:this.filename}])}else a="filter"===this.peek().type?this.initBlock(b.loc.start.line,[this.parseFilter()]):this.parseTextBlock()||this.emptyBlock(b.loc.start.line);return{type:"Filter",name:b.val,block:a,attrs:c,line:b.loc.start.line,column:b.loc.start.column,filename:this.filename}},/**
   * each block
   */parseEach:function(){var a=this.expect("each"),b={type:"Each",obj:a.code,val:a.val,key:a.key,block:this.block(),line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return"else"==this.peek().type&&(this.advance(),b.alternate=this.block()),b},parseEachOf:function(){var a=this.expect("eachOf"),b={type:"EachOf",obj:a.code,val:a.val,block:this.block(),line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return b},/**
   * 'extends' name
   */parseExtends:function(){var a=this.expect("extends"),b=this.expect("path");return{type:"Extends",file:{type:"FileReference",path:b.val.trim(),line:b.loc.start.line,column:b.loc.start.column,filename:this.filename},line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},/**
   * 'block' name block
   */parseBlock:function(){var a=this.expect("block"),b="indent"==this.peek().type?this.block():this.emptyBlock(a.loc.start.line);return b.type="NamedBlock",b.name=a.val.trim(),b.mode=a.mode,b.line=a.loc.start.line,b.column=a.loc.start.column,b},parseMixinBlock:function(){var a=this.expect("mixin-block");return this.inMixin||this.error("BLOCK_OUTISDE_MIXIN","Anonymous blocks are not allowed unless they are part of a mixin.",a),{type:"MixinBlock",line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},parseYield:function(){var a=this.expect("yield");return{type:"YieldBlock",line:a.loc.start.line,column:a.loc.start.column,filename:this.filename}},/**
   * include block?
   */parseInclude:function(){for(var a=this.expect("include"),b={type:"Include",file:{type:"FileReference",filename:this.filename},line:a.loc.start.line,column:a.loc.start.column,filename:this.filename},c=[];"filter"===this.peek().type;)c.push(this.parseIncludeFilter());var d=this.expect("path");return b.file.path=d.val.trim(),b.file.line=d.loc.start.line,b.file.column=d.loc.start.column,(/\.jade$/.test(b.file.path)||/\.pug$/.test(b.file.path))&&!c.length?(b.block="indent"==this.peek().type?this.block():this.emptyBlock(a.loc.start.line),/\.jade$/.test(b.file.path)&&console.warn(this.filename+", line "+a.loc.start.line+":\nThe .jade extension is deprecated, use .pug for \""+b.file.path+"\".")):(b.type="RawInclude",b.filters=c,"indent"===this.peek().type&&this.error("RAW_INCLUDE_BLOCK","Raw inclusion cannot contain a block",this.peek())),b},/**
   * call ident block
   */parseCall:function(){var a=this.expect("call"),b=a.val,c=a.args,d={type:"Mixin",name:b,args:c,block:this.emptyBlock(a.loc.start.line),call:!0,attrs:[],attributeBlocks:[],line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return this.tag(d),d.code&&(d.block.nodes.push(d.code),delete d.code),0===d.block.nodes.length&&(d.block=null),d},/**
   * mixin block
   */parseMixin:function(){var a=this.expect("mixin"),b=a.val,c=a.args;if("indent"==this.peek().type){this.inMixin++;var d={type:"Mixin",name:b,args:c,block:this.block(),call:!1,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return this.inMixin--,d}this.error("MIXIN_WITHOUT_BODY","Mixin "+b+" declared without body",a)},/**
   * indent (text | newline)* outdent
   */parseTextBlock:function(){var a=this.accept("start-pipeless-text");if(a){for(var a,b=this.emptyBlock(a.loc.start.line);"end-pipeless-text"!==this.peek().type;)switch(a=this.advance(),a.type){case"text":b.nodes.push({type:"Text",val:a.val,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename});break;case"newline":b.nodes.push({type:"Text",val:"\n",line:a.loc.start.line,column:a.loc.start.column,filename:this.filename});break;case"start-pug-interpolation":b.nodes.push(this.parseExpr()),this.expect("end-pug-interpolation");break;case"interpolated-code":b.nodes.push({type:"Code",val:a.val,buffer:a.buffer,mustEscape:!1!==a.mustEscape,isInline:!0,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename});break;default:var c=this.runPlugin("textBlockTokens",a,b,a);if(c)break;this.error("INVALID_TOKEN","Unexpected token type: "+a.type,a)}return this.advance(),b}},/**
   * indent expr* outdent
   */block:function(){for(var a=this.expect("indent"),b=this.emptyBlock(a.loc.start.line);"outdent"!=this.peek().type;)if("newline"==this.peek().type)this.advance();else if("text-html"==this.peek().type)b.nodes=b.nodes.concat(this.parseTextHtml());else{var c=this.parseExpr();"Block"===c.type?b.nodes=b.nodes.concat(c.nodes):b.nodes.push(c)}return this.expect("outdent"),b},/**
   * interpolation (attrs | class | id)* (text | code | ':')? newline* block?
   */parseInterpolation:function(){var a=this.advance(),b={type:"InterpolatedTag",expr:a.val,selfClosing:!1,block:this.emptyBlock(a.loc.start.line),attrs:[],attributeBlocks:[],isInline:!1,line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return this.tag(b,{selfClosingAllowed:!0})},/**
   * tag (attrs | class | id)* (text | code | ':')? newline* block?
   */parseTag:function(){var a=this.advance(),b={type:"Tag",name:a.val,selfClosing:!1,block:this.emptyBlock(a.loc.start.line),attrs:[],attributeBlocks:[],isInline:-1!==inlineTags.indexOf(a.val),line:a.loc.start.line,column:a.loc.start.column,filename:this.filename};return this.tag(b,{selfClosingAllowed:!0})},/**
   * Parse tag.
   */tag:function(a,b){var c=!1,d=[],e=b&&b.selfClosingAllowed;// (attrs | class | id)*
out:for(;;)switch(this.peek().type){case"id":case"class":var f=this.advance();"id"===f.type&&(-1!==d.indexOf("id")&&this.error("DUPLICATE_ID","Duplicate attribute \"id\" is not allowed.",f),d.push("id")),a.attrs.push({name:f.type,val:"'"+f.val+"'",line:f.loc.start.line,column:f.loc.start.column,filename:this.filename,mustEscape:!1});continue;case"start-attributes":c&&console.warn(this.filename+", line "+this.peek().loc.start.line+":\nYou should not have pug tags with multiple attributes."),c=!0,a.attrs=a.attrs.concat(this.attrs(d));continue;case"&attributes":var f=this.advance();a.attributeBlocks.push({type:"AttributeBlock",val:f.val,line:f.loc.start.line,column:f.loc.start.column,filename:this.filename});break;default:var g=this.runPlugin("tagAttributeTokens",this.peek(),a,d);if(g)break;break out}// check immediate '.'
// (text | code | ':')?
switch("dot"==this.peek().type&&(a.textOnly=!0,this.advance()),this.peek().type){case"text":case"interpolated-code":var h=this.parseText();"Block"===h.type?a.block.nodes.push.apply(a.block.nodes,h.nodes):a.block.nodes.push(h);break;case"code":a.block.nodes.push(this.parseCode(!0));break;case":":this.advance();var j=this.parseExpr();a.block="Block"===j.type?j:this.initBlock(a.line,[j]);break;case"newline":case"indent":case"outdent":case"eos":case"start-pipeless-text":case"end-pug-interpolation":break;case"slash":if(e){this.advance(),a.selfClosing=!0;break}default:var g=this.runPlugin("tagTokens",this.peek(),a,b);if(g)break;this.error("INVALID_TOKEN","Unexpected token `"+this.peek().type+"` expected `text`, `interpolated-code`, `code`, `:`"+(e?", `slash`":"")+", `newline` or `eos`",this.peek())}// newline*
for(;"newline"==this.peek().type;)this.advance();// block?
if(a.textOnly)a.block=this.parseTextBlock()||this.emptyBlock(a.line);else if("indent"==this.peek().type)for(var k=this.block(),l=0,m=k.nodes.length;l<m;++l)a.block.nodes.push(k.nodes[l]);return a},attrs:function(a){this.expect("start-attributes");for(var b=[],c=this.advance();"attribute"===c.type;)"class"!==c.name&&a&&(-1!==a.indexOf(c.name)&&this.error("DUPLICATE_ATTRIBUTE","Duplicate attribute \""+c.name+"\" is not allowed.",c),a.push(c.name)),b.push({name:c.name,val:c.val,line:c.loc.start.line,column:c.loc.start.column,filename:this.filename,mustEscape:!1!==c.mustEscape}),c=this.advance();return this.tokens.defer(c),this.expect("end-attributes"),b}};