import assert from "assert"
import constantinople from "constantinople"
import runtime from "beagle-runtime"
import stringify from "js-stringify"

interface IAttr {
 name: string
 val: string|boolean
 mustEscape: boolean
}

interface IOptions {
 terse: boolean 
 runtime: (name: string) => string 
 format: "html"|"object"
}

function isConstant(src:string):boolean { return constantinople(src, {pug: runtime, pug_interp: undefined}) }
function toConstant(src:string) { return constantinople.toConstant(src, {pug: runtime, pug_interp: undefined}) }

function compileAttrs(attrs:IAttr[], options:IOptions):string {
  assert(Array.isArray(attrs), 'Attrs should be an array');
  assert(
    attrs.every(function(attr:IAttr) {
      return (
        attr &&
        typeof attr === 'object' &&
        typeof attr.name === 'string' &&
        (typeof attr.val === 'string' || typeof attr.val === 'boolean') &&
        typeof attr.mustEscape === 'boolean'
      );
    }),
    'All attributes should be supplied as an object of the form {name, val, mustEscape}'
  );
  assert(options && typeof options === 'object', 'Options should be an object');
  assert( typeof options.terse === 'boolean', 'Options.terse should be a boolean');
  assert( typeof options.runtime === 'function', 'Options.runtime should be a function that takes a runtime function name and returns the source code that will evaluate to that function at runtime');
  assert( options.format === 'html' || options.format === 'object', 'Options.format should be "html" or "object"');

  let buf:string[] = [];
  let classes: (string|boolean)[] = [];
  let classEscaping:boolean[] = [];

  function addAttribute(key:string, val:string|boolean, mustEscape:boolean, buf:string[]) {
    if (isConstant(val)) {
      if (options.format === 'html') {
        let str:string = stringify( runtime.attr(key, toConstant(val), mustEscape, options.terse));
        let last = buf[buf.length - 1];
        if (last && last[last.length - 1] === str[0]) {
          buf[buf.length - 1] = last.substr(0, last.length - 1) + str.substr(1);
        } else {
          buf.push(str);
        }
      } else {
        val = toConstant(val);
        if (mustEscape) {
          val = runtime.escape(val);
        }
        buf.push(stringify(key) + ': ' + stringify(val));
      }
    } else {
      if (options.format === 'html') {
        buf.push(
          options.runtime('attr') +
            '("' +
            key +
            '", ' +
            val +
            ', ' +
            stringify(mustEscape) +
            ', ' +
            stringify(options.terse) +
            ')'
        );
      } else {
        if (mustEscape) {
          val = options.runtime('escape') + '(' + val + ')';
        }
        buf.push(stringify(key) + ': ' + val);
      }
    }
  }

  attrs.forEach(function(attr:IAttr):void {
    let key = attr.name;
    let val = attr.val;
    let mustEscape = attr.mustEscape;

    if (key === 'class') {
      classes.push(val);
      classEscaping.push(mustEscape);
    } else {
      if (key === 'style') {
        if (isConstant(val)) {
          val = stringify(runtime.style(toConstant(val)));
        } else {
          val = options.runtime('style') + '(' + val + ')';
        }
      }
      addAttribute(key, val, mustEscape, buf);
    }
  });

  let classesBuf:string[] = []

  if (classes.length) {
    if (classes.every(isConstant)) {
      addAttribute(
        'class',
        stringify(runtime.classes(classes.map(toConstant), classEscaping)),
        false,
        classesBuf
      );
    } else {
      classes = classes.map(function(cls, i) {
        if (isConstant(cls)) {
          cls = stringify(
            classEscaping[i] ? runtime.escape(toConstant(cls)) : toConstant(cls)
          );
          classEscaping[i] = false;
        }
        return cls;
      });
      addAttribute(
        'class',
        options.runtime('classes') +
          '([' +
          classes.join(',') +
          '], ' +
          stringify(classEscaping) +
          ')',
        false,
        classesBuf
      );
    }
  }
  buf = classesBuf.concat(buf);
  if (options.format === 'html') return buf.length ? buf.join('+') : '""';
  else return '{' + buf.join(',') + '}';
}

export default compileAttrs
