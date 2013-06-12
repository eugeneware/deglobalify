var path = require('path');
var through = require('through');
var falafel = require('falafel');
var unparse = require('escodegen').generate;

var globals = {};
module.exports = function (file) {
  if (!/\.js$/.test(file)) return through();
  var data = '';

  var tr = through(write, end);
  return tr;

  function write (buf) { data += buf; }
  function end () {
    var output;
    try { output = parse(); }
    catch (err) {
      this.emit('error', new Error(
        err.toString().replace('Error: ', '') + ' (' + file + ')')
      );
    }

    finish(output);
  }

  function finish (output) {
    tr.queue(String(output));
    tr.queue(null);
  }

  function parse () {
    var fixFile = (file in globals && globals[file].length);
    var members = fixFile ? globals[file] : [];
    var memberName;

    var output = falafel(data, function (node) {
      if (fixFile) {
        if (isMemberExpression(node) &&
            ((node.property.type === 'Identifier' &&
             ~members.indexOf(memberName = node.property.name)) ||
             (node.property.type === 'Literal' &&
              ~members.indexOf(memberName = node.property.value)))) {
          node.object.name = 'exports';
          node.update(unparse(node));
        }
      }

      // is this an extended require('module', ['global1', 'global2'])
      if (isRequire(node) && isExtendedRequire(node)) {
        var els = node.arguments[1]
          , moduleName = node.arguments[0].value;

        // remove extra require arg
        node.arguments = node.arguments.slice(0, 1);
        node.update(unparse(node));
        var entries = els.elements
          .filter(function (el) { return el.type === 'Literal' && el.value; })
          .map(function (el) { return el.value; });
        if (entries.length) {
          // save global mapping for later
          var fileName = path.resolve(path.dirname(file), moduleName);
          if (!fileName.match(/\.js$/)) fileName += '.js';
          globals[fileName] = entries;
        }
      }
    });

    return output;
  }

  function isMemberExpression(node) {
    return node.type === 'MemberExpression' &&
           node.object &&
           node.object.type === 'Identifier' &&
           node.object.name === 'window' &&
           node.property;
  }

  function isRequire(node) {
    return node.type === 'CallExpression' &&
           node.callee.type === 'Identifier' &&
           node.callee.name === 'require';
  }

  function isExtendedRequire(node) {
    var els;
    return node.arguments.length === 2 &&
           (els = node.arguments[1]) &&
           els.type &&
           els.type === 'ArrayExpression';
  }
};
