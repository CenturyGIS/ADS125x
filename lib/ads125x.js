'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _wiringPi = require('wiring-pi');

var _wiringPi2 = _interopRequireDefault(_wiringPi);

var _utils = require('./utils');

var _definitions = require('./definitions');

var _definitions2 = _interopRequireDefault(_definitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ADS125x = function () {

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
  function ADS125x(config) {
    _classCallCheck(this, ADS125x);

    var self = this;

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

    _wiringPi2.default.wiringPiSetupPhys();

    var defaults = {
      clkinFrequency: 7680000,
      spiFrequency: 976563,
      spiMode: 1,
      vRef: 2.5
    };

    var conf = Object.assign({}, defaults, config);

    _wiringPi2.default.pinMode(self.drdyPin, _wiringPi2.default.INPUT);

    [self.csPin, conf.resetPin, conf.pdwnPin].forEach(function (p) {
      if (p) {
        _wiringPi2.default.pinMode(p, _wiringPi2.default.OUTPUT);
        _wiringPi2.default.digitalWrite(p, _wiringPi2.default.HIGH);
      }
    });

    var fd = _wiringPi2.default.wiringPiSPISetupMode(self.spiChannel, conf.spiFrequency, conf.spiMode);
    if (!fd) {
      throw new Error('Could not access SPI device file');
    }

    self._dataTimeoutUs = Math.ceil(1 + 50 * 1000000 / conf.clkinFrequency);
    self._syncTimeoutUs = Math.ceil(1 + 24 * 1000000 / conf.clkinFrequency);
    self._csTimeoutUs = Math.ceil(1 + 8 * 1000000 / conf.clkinFrequency);
    self._t11TimeoutUs = Math.ceil(1 + 4 * 1000000 / conf.clkinFrequency);

    (0, _utils.timeDelay)(30).then(function () {
      self.waitDRDY();
      self.reset();
    });
  }

  _createClass(ADS125x, [{
    key: 'calibrateSelf',
    value: function calibrateSelf() {
      this._chipSelect();
      this._sendByte(_definitions2.default.CMD_SELFCAL);
      this.waitDRDY();
      this._chipRelease();
    }
  }, {
    key: '_chipRelease',
    value: function _chipRelease() {
      if (this.csPin) {
        _wiringPi2.default.digitalWrite(this.csPin, _wiringPi2.default.HIGH);
      }
    }
  }, {
    key: '_chipSelect',
    value: function _chipSelect() {
      if (this.csPin) {
        _wiringPi2.default.digitalWrite(this.csPin, _wiringPi2.default.LOW);
      }
    }
  }, {
    key: '_readByte',
    value: function _readByte() {
      var myBuf = Buffer.from([0xFF]);
      _wiringPi2.default.wiringPiSPIDataRW(this.spiChannel, myBuf);
      return myBuf[0];
    }

    /**
     * readOneShot - description
     *
     * @param  {type} diffChannel description
     * @return {type}             description
     */

  }, {
    key: 'readOneShot',
    value: function readOneShot(diffChannel) {
      this._chipSelect();
      this._sendByte(_definitions2.default.CMD_WREG | _definitions2.default.REG_MUX);
      this._sendByte(0x00);
      this._sendByte(diffChannel);

      this._sendByte(_definitions2.default.CMD_SYNC);
      _wiringPi2.default.delayMicroseconds(this._syncTimeoutUs);
      this._sendByte(_definitions2.default.CMD_WAKEUP);

      this.waitDRDY();
      this._sendByte(_definitions2.default.CMD_RDATA);
      _wiringPi2.default.delayMicroseconds(this._dataTimeoutUs);

      var byte3 = this._readByte();
      var byte2 = this._readByte();
      var byte1 = this._readByte();

      this._chipRelease();
      return byte3 << 16 | byte2 << 8 | byte1;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._chipSelect();
      this._sendByte(_definitions2.default.CMD_RESET);
      this.waitDRDY();
      this._chipRelease();
    }
  }, {
    key: '_sendByte',
    value: function _sendByte(byt) {
      return _wiringPi2.default.wiringPiSPIDataRW(this.spiChannel, Buffer.from([byt & 0xFF]));
    }
  }, {
    key: 'wakeup',
    value: function wakeup() {
      this._chipSelect();
      this._sendByte(_definitions2.default.CMD_WAKEUP);
      this.waitDRDY();
      this._chipRelease();
    }
  }, {
    key: 'waitDRDY',
    value: function waitDRDY() {
      var self = this;
      return new _bluebird2.default(function (resolve, reject) {

        if (self.drdyPin) {

          var start = new Date();
          var elapsed = new Date() - start;
          var drdyLevel = _wiringPi2.default.digitalRead(self.drdyPin);

          while (drdyLevel === _wiringPi2.default.HIGH && elapsed < self.drdyTimeout) {
            elapsed = new Date() - start;
            drdyLevel = _wiringPi2.default.digitalRead(self.drdyPin);

            var delay = (0, _utils.timeDelay)(self.drdyDelay);
            while (delay.isPending()) {
              return true;
            }
          }

          if (elapsed >= self.drdyTimeout) {
            reject(new Error('Timeout while polling configured DRDY pin!'));
          }
        } else {
          (0, _utils.timeDelay)(self.drdyTimeout);
        }

        return resolve();
      });
    }
  }]);

  return ADS125x;
}();

exports.default = ADS125x;