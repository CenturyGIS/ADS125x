/* global describe it */

import { should } from 'chai';
import ADS125x from '../../';

should();

describe('ADS125x', () => {

  const config = {
    drdyPin: 11,
    resetPin: 12,
    pdwnPin: 13,
    csPin: 15,
    spiChannel: 1,
  };

  const a = new ADS125x(config);

  it('should setup an ADC instance', () => {
    a.should.be.ok;
  });
});
