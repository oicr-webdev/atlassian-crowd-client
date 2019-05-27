'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Attributes = (function () {
  function Attributes(attributePairs) {
    _classCallCheck(this, Attributes);

    this.attributes = attributePairs;
  }

  _createClass(Attributes, [{
    key: 'toCrowd',
    value: function toCrowd() {
      var stringify = arguments.length <= 0 || arguments[0] === undefined ? JSON.stringify : arguments[0];

      // Crowd stores attribute values in an array, which is quite limited. We use only one
      // value per attribute, this value may be of any type since we store it as JSON.
      var attributesArr = [];
      for (var key in this.attributes) {
        if (this.attributes.hasOwnProperty(key)) {
          var value = stringify(this.attributes[key]);
          if (typeof value !== 'string') {
            throw new Error('Attribute value for ' + key + ' should be a string. Check your stringify function.');
          } else if (value.length > 255) {
            throw new Error('Attribute ' + key + ' is too large. Values can be no larger than 255 characters.');
          } else {
            attributesArr.push({
              name: key,
              values: [value]
            });
          }
        }
      }
      return attributesArr;
    }
  }], [{
    key: 'fromCrowd',
    value: function fromCrowd(attributesArr) {
      var parse = arguments.length <= 1 || arguments[1] === undefined ? JSON.parse : arguments[1];

      var attributePairs = {};
      attributesArr.forEach(function (attribute) {
        attributePairs[attribute.name] = parse(attribute.values[0]);
      });
      return new Attributes(attributePairs);
    }
  }]);

  return Attributes;
})();

exports['default'] = Attributes;
module.exports = exports['default'];