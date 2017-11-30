'use strict';

var _chai = require('chai');

var _ = require('../../');

/* global describe it */

(0, _chai.should)();

describe('ADS125x', function () {

  var config = {
    drdyPin: 17,
    resetPin: 18,
    pdwnPin: 27,
    csPin: 22,
    spiChannel: 1
  };

  var a = new _.ADS125x(config);

  it('should setup an ADC instance', function () {
    a.should.be.ok;
  });
});