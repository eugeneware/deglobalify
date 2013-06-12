var screenfull = require('screenfull', ['screenfull']).screenfull
  , domready = require('domready');

domready(function () {
  var button = document.getElementById('fullscreen');
  console.log('here');
  button.addEventListener('click', function (evt) {
    if (screenfull.enabled) {
      screenfull.toggle(this);
    }
  });
});
