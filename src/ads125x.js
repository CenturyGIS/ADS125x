import Promise from 'bluebird';
import wpi from 'wiring-pi';
import { timeDelay } from './utils';
import Definitions from './definitions';

export default class ADS125x {

  /**
   * constructor - ADS125x
   *
   * @param  {object} config
   * @param  {number} config.csPin Chip Select pin number.
   * @param  {number} config.drdyPin data ready pin
   * @param  {number} config.pdwnPin power down pin number
   * @param  {number} config.resetPin reset pin number
   * @param  {number} [config.clkinFrequency=7680000] Voltage reference impedance (hZ).
   * @param  {number} [config.drdyDelay=.000001] Delay in seconds to avoid busy
   * wait and reduce CPU load when polling the DRDY pin.
   * @param  {number} [config.drdyTimeout=2] Seconds to wait in case DRDY pin is
   *  not connected or the chip does not respond
   * @param  {number} config.spiChannel SPI channel
   * @param  {number} [config.spiFrequency=976563] SPI clock rate (hZ).
   * @param  {number} [config.spiMode=1] SPI Mode
   * @param  {number} [config.vRef=2.5] Reference voltage.
   * @return {ADS125x}        description
   */
  constructor(config) {
    const self = this;

    self.spiChannel = config.spiChannel;
    self.drdyPin = config.drdyPin;
    self.csPin = config.csPin;
    self.drdyTimeout = config.drdyTimeout || 2;
    self.drdyDelay = config.drdyDelay || 0.000001;

    if (!config.spiChannel) {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    wpi.wiringPiSetupPhys();

    const defaults = {
      clkinFrequency: 7680000,
      spiFrequency: 976563,
      spiMode: 1,
      vRef: 2.5,
    };

    const conf = Object.assign({}, defaults, config);

    wpi.pinMode(self.drdyPin, wpi.INPUT);

    [self.csPin, conf.resetPin, conf.pdwnPin].forEach((p) => {
      if (p) {
        wpi.pinMode(p, wpi.OUTPUT);
        wpi.digitalWrite(p, wpi.HIGH);
      }
    });

    const fd = wpi.wiringPiSPISetupMode(self.spiChannel, conf.spiFrequency, conf.spiMode);
    if (!fd) {
      throw new Error('Could not access SPI device file');
    }

    self._dataTimeoutUs = Math.ceil(1 + ((50 * 1000000) / conf.clkinFrequency));
    self._syncTimeoutUs = Math.ceil(1 + ((24 * 1000000) / conf.clkinFrequency));
    self._csTimeoutUs = Math.ceil(1 + ((8 * 1000000) / conf.clkinFrequency));
    self._t11TimeoutUs = Math.ceil(1 + ((4 * 1000000) / conf.clkinFrequency));

    timeDelay(30)
      .then(() => {
        self.waitDRDY();
        self.reset();
      });
  }

  calibrateSelf() {
    this._chipSelect();
    this._sendByte(Definitions.CMD_SELFCAL);
    this.waitDRDY();
    this._chipRelease();
  }

  _chipRelease() {
    if (this.csPin) {
      wpi.digitalWrite(this.csPin, wpi.HIGH);
    }
  }

  _chipSelect() {
    if (this.csPin) {
      wpi.digitalWrite(this.csPin, wpi.LOW);
    }
  }

  _readByte() {
    const myBuf = Buffer.from([0xFF]);
    wpi.wiringPiSPIDataRW(this.spiChannel, myBuf);
    return myBuf[0];
  }

  /**
   * readOneShot - description
   *
   * @param  {type} diffChannel description
   * @return {type}             description
   */
  readOneShot(diffChannel) {
    this._chipSelect();
    this._sendByte(Definitions.CMD_WREG | Definitions.REG_MUX);
    this._sendByte(0x00);
    this._sendByte(diffChannel);

    this._sendByte(Definitions.CMD_SYNC);
    wpi.delayMicroseconds(this._syncTimeoutUs);
    this._sendByte(Definitions.CMD_WAKEUP);

    this.waitDRDY();
    this._sendByte(Definitions.CMD_RDATA);
    wpi.delayMicroseconds(this._dataTimeoutUs);

    const byte3 = this._readByte();
    const byte2 = this._readByte();
    const byte1 = this._readByte();

    this._chipRelease();
    return (byte3 << 16) | (byte2 << 8) | byte1;
  }

  reset() {
    this._chipSelect();
    this._sendByte(Definitions.CMD_RESET);
    this.waitDRDY();
    this._chipRelease();
  }

  _sendByte(byt) {
    return wpi.wiringPiSPIDataRW(this.spiChannel, Buffer.from([byt & 0xFF]));
  }

  wakeup() {
    this._chipSelect();
    this._sendByte(Definitions.CMD_WAKEUP);
    this.waitDRDY();
    this._chipRelease();
  }

  waitDRDY() {
    const self = this;
    return new Promise((resolve, reject) => {

      if (self.drdyPin) {

        const start = new Date();
        let elapsed = new Date() - start;
        let drdyLevel = wpi.digitalRead(self.drdyPin);

        while (drdyLevel === wpi.HIGH && elapsed < self.drdyTimeout) {
          elapsed = new Date() - start;
          drdyLevel = wpi.digitalRead(self.drdyPin);

          const delay = timeDelay(self.drdyDelay);
          while (delay.isPending()) { return true; }
        }

        if (elapsed >= self.drdyTimeout) {
          reject(new Error('Timeout while polling configured DRDY pin!'));
        }
      } else {
        timeDelay(self.drdyTimeout);
      }

      return resolve();
    });
  }
}
