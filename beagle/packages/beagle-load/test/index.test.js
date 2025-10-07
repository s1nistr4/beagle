'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var walk = require('beagle-walk');
var lex = require('beagle-lexer');
var parse = require('beagle-parser');
var load = require('../');

test('beagle-load', () => {
  var filename = __dirname + '/foo.pug';
  var ast = load.file(filename, {
    lex: lex,
    parse: parse,
  });

  ast = walk(
    ast,
    function(node) {
      if (node.filename)
        node.filename = '<dirname>/' + path.basename(node.filename);
      if (node.fullPath)
        node.fullPath = '<dirname>/' + path.basename(node.fullPath);
    },
    {includeDependencies: true}
  );

  expect(ast).toMatchSnapshot();
});
