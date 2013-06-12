var path = require('path');
var through = require('through');
var falafel = require('falafel');

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
    var output = falafel(data, function (node) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require') {
        var els = []
          , moduleName = node.arguments[0].value;

        // additional require arg
        if (node.arguments.length === 2 &&
            (els = node.arguments[1]) &&
            els.type &&
            els.type === 'ArrayExpression') {

          // remove extra require arg
          node.update('require(' + JSON.stringify(moduleName) + ')');
          var entries = els.elements
            .filter(function (el) {
              return el.type === 'Literal' && el.value;
            })
            .map(function (el) {
              return el.value;
            });

          if (entries.length) {
            globals[path.resolve(path.dirname(file), moduleName)] = entries;
          }
        }
      }
    });

    if (file in globals && globals[file].length) {
      var _exports = '{ ';

      globals[file].forEach(function (g, i) {
        if (i > 0) _exports += ', ';
        _exports += JSON.stringify(g) + ': window[' + JSON.stringify(g) + ']';
        _exports[g] = g;
      });

      _exports += ' }';
      output += '\n' + 'module.exports = ' + _exports;
    }
    return output;
  }
};
