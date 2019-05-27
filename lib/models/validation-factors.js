"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ValidationFactors = (function () {
  function ValidationFactors(validationFactorPairs) {
    _classCallCheck(this, ValidationFactors);

    this.validationFactors = validationFactorPairs;
  }

  _createClass(ValidationFactors, [{
    key: "toCrowd",
    value: function toCrowd() {
      var validationFactorsArr = [];
      for (var name in this.validationFactors) {
        if (this.validationFactors.hasOwnProperty(name)) {
          var value = this.validationFactors[name];
          validationFactorsArr.push({ name: name, value: value });
        }
      }
      return { validationFactors: validationFactorsArr };
    }
  }], [{
    key: "fromCrowd",
    value: function fromCrowd(validationFactorsObj) {
      var validationFactorPairs = {};
      validationFactorsObj.validationFactors.forEach(function (validationFactor) {
        validationFactorPairs[validationFactor.name] = validationFactor.value;
      });
      return new ValidationFactors(validationFactorPairs);
    }
  }]);

  return ValidationFactors;
})();

exports["default"] = ValidationFactors;
module.exports = exports["default"];