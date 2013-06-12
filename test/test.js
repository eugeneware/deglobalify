var screenfull = require('screenfull', ['screenfull']).screenfull
  , domready = require('domready')
  , myfunc = require('./vendor/badmodule', ['myfunc']).myfunc;

domready(function () {
  var button = document.getElementById('fullscreen');
  console.log(myfunc());
  console.log(window.myfunc());
  console.log('here');
  button.addEventListener('click', function (evt) {
    if (screenfull.enabled) {
      screenfull.toggle(this);
    }
  });
});
