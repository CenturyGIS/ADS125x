'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ADS125x = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import { timeDelay } from './utils';


var _onoff = require('onoff');

var _spiDevice = require('spi-device');

var _spiDevice2 = _interopRequireDefault(_spiDevice);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _definitions = require('./definitions');

var _definitions2 = _interopRequireDefault(_definitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ADS125x = exports.ADS125x = function () {

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
    self.drdyTimeout = config.drdyTimeout || 2;
    self.drdyDelay = config.drdyDelay || 0.000001;

    if (!config.spiChannel) {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    var defaults = {
      clkinFrequency: 7680000,
      spiFrequency: 976563,
      spiMode: 1,
      vRef: 2.5
    };

    var conf = Object.assign({}, defaults, config);

    self.drdy = new _onoff.Gpio(config.drdyPin, 'in', 'both');

    self._isDrdyPromise = new _bluebird2.default(function (resolve, reject) {
      self._isDrdyResolve = resolve;
      self._isDrdyReject = reject;
    });

    self.drdy.watch(function (err, value) {

      if (err) {
        console.error(err);
        self._isDrdyReject && self._isDrdyReject(err);
        throw err;
      }

      if (!value) {
        self._isDrdyResolve();
      } else {
        self._isDrdyPromise = new _bluebird2.default(function (resolve, reject) {
          self._isDrdyResolve = resolve;
          self._isDrdyReject = reject;
        });
      }
    });

    process.on('SIGINT', function () {
      return self.drdy.unexport();
    });

    self.chipSelect = new _onoff.Gpio(config.csPin, 'high');
    self.resetGpio = new _onoff.Gpio(config.resetPin, 'high');
    self.pdwnGpio = new _onoff.Gpio(config.pdwnPin, 'high');

    // TODO: add way to set these options as well
    var spiDeviceOpts = {
      mode: _spiDevice2.default.MODE1,
      maxSpeedHz: conf.spiFrequency,
      noChipSelect: true
    };

    this.device = _spiDevice2.default.openSync(0, conf.spiChannel, spiDeviceOpts);
    this.device = _bluebird2.default.promisifyAll(this.device);

    self._dataTimeoutUs = Math.ceil(1 + 50 * 1000000 / conf.clkinFrequency);
    self._syncTimeoutUs = Math.ceil(1 + 24 * 1000000 / conf.clkinFrequency);
    self._csTimeoutUs = Math.ceil(1 + 8 * 1000000 / conf.clkinFrequency);
    self._t11TimeoutUs = Math.ceil(1 + 4 * 1000000 / conf.clkinFrequency);

    setTimeout(function () {
      return self.waitDRDY().then(function () {
        return self.reset();
      });
    }, 30);
  }

  _createClass(ADS125x, [{
    key: 'calibrateSelf',
    value: function calibrateSelf() {
      var self = this;
      return this._chipSelect().then(function () {
        return self._sendMessage([_definitions2.default.CMD_SELFCAL]);
      }).then(function () {
        return self.waitDRDY();
      }).then(function () {
        return self._chipRelease();
      });
    }

    /**
     * _chipRelease - Private chip release
     *
     * @return {Promise}
     */

  }, {
    key: '_chipRelease',
    value: function _chipRelease() {
      var self = this;
      return new _bluebird2.default(function (resolve) {
        return self.chipSelect.write(1, resolve);
      });
    }

    /**
     * _chipSelect - Private chip select
     *
     * @return {Promise}
     */

  }, {
    key: '_chipSelect',
    value: function _chipSelect() {
      var self = this;
      return new _bluebird2.default(function (resolve) {
        return self.chipSelect.write(0, resolve);
      });
    }
  }, {
    key: 'read',
    value: function read(diffChannel) {
      var _this = this;

      var self = this;
      return self._chipSelect().then(function () {
        var bytes = [_definitions2.default.CMD_WREG | _definitions2.default.REG_MUX, 0x00, diffChannel];
        return self._sendMessage(bytes);
      }).then(function () {
        return self._sendMessage([_definitions2.default.CMD_SYNC], { delayMicroseconds: self._syncTimeoutUs });
      }).then(function () {
        return self._sendMessage([_definitions2.default.CMD_WAKEUP]);
      }).then(function () {
        return self.waitDRDY();
      }).then(function () {
        return self._sendMessage([_definitions2.default.CMD_RDATA], { delayMicroseconds: self._dataTimeoutUs });
      }).then(function () {

        var message = {
          byteLength: 3,
          receiveBuffer: Buffer.alloc(3)
        };

        return _this.device.transferAsync([message]);
      }).then(function (received) {
        return self._chipRelease().then(function () {
          var rb = received[0].receiveBuffer;
          var msb = rb[0];
          var midb = rb[1];
          var lsb = rb[2];
          return msb << 16 | midb << 8 | lsb;
        });
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      var self = this;
      return this._chipSelect().then(function () {
        return self._sendMessage([_definitions2.default.CMD_RESET]);
      }).then(function () {
        return self.waitDRDY();
      }).then(function () {
        return self._chipRelease();
      });
    }
  }, {
    key: '_sendMessage',
    value: function _sendMessage(bytes, options) {
      var message = {
        sendBuffer: Buffer.from(bytes),
        byteLength: bytes.length
      };
      message = Object.assign(message, options || {});
      return this.device.transferAsync([message]);
    }
  }, {
    key: 'wakeup',
    value: function wakeup() {
      var self = this;
      return this._chipSelect().then(function () {
        return self._sendMessage([_definitions2.default.CMD_WAKEUP]);
      }).then(function () {
        return self.waitDRDY();
      }).then(function () {
        return self._chipRelease();
      });
    }
  }, {
    key: 'waitDRDY',
    value: function waitDRDY() {
      return this._isDrdyPromise;
    }
  }]);

  return ADS125x;
}();