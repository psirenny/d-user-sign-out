'use strict';

var request = require('superagent');

function Component() {}

Component.prototype.error = function (err, redirect) {
  this.model.del('submitting');
  this.model.set('error', err);
  if (!redirect) redirect = this.model.get('errorRedirect');
  if (!redirect) redirect = this.model.get('redirect');
  if (redirect) this.app.history.push(redirect);
};

Component.prototype.submit = function (e) {
  if (e) e.preventDefault();
  var self = this;
  var model = this.model;
  var basePath = model.get('basePath') || '';
  var origin = model.get('origin') || window.location.origin;
  var path = model.get('path') || '/signout';
  var redirect = self.model.get('redirect');
  var errorRedirect = self.model.get('errorRedirect') || redirect;
  var successRedirect = self.model.get('successRedirect') || redirect;
  var url = model.get('url') || (origin + basePath + path);

  model.del('error');
  model.set('submitting', true);
  this.emit('submitting');
  request
    .post(url)
    .withCredentials()
    .end(function (err, res) {
      var error = err || (res.body && res.body.error);
      if (error) return self.error(error);
      self._submitted(res.body || {}, function (err) {
        if (err) return self.error(err, errorRedirect);
        self.emit('submitted');
        if (!successRedirect) return model.del('submitting');
        self.app.history.push(successRedirect);
      });
    });
};

Component.prototype._submitted = function (done) {
  done();
};

module.exports = Component;
