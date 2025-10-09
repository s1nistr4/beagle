"use strict";var assert=require("assert"),isExpression=require("is-expression"),characterParser=require("character-parser"),error=require("beagle-error");module.exports=lex,module.exports.Lexer=Lexer;function lex(a,b){var c=new Lexer(a,b);return JSON.parse(JSON.stringify(c.getTokens()))}/**
 * Initialize `Lexer` with the given `str`.
 *
 * @param {String} str
 * @param {String} filename
 * @api private
 */function Lexer(a,b){if(b=b||{},"string"!=typeof a)throw new Error("Expected source code to be a string but got \""+typeof a+"\"");if("object"!=typeof b)throw new Error("Expected \"options\" to be an object but got \""+typeof b+"\"");//Strip any UTF-8 BOM off of the start of `str`, if it exists.
a=a.replace(/^\uFEFF/,""),this.input=a.replace(/\r\n|\r/g,"\n"),this.originalInput=this.input,this.filename=b.filename,this.interpolated=b.interpolated||!1,this.lineno=b.startingLine||1,this.colno=b.startingColumn||1,this.plugins=b.plugins||[],this.indentStack=[0],this.indentRe=null,this.interpolationAllowed=!0,this.whitespaceRe=/[ \n\t]/,this.tokens=[],this.ended=!1}/**
 * Lexer prototype.
 */Lexer.prototype={constructor:Lexer,error:function(a,b){var c=error(a,b,{line:this.lineno,column:this.colno,filename:this.filename,src:this.originalInput});throw c},assert:function(a,b){a||this.error("ASSERT_FAILED",b)},isExpression:function(a){return isExpression(a,{throw:!0})},assertExpression:function(a,b){//this verifies that a JavaScript expression is valid
try{return this.callLexerFunction("isExpression",a),!0}catch(a){if(b)return!1;// not coming from acorn
if(!a.loc)throw a;this.incrementLine(a.loc.line-1),this.incrementColumn(a.loc.column);var c="Syntax Error: "+a.message.replace(/ \([0-9]+:[0-9]+\)$/,"");this.error("SYNTAX_ERROR",c)}},assertNestingCorrect:function(a){//this verifies that code is properly nested, but allows
//invalid JavaScript such as the contents of `attributes`
var b=characterParser.default(a);b.isNesting()&&this.error("INCORRECT_NESTING","Nesting must match on expression `"+a+"`")},/**
   * Construct a token with the given `type` and `val`.
   *
   * @param {String} type
   * @param {String} val
   * @return {Object}
   * @api private
   */tok:function(a,b){var c={type:a,loc:{start:{line:this.lineno,column:this.colno},filename:this.filename}};return void 0!==b&&(c.val=b),c},/**
   * Set the token's `loc.end` value.
   *
   * @param {Object} tok
   * @returns {Object}
   * @api private
   */tokEnd:function(a){return a.loc.end={line:this.lineno,column:this.colno},a},/**
   * Increment `this.lineno` and reset `this.colno`.
   *
   * @param {Number} increment
   * @api private
   */incrementLine:function(a){this.lineno+=a,a&&(this.colno=1)},/**
   * Increment `this.colno`.
   *
   * @param {Number} increment
   * @api private
   */incrementColumn:function(a){this.colno+=a},/**
   * Consume the given `len` of input.
   *
   * @param {Number} len
   * @api private
   */consume:function(a){this.input=this.input.substr(a)},/**
   * Scan for `type` with the given `regexp`.
   *
   * @param {String} type
   * @param {RegExp} regexp
   * @return {Object}
   * @api private
   */scan:function(a,b){var c;if(c=a.exec(this.input)){var d=c[0].length,e=c[1],f=d-(e?e.length:0),g=this.tok(b,e);return this.consume(d),this.incrementColumn(f),g}},scanEndOfLine:function(a,b){var c;if(c=a.exec(this.input)){var d,e,f=0;(d=/^([ ]+)([^ ]*)/.exec(c[0]))&&(f=d[1].length,this.incrementColumn(f));var g=this.input.substr(c[0].length);if(":"===g[0])return this.input=g,e=this.tok(b,c[1]),this.incrementColumn(c[0].length-f),e;if(/^[ \t]*(\n|$)/.test(g))return this.input=g.substr(/^[ \t]*/.exec(g)[0].length),e=this.tok(b,c[1]),this.incrementColumn(c[0].length-f),e}},/**
   * Return the indexOf `(` or `{` or `[` / `)` or `}` or `]` delimiters.
   *
   * Make sure that when calling this function, colno is at the character
   * immediately before the beginning.
   *
   * @return {Number}
   * @api private
   */bracketExpression:function(a){a=a||0;var b=this.input[a];assert("("===b||"{"===b||"["===b,"The start character should be \"(\", \"{\" or \"[\"");var c,d={"(":")","{":"}","[":"]"}[b];try{c=characterParser.parseUntil(this.input,d,{start:a+1})}catch(b){if(b.index!==void 0){// starting from this.input[skip]
// starting from this.input[0]
for(var e=b.index,f=this.input.substr(a).indexOf("\n"),g=f+a,h=0;e>g&&-1!==f;)this.incrementLine(1),e-=g+1,h+=g+1,f=g=this.input.substr(h).indexOf("\n");this.incrementColumn(e)}throw"CHARACTER_PARSER:END_OF_STRING_REACHED"===b.code?this.error("NO_END_BRACKET","The end of the string reached with no closing bracket "+d+" found."):"CHARACTER_PARSER:MISMATCHED_BRACKET"===b.code&&this.error("BRACKET_MISMATCH",b.message),b}return c},scanIndentation:function(){var a,b;// established regexp
return this.indentRe?a=this.indentRe.exec(this.input):(b=/^\n(\t*) */,a=b.exec(this.input),a&&!a[1].length&&(b=/^\n( *)/,a=b.exec(this.input)),a&&a[1].length&&(this.indentRe=b)),a},/**
   * end-of-source.
   */eos:function(){if(!this.input.length){this.interpolated&&this.error("NO_END_BRACKET","End of line was reached with no closing bracket for interpolation.");for(var a=0;this.indentStack[a];a++)this.tokens.push(this.tokEnd(this.tok("outdent")));return this.tokens.push(this.tokEnd(this.tok("eos"))),this.ended=!0,!0}},/**
   * Blank line.
   */blank:function(){var a;if(a=/^\n[ \t]*\n/.exec(this.input))return this.consume(a[0].length-1),this.incrementLine(1),!0},/**
   * Comment.
   */comment:function(){var a;if(a=/^\/\/(-)?([^\n]*)/.exec(this.input)){this.consume(a[0].length);var b=this.tok("comment",a[2]);return b.buffer="-"!=a[1],this.interpolationAllowed=b.buffer,this.tokens.push(b),this.incrementColumn(a[0].length),this.tokEnd(b),this.callLexerFunction("pipelessText"),!0}},/**
   * Interpolated tag.
   */interpolation:function(){if(/^#\{/.test(this.input)){var a=this.bracketExpression(1);this.consume(a.end+1);var b=this.tok("interpolation",a.src);this.tokens.push(b),this.incrementColumn(2),this.assertExpression(a.src);var c=a.src.split("\n"),d=c.length-1;return this.incrementLine(d),this.incrementColumn(c[d].length+1),this.tokEnd(b),!0}},/**
   * Tag.
   */tag:function(){var a;if(a=/^(\w(?:[-:\w]*\w)?)/.exec(this.input)){var b,c=a[1],d=a[0].length;return this.consume(d),b=this.tok("tag",c),this.tokens.push(b),this.incrementColumn(d),this.tokEnd(b),!0}},/**
   * Filter.
   */filter:function(a){var b=this.scan(/^:([\w\-]+)/,"filter"),c=a&&a.inInclude;if(b)return this.tokens.push(b),this.incrementColumn(b.val.length),this.tokEnd(b),this.callLexerFunction("attrs"),c||(this.interpolationAllowed=!1,this.callLexerFunction("pipelessText")),!0},/**
   * Doctype.
   */doctype:function(){var a=this.scanEndOfLine(/^doctype *([^\n]*)/,"doctype");if(a)return this.tokens.push(this.tokEnd(a)),!0},/**
   * Id.
   */id:function(){var a=this.scan(/^#([\w-]+)/,"id");return a?(this.tokens.push(a),this.incrementColumn(a.val.length),this.tokEnd(a),!0):void(/^#/.test(this.input)&&this.error("INVALID_ID","\""+/.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0]+"\" is not a valid ID."))},/**
   * Class.
   */className:function(){var a=this.scan(/^\.([_a-z0-9\-]*[_a-z][_a-z0-9\-]*)/i,"class");return a?(this.tokens.push(a),this.incrementColumn(a.val.length),this.tokEnd(a),!0):void(/^\.[_a-z0-9\-]+/i.test(this.input)&&this.error("INVALID_CLASS_NAME","Class names must contain at least one letter or underscore."),/^\./.test(this.input)&&this.error("INVALID_CLASS_NAME","\""+/.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0]+"\" is not a valid class name.  Class names can only contain \"_\", \"-\", a-z and 0-9, and must contain at least one of \"_\", or a-z"))},/**
   * Text.
   */endInterpolation:function(){if(this.interpolated&&"]"===this.input[0])return this.input=this.input.substr(1),this.ended=!0,!0},addText:function(a,b,c,d){var e;if(""!==b+c){c=c||"",d=d||0;var f=this.interpolated?b.indexOf("]"):-1,g=this.interpolationAllowed?b.indexOf("#["):-1,h=this.interpolationAllowed?b.indexOf("\\#["):-1,i=/(\\)?([#!]){((?:.|\n)*)$/.exec(b),j=this.interpolationAllowed&&i?i.index:1/0;if(-1===f&&(f=1/0),-1===g&&(g=1/0),-1===h&&(h=1/0),h!==1/0&&h<f&&h<g&&h<j)return c=c+b.substring(0,h)+"#[",this.addText(a,b.substring(h+3),c,d+1);if(g!==1/0&&g<f&&g<h&&g<j){e=this.tok(a,c+b.substring(0,g)),this.incrementColumn(c.length+g+d),this.tokens.push(this.tokEnd(e)),e=this.tok("start-pug-interpolation"),this.incrementColumn(2),this.tokens.push(this.tokEnd(e));var k,l=new this.constructor(b.substr(g+2),{filename:this.filename,interpolated:!0,startingLine:this.lineno,startingColumn:this.colno,plugins:this.plugins});try{k=l.getTokens()}catch(a){throw a.code&&/^PUG:/.test(a.code)&&(this.colno=a.column,this.error(a.code.substr(4),a.msg)),a}return this.colno=l.colno,this.tokens=this.tokens.concat(k),e=this.tok("end-pug-interpolation"),this.incrementColumn(1),this.tokens.push(this.tokEnd(e)),void this.addText(a,l.input)}if(f!==1/0&&f<g&&f<h&&f<j)return c+b.substring(0,f)&&this.addText(a,b.substring(0,f),c),this.ended=!0,void(this.input=b.substr(b.indexOf("]")+1)+this.input);if(j!==1/0){if(i[1])return c=c+b.substring(0,j)+i[2]+"{",this.addText(a,b.substring(j+3),c,d+1);var m=b.substr(0,j);(c||m)&&(m=c+m,e=this.tok(a,m),this.incrementColumn(m.length+d),this.tokens.push(this.tokEnd(e)));var n,o=i[3];e=this.tok("interpolated-code"),this.incrementColumn(2);try{n=characterParser.parseUntil(o,"}")}catch(a){if(void 0!==a.index&&this.incrementColumn(a.index),"CHARACTER_PARSER:END_OF_STRING_REACHED"===a.code)this.error("NO_END_BRACKET","End of line was reached with no closing bracket for interpolation.");else if("CHARACTER_PARSER:MISMATCHED_BRACKET"===a.code)this.error("BRACKET_MISMATCH",a.message);else throw a}return e.mustEscape="#"===i[2],e.buffer=!0,e.val=n.src,this.assertExpression(n.src),void(n.end+1<o.length?(o=o.substr(n.end+1),this.incrementColumn(n.end+1),this.tokens.push(this.tokEnd(e)),this.addText(a,o)):(this.incrementColumn(o.length),this.tokens.push(this.tokEnd(e))))}b=c+b,e=this.tok(a,b),this.incrementColumn(b.length+d),this.tokens.push(this.tokEnd(e))}},text:function(){var a=this.scan(/^(?:\| ?| )([^\n]+)/,"text")||this.scan(/^( )/,"text")||this.scan(/^\|( ?)/,"text");if(a)return this.addText("text",a.val),!0},textHtml:function(){var a=this.scan(/^(<[^\n]*)/,"text-html");if(a)return this.addText("text-html",a.val),!0},/**
   * Dot.
   */dot:function(){var a;if(a=this.scanEndOfLine(/^\./,"dot"))return this.tokens.push(this.tokEnd(a)),this.callLexerFunction("pipelessText"),!0},/**
   * Extends.
   */extends:function(){var a=this.scan(/^extends?(?= |$|\n)/,"extends");return a?(this.tokens.push(this.tokEnd(a)),this.callLexerFunction("path")||this.error("NO_EXTENDS_PATH","missing path for extends"),!0):void(this.scan(/^extends?\b/)&&this.error("MALFORMED_EXTENDS","malformed extends"))},/**
   * Block prepend.
   */prepend:function(){var a;if(a=/^(?:block +)?prepend +([^\n]+)/.exec(this.input)){var b=a[1].trim(),c="";if(-1!==b.indexOf("//")&&(c="//"+b.split("//").slice(1).join("//"),b=b.split("//")[0].trim()),!b)return;for(var d=this.tok("block",b),e=a[0].length-c.length;this.whitespaceRe.test(this.input.charAt(e-1));)e--;return this.incrementColumn(e),d.mode="prepend",this.tokens.push(this.tokEnd(d)),this.consume(a[0].length-c.length),this.incrementColumn(a[0].length-c.length-e),!0}},/**
   * Block append.
   */append:function(){var a;if(a=/^(?:block +)?append +([^\n]+)/.exec(this.input)){var b=a[1].trim(),c="";if(-1!==b.indexOf("//")&&(c="//"+b.split("//").slice(1).join("//"),b=b.split("//")[0].trim()),!b)return;for(var d=this.tok("block",b),e=a[0].length-c.length;this.whitespaceRe.test(this.input.charAt(e-1));)e--;return this.incrementColumn(e),d.mode="append",this.tokens.push(this.tokEnd(d)),this.consume(a[0].length-c.length),this.incrementColumn(a[0].length-c.length-e),!0}},/**
   * Block.
   */block:function(){var a;if(a=/^block +([^\n]+)/.exec(this.input)){var b=a[1].trim(),c="";if(-1!==b.indexOf("//")&&(c="//"+b.split("//").slice(1).join("//"),b=b.split("//")[0].trim()),!b)return;for(var d=this.tok("block",b),e=a[0].length-c.length;this.whitespaceRe.test(this.input.charAt(e-1));)e--;return this.incrementColumn(e),d.mode="replace",this.tokens.push(this.tokEnd(d)),this.consume(a[0].length-c.length),this.incrementColumn(a[0].length-c.length-e),!0}},/**
   * Mixin Block.
   */mixinBlock:function(){var a;if(a=this.scanEndOfLine(/^block/,"mixin-block"))return this.tokens.push(this.tokEnd(a)),!0},/**
   * Yield.
   */yield:function(){var a=this.scanEndOfLine(/^yield/,"yield");if(a)return this.tokens.push(this.tokEnd(a)),!0},/**
   * Include.
   */include:function(){var a=this.scan(/^include(?=:| |$|\n)/,"include");if(a){for(this.tokens.push(this.tokEnd(a));this.callLexerFunction("filter",{inInclude:!0}););return this.callLexerFunction("path")||(/^[^ \n]+/.test(this.input)?this.fail():this.error("NO_INCLUDE_PATH","missing path for include")),!0}this.scan(/^include\b/)&&this.error("MALFORMED_INCLUDE","malformed include")},/**
   * Path
   */path:function(){var a=this.scanEndOfLine(/^ ([^\n]+)/,"path");if(a&&(a.val=a.val.trim()))return this.tokens.push(this.tokEnd(a)),!0},/**
   * Case.
   */case:function(){var a=this.scanEndOfLine(/^case +([^\n]+)/,"case");return a?(this.incrementColumn(-a.val.length),this.assertExpression(a.val),this.incrementColumn(a.val.length),this.tokens.push(this.tokEnd(a)),!0):void(this.scan(/^case\b/)&&this.error("NO_CASE_EXPRESSION","missing expression for case"))},/**
   * When.
   */when:function(){var a=this.scanEndOfLine(/^when +([^:\n]+)/,"when");if(a){for(var b,c=characterParser.default(a.val);(c.isNesting()||c.isString())&&(b=/:([^:\n]+)/.exec(this.input),!!b);)a.val+=b[0],this.consume(b[0].length),this.incrementColumn(b[0].length),c=characterParser.default(a.val);return this.incrementColumn(-a.val.length),this.assertExpression(a.val),this.incrementColumn(a.val.length),this.tokens.push(this.tokEnd(a)),!0}this.scan(/^when\b/)&&this.error("NO_WHEN_EXPRESSION","missing expression for when")},/**
   * Default.
   */default:function(){var a=this.scanEndOfLine(/^default/,"default");return a?(this.tokens.push(this.tokEnd(a)),!0):void(this.scan(/^default\b/)&&this.error("DEFAULT_WITH_EXPRESSION","default should not have an expression"))},/**
   * Call mixin.
   */call:function(){var a,b,c;if(b=/^\+(\s*)(([-\w]+)|(#\{))/.exec(this.input)){// try to consume simple or interpolated call
if(b[3])c=b[0].length,this.consume(c),a=this.tok("call",b[3]);else{// interpolated call
var d=this.bracketExpression(2+b[1].length);c=d.end+1,this.consume(c),this.assertExpression(d.src),a=this.tok("call","#{"+d.src+"}")}// Check for args (not attributes)
if(this.incrementColumn(c),a.args=null,b=/^ *\(/.exec(this.input)){var e=this.bracketExpression(b[0].length-1);if(!/^\s*[-\w]+ *=/.test(e.src)){this.incrementColumn(1),this.consume(e.end+1),a.args=e.src,this.assertExpression("["+a.args+"]");for(var f=0;f<=a.args.length;f++)"\n"===a.args[f]?this.incrementLine(1):this.incrementColumn(1)}}return this.tokens.push(this.tokEnd(a)),!0}},/**
   * Mixin.
   */mixin:function(){var a;if(a=/^mixin +([-\w]+)(?: *\((.*)\))? */.exec(this.input)){this.consume(a[0].length);var b=this.tok("mixin",a[1]);return b.args=a[2]||null,this.incrementColumn(a[0].length),this.tokens.push(this.tokEnd(b)),!0}},/**
   * Conditional.
   */conditional:function(){var a;if(a=/^(if|unless|else if|else)\b([^\n]*)/.exec(this.input)){this.consume(a[0].length);var b=a[1].replace(/ /g,"-"),c=a[2]&&a[2].trim(),d=this.tok(b,c);// type can be "if", "else-if" and "else"
return this.incrementColumn(a[0].length-c.length),"if"===b||"else-if"===b?this.assertExpression(c):"unless"===b?(this.assertExpression(c),d.val="!("+c+")",d.type="if"):"else"===b?c&&this.error("ELSE_CONDITION","`else` cannot have a condition, perhaps you meant `else if`"):void 0,this.incrementColumn(c.length),this.tokens.push(this.tokEnd(d)),!0}},/**
   * While.
   */while:function(){var a,b;return(a=/^while +([^\n]+)/.exec(this.input))?(this.consume(a[0].length),this.assertExpression(a[1]),b=this.tok("while",a[1]),this.incrementColumn(a[0].length),this.tokens.push(this.tokEnd(b)),!0):void(this.scan(/^while\b/)&&this.error("NO_WHILE_EXPRESSION","missing expression for while"))},/**
   * Each.
   */each:function(){var a;if(a=/^(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? * in *([^\n]+)/.exec(this.input)){this.consume(a[0].length);var b=this.tok("each",a[1]);return b.key=a[2]||null,this.incrementColumn(a[0].length-a[3].length),this.assertExpression(a[3]),b.code=a[3],this.incrementColumn(a[3].length),this.tokens.push(this.tokEnd(b)),!0}const c=/^each\b/.exec(this.input)?"each":"for";this.scan(/^(?:each|for)\b/)&&this.error("MALFORMED_EACH","This `"+c+"` has a syntax error. `"+c+"` statements should be of the form: `"+c+" VARIABLE_NAME of JS_EXPRESSION`"),(a=/^- *(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? +in +([^\n]+)/.exec(this.input))&&this.error("MALFORMED_EACH","Pug each and for should no longer be prefixed with a dash (\"-\"). They are pug keywords and not part of JavaScript.")},/**
   * EachOf.
   */eachOf:function(){var a;if(a=/^(?:each|for) (.*?) of *([^\n]+)/.exec(this.input)){this.consume(a[0].length);var b=this.tok("eachOf",a[1]);return b.value=a[1],this.incrementColumn(a[0].length-a[2].length),this.assertExpression(a[2]),b.code=a[2],this.incrementColumn(a[2].length),this.tokens.push(this.tokEnd(b)),/^[a-zA-Z_$][\w$]*$/.test(b.value.trim())||/^\[ *[a-zA-Z_$][\w$]* *\, *[a-zA-Z_$][\w$]* *\]$/.test(b.value.trim())||this.error("MALFORMED_EACH_OF_LVAL","The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."),!0}(a=/^- *(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? +of +([^\n]+)/.exec(this.input))&&this.error("MALFORMED_EACH","Pug each and for should not be prefixed with a dash (\"-\"). They are pug keywords and not part of JavaScript.")},/**
   * Code.
   */code:function(){var a;if(a=/^(!?=|-)[ \t]*([^\n]+)/.exec(this.input)){var b=a[1],c=a[2],d=0;if(this.interpolated){var e;try{e=characterParser.parseUntil(c,"]")}catch(b){if(void 0!==b.index&&this.incrementColumn(a[0].length-c.length+b.index),"CHARACTER_PARSER:END_OF_STRING_REACHED"===b.code)this.error("NO_END_BRACKET","End of line was reached with no closing bracket for interpolation.");else if("CHARACTER_PARSER:MISMATCHED_BRACKET"===b.code)this.error("BRACKET_MISMATCH",b.message);else throw b}d=c.length-e.end,c=e.src}var f=a[0].length-d;this.consume(f);var g=this.tok("code",c);return g.mustEscape="="===b.charAt(0),g.buffer="="===b.charAt(0)||"="===b.charAt(1),this.incrementColumn(a[0].length-a[2].length),g.buffer&&this.assertExpression(c),this.tokens.push(g),this.incrementColumn(c.length),this.tokEnd(g),!0}},/**
   * Block code.
   */blockCode:function(){var a;if(a=this.scanEndOfLine(/^-/,"blockcode"))return this.tokens.push(this.tokEnd(a)),this.interpolationAllowed=!1,this.callLexerFunction("pipelessText"),!0},/**
   * Attribute Name.
   */attribute:function(a){var b,c="",d=/['"]/,e="";// consume all whitespace before the key
for(b=0;b<a.length&&!!this.whitespaceRe.test(a[b]);b++)"\n"===a[b]?this.incrementLine(1):this.incrementColumn(1);if(b===a.length)return"";var f=this.tok("attribute");// quote?
// start looping through the key
for(d.test(a[b])&&(c=a[b],this.incrementColumn(1),b++);b<a.length;b++){if(c){if(a[b]===c){this.incrementColumn(1),b++;break}}else if(this.whitespaceRe.test(a[b])||"!"===a[b]||"="===a[b]||","===a[b])break;e+=a[b],"\n"===a[b]?this.incrementLine(1):this.incrementColumn(1)}f.name=e;var g=this.attributeValue(a.substr(b));for(g.val?(f.val=g.val,f.mustEscape=g.mustEscape):(f.val=!0,f.mustEscape=!0),a=g.remainingSource,this.tokens.push(this.tokEnd(f)),b=0;b<a.length&&!!this.whitespaceRe.test(a[b]);b++)"\n"===a[b]?this.incrementLine(1):this.incrementColumn(1);return","===a[b]&&(this.incrementColumn(1),b++),a.substr(b)},/**
   * Attribute Value.
   */attributeValue:function(a){var b,c,d,e=/['"]/,f="",g=!0,h=characterParser.defaultState(),j=this.colno,k=this.lineno;// consume all whitespace before the equals sign
for(c=0;c<a.length&&!!this.whitespaceRe.test(a[c]);c++)"\n"===a[c]?(k++,j=1):j++;if(c===a.length)return{remainingSource:a};if("!"===a[c]&&(g=!1,j++,c++,"="!==a[c]&&this.error("INVALID_KEY_CHARACTER","Unexpected character "+a[c]+" expected `=`")),"="!==a[c])// check for anti-pattern `div("foo"bar)`
if(0===c&&a&&!this.whitespaceRe.test(a[0])&&","!==a[0])this.error("INVALID_KEY_CHARACTER","Unexpected character "+a[0]+" expected `=`");else return{remainingSource:a};// consume all whitespace before the value
for(this.lineno=k,this.colno=j+1,c++;c<a.length&&!!this.whitespaceRe.test(a[c]);c++)"\n"===a[c]?this.incrementLine(1):this.incrementColumn(1);// start looping through the value
for(k=this.lineno,j=this.colno;c<a.length;c++){// if the character is in a string or in parentheses/brackets/braces
if(!(h.isNesting()||h.isString())){if(this.whitespaceRe.test(a[c])){// find the first non-whitespace character
for(b=!1,d=c;d<a.length;d++)if(!this.whitespaceRe.test(a[d])){// if it is a JavaScript punctuator, then assume that it is
// a part of the value
const c=!characterParser.isPunctuator(a[d]),g=e.test(a[d]),h=":"===a[d],i="..."===a[d]+a[d+1]+a[d+2];(c||g||h||i)&&this.assertExpression(f,!0)&&(b=!0);break}// if everything else is whitespace, return now so last attribute
// does not include trailing whitespace
if(b||d===a.length)break}// if there's no whitespace and the character is not ',', the
// attribute did not end.
if(","===a[c]&&this.assertExpression(f,!0))break}h=characterParser.parseChar(a[c],h),f+=a[c],"\n"===a[c]?(k++,j=1):j++}return this.assertExpression(f),this.lineno=k,this.colno=j,{val:f,mustEscape:g,remainingSource:a.substr(c)}},/**
   * Attributes.
   */attrs:function(){var a;if("("==this.input.charAt(0)){a=this.tok("start-attributes");var b=this.bracketExpression().end,c=this.input.substr(1,b-1);for(this.incrementColumn(1),this.tokens.push(this.tokEnd(a)),this.assertNestingCorrect(c),this.consume(b+1);c;)c=this.attribute(c);return a=this.tok("end-attributes"),this.incrementColumn(1),this.tokens.push(this.tokEnd(a)),!0}},/**
   * &attributes block
   */attributesBlock:function(){if(/^&attributes\b/.test(this.input)){var a=11;this.consume(a);var b=this.tok("&attributes");this.incrementColumn(a);var c=this.bracketExpression();return a=c.end+1,this.consume(a),b.val=c.src,this.incrementColumn(a),this.tokens.push(this.tokEnd(b)),!0}},/**
   * Indent | Outdent | Newline.
   */indent:function(){var b,a=Math.min,c=this.scanIndentation();if(c){var d=c[1].length;// blank line
if(this.incrementLine(1),this.consume(d+1),(" "==this.input[0]||"\t"==this.input[0])&&this.error("INVALID_INDENTATION","Invalid indentation, you can use tabs or spaces but not both"),"\n"==this.input[0])return this.interpolationAllowed=!0,this.tokEnd(this.tok("newline"));// outdent
if(d<this.indentStack[0]){for(var e=0;this.indentStack[0]>d;)this.indentStack[1]<d&&this.error("INCONSISTENT_INDENTATION","Inconsistent indentation. Expecting either "+this.indentStack[1]+" or "+this.indentStack[0]+" spaces/tabs."),e++,this.indentStack.shift();for(;e--;)this.colno=1,b=this.tok("outdent"),this.colno=this.indentStack[0]+1,this.tokens.push(this.tokEnd(b));// indent
}else d&&d!=this.indentStack[0]?(b=this.tok("indent",d),this.colno=1+d,this.tokens.push(this.tokEnd(b)),this.indentStack.unshift(d)):(b=this.tok("newline"),this.colno=1+a(this.indentStack[0]||0,d),this.tokens.push(this.tokEnd(b)));return this.interpolationAllowed=!0,!0}},pipelessText:function b(a){for(;this.callLexerFunction("blank"););var c=this.scanIndentation();if(a=a||c&&c[1].length,a>this.indentStack[0]){this.tokens.push(this.tokEnd(this.tok("start-pipeless-text")));var d,e=[],f=[],g=0;// Index in this.input. Can't use this.consume because we might need to
// retry lexing the block.
do{// text has `\n` as a prefix
var h=this.input.substr(g+1).indexOf("\n");-1==h&&(h=this.input.length-g-1);var j=this.input.substr(g+1,h),k=this.indentRe.exec("\n"+j),l=k&&k[1].length;if(d=l>=a,f.push(d),d=d||!j.trim(),d)g+=j.length+1,e.push(j.substr(a));else if(l>this.indentStack[0])return this.tokens.pop(),b.call(this,k[1].length)}while(this.input.length-g&&d);for(this.consume(g);0===this.input.length&&""===e[e.length-1];)e.pop();return e.forEach(function(b,c){var d;this.incrementLine(1),0!==c&&(d=this.tok("newline")),f[c]&&this.incrementColumn(a),d&&this.tokens.push(this.tokEnd(d)),this.addText("text",b)}.bind(this)),this.tokens.push(this.tokEnd(this.tok("end-pipeless-text"))),!0}},/**
   * Slash.
   */slash:function(){var a=this.scan(/^\//,"slash");if(a)return this.tokens.push(this.tokEnd(a)),!0},/**
   * ':'
   */colon:function(){var a=this.scan(/^: +/,":");if(a)return this.tokens.push(this.tokEnd(a)),!0},fail:function(){this.error("UNEXPECTED_TEXT","unexpected text \""+this.input.substr(0,5)+"\"")},callLexerFunction:function(a){for(var b=[],c=1;c<arguments.length;c++)b.push(arguments[c]);for(var d,e=[this].concat(b),c=0;c<this.plugins.length;c++)if(d=this.plugins[c],d[a]&&d[a].apply(d,e))return!0;return this[a].apply(this,b)},/**
   * Move to the next token
   *
   * @api private
   */advance:function(){return this.callLexerFunction("blank")||this.callLexerFunction("eos")||this.callLexerFunction("endInterpolation")||this.callLexerFunction("yield")||this.callLexerFunction("doctype")||this.callLexerFunction("interpolation")||this.callLexerFunction("case")||this.callLexerFunction("when")||this.callLexerFunction("default")||this.callLexerFunction("extends")||this.callLexerFunction("append")||this.callLexerFunction("prepend")||this.callLexerFunction("block")||this.callLexerFunction("mixinBlock")||this.callLexerFunction("include")||this.callLexerFunction("mixin")||this.callLexerFunction("call")||this.callLexerFunction("conditional")||this.callLexerFunction("eachOf")||this.callLexerFunction("each")||this.callLexerFunction("while")||this.callLexerFunction("tag")||this.callLexerFunction("filter")||this.callLexerFunction("blockCode")||this.callLexerFunction("code")||this.callLexerFunction("id")||this.callLexerFunction("dot")||this.callLexerFunction("className")||this.callLexerFunction("attrs")||this.callLexerFunction("attributesBlock")||this.callLexerFunction("indent")||this.callLexerFunction("text")||this.callLexerFunction("textHtml")||this.callLexerFunction("comment")||this.callLexerFunction("slash")||this.callLexerFunction("colon")||this.fail()},/**
   * Return an array of tokens for the current file
   *
   * @returns {Array.<Token>}
   * @api public
   */getTokens:function(){for(;!this.ended;)this.callLexerFunction("advance");return this.tokens}};