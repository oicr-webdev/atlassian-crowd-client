'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Session = (function () {
  function Session(token, createdAt, expiresAt) {
    _classCallCheck(this, Session);

    this.token = token;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
  }

  _createClass(Session, [{
    key: 'toCrowd',
    value: function toCrowd() {
      return {
        'token': this.token,
        'created-date': this.createdAt.getTime(),
        'expiry-date': this.expiresAt.getTime()
      };
    }
  }], [{
    key: 'fromCrowd',
    value: function fromCrowd(_ref) {
      var token = _ref.token;
      var createdAt = _ref['created-date'];
      var expiresAt = _ref['expiry-date'];
      //eslint-disable-line no-dupe-args
      return new Session(token, new Date(createdAt), new Date(expiresAt));
    }
  }]);

  return Session;
})();

exports['default'] = Session;
module.exports = exports['default'];