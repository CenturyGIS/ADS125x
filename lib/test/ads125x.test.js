'use strict';

var _chai = require('chai');

var _ = require('../../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global describe it */

(0, _chai.should)();

describe('Balls', function () {

  // const config = {
  //   drdyPin: 11,
  //   resetPin: 12,
  //   pdwnPin: 13,
  //   csPin: 15,
  //   spiChannel: 1,
  // };

  var a = new _2.default();

  it('should setup an ADC instance', function () {
    console.info(a);
    a.should.be.ok;
  });
});