# deglobalify

Sick of client javascript modules adding global properties to the ```window``` object?

This [browserify](https://github.com/substack/node-browserify) transform allows 
you to pass in a second parameter to ```require()``` which is an array of
properties that the offending object WOULD have set on ```window``` but will
instead return as part of a proper ```module.exports``` object. Joy!

# Installation

Install deglobalify through npm:

```
$ npm install deglobalify
```

# Example

## The old and bad way...

Say you have this bad client module that pollutes the global ```window``` object:

``` js
// /public/scripts/vendor/badmodule.js
window.myfunc = function() { return 42; };
```

You include it in your browserify code:

```
// /public/scripts/app.js
var domready = require('domready') // regular npm module
  , badmodule = require('./vendor/badmodule.js'); // returns undefined

domready(function () {
  console.log(myfunc());        // prints 42 (global alert!)
  console.log(window.myfunc()); // prints 42 (global alert!)
});
```

Because the bad module pollutes the ```window``` object, you need to get access
to the ```myfunc``` function by referencing the window object.

## The better deglobalify way

Once you know what global ```window``` properties the bad module is clobbering,
you can pass it into the ```require``` function as a list of of properties like
so:

``` js
// /public/scripts/app.js
var domready = require('domready') // regular npm module
  , badmodule = require('./vendor/badmodule.js', ['myfunc']); // returns an exports object

var myfunc = badmodule.myfunc; // myfunc is an export and NOT on the global window

domready(function () {
  console.log(myfunc());        // prints 42 (whoohoo!)
  console.log(window.myfunc()); // throws an exception because window.myfunc is undefined
});
```

Then call ```browserify``` using the deglobalify transform:

```
$ browserify -t deglobalify public/scripts/app.js -o public/build/bundle.js
```

Then incude ```bundle.js``` in your HTML and you're done!

The bad module will return a regular commonjs exports object with your requested
properties on it!

And the ```window``` object won't be clobbered, keeping the world a better and
safer place for all :-)

## Using deglobalify with other transforms

If you're using deglobalify with other Browserify transforms such as
[debowerify](https://github.com/eugeneware/debowerify) (which allows you to easily
use [bower](http://bower.io) components with browserify), or
[decomponentify](https://github.com/eugeneware/decomponentify) (which allows you
to use [component](https://github.com/component/component) components with
browserify, then you are generally better to put deglobalify at the end of the
transform chain:

```
$ browserify -t debowerify -t deamdify -t deglobalify public/scripts/app.js -o public/build/bundle.js
```

Enjoy a global variable free existence and get a peaceful night's rest!
