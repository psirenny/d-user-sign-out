var request = require('superagent');

function Component () {}

Component.prototype.error = function (err) {
  this.model.del('submitting');
  this.model.set('error', err);
  this.redirect();
};

Component.prototype.redirect = function () {
  var model = this.model;
  var error = model.get('error');
  var redirect = model.get('errorRedirect') || model.get('redirect');
  if (error && redirect) return this.app.history.push(redirect);
  if (error) return;
  redirect = model.get('successRedirect') || model.get('redirect');
  if (redirect) return this.app.history.push(redirect);
};

Component.prototype.submit = function (e) {
  if (e) e.preventDefault();
  var self = this;
  var model = this.model;
  var basePath = model.get('basePath') || '';
  var data = model.get('data');
  var origin = model.get('origin') || window.location.origin;
  var path = model.get('path') || '/signout';
  var url = model.get('url') || (origin + basePath + path);

  model.del('error');
  model.set('submitting', true);
  this.emit('submitting');
  request
    .post(url)
    .withCredentials()
    .send(data)
    .end(function (err, res) {
      var error = err || res.body.error;
      if (error) return self.error(error);
      self._submitted(res.body, function (err) {
        model.del('submitting');
        if (err) return self.error(err);
        self.emit('submitted');
        self.redirect();
      });
    });
};

Component.prototype._submitted = function (done) {
  done();
};

module.exports = Component;
