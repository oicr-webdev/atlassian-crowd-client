'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var User = (function () {
  function User(firstname, lastname, displayname, email, username, password, active, attributes) {
    if (password === undefined) password = undefined;
    if (active === undefined) active = true;

    _classCallCheck(this, User);

    this.firstname = firstname || '';
    this.lastname = lastname || '';
    this.displayname = displayname || '';
    this.email = email;
    this.username = username;
    this.password = password;
    this.active = active;
    this.attributes = attributes ? attributes.attributes : [];
  }

  _createClass(User, [{
    key: 'toCrowd',
    value: function toCrowd() {
      var obj = {
        'name': this.username,
        'first-name': this.firstname,
        'last-name': this.lastname,
        'display-name': this.displayname,
        'email': this.email,
        'active': this.active
      };
      if (this.password) {
        obj.password = { value: this.password };
      }
      return obj;
    }
  }], [{
    key: 'fromCrowd',
    value: function fromCrowd(_ref) {
      var name = _ref.name;
      var active = _ref.active;
      var firstname = _ref['first-name'];
      var lastname = _ref['last-name'];
      var displayname = _ref['display-name'];
      var email = _ref.email;
      var attributes = _ref.attributes;
      //eslint-disable-line no-dupe-args
      return new User(firstname, lastname, displayname, email, name, undefined, active, attributes);
    }
  }]);

  return User;
})();

exports['default'] = User;
module.exports = exports['default'];