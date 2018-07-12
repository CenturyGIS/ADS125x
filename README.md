# ADS125x

Analog to Digital conversion with ADS1255 and ADS1256. Tested with Raspberry Pi 3 and [Waveshare High-Precision AD/DA Board](https://www.waveshare.com/wiki/High-Precision_AD/DA_Board) (which uses the ADS1256). The concept for this library was largely borrowed from [PiPyADC](https://github.com/ul-gh/PiPyADC);

![](http://www.ti.com/graphics/folders/partimages/ADS1256.jpg)

## Usage

```js
import { ADS125x } from 'ads125x';

const config = {
  drdyPin: 17,
  resetPin: 18,
  pdwnPin: 27,
  csPin: 22,
  spiChannel: 1,
};

const a = new ADS125x(config);
a.calibrateSelf()
  .then(() => a.wakeup());
```

To read values from a channel, call the `read` function with the specified channel configuration. The following examples uses the `0` channel for the positive reading and the "Analog Input Common" for negative. See [the datasheet](http://www.ti.com/lit/ds/symlink/ads1256.pdf) for more information.

```js
const POS_AIN0   = 0x00;
const NEG_AINCOM = 0x08;

const v = a.read(POS_AIN0 | NEG_AINCOM)
  .then(output => console.info(output));
```

## Test

```
npm test
```
