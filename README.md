# ADS125x

Analog to Digital conversion with ADS1255 and ADS1256. Tested with Raspberry Pi 3 and [Waveshare High-Precision AD/DA Board](https://www.waveshare.com/wiki/High-Precision_AD/DA_Board) (which uses the ADS1256). The concept for this library was largely borrowed from [PiPyADC](https://github.com/ul-gh/PiPyADC);

![](http://www.ti.com/graphics/folders/partimages/ADS1256.jpg)

## Usage

```js
import ADC125x from 'ads125x';

const config = {
  drdyPin: 11,
  resetPin: 12,
  pdwnPin: 13,
  csPin: 15,
  spiChannel: 1,
};

const a = new Ads1256(config);
a.calibrateSelf();
a.wakeup();
```

To read values from a channel, call the `readOneShot` function with the specified channel configuration. The following examples uses the `0` channel for the positive reading and the "Analog Input Common" for negative. See [the datasheet](http://www.ti.com/lit/ds/symlink/ads1256.pdf) for more information.

```js
const POS_AIN0   = 0x00;
const NEG_AINCOM = 0x08;

let ch = POS_AIN1 | NEG_AINCOM;
const v = a.readOneShot(ch);
```

## Test

```
npm test
```