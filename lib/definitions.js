"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Definitions = function () {
  function Definitions() {
    _classCallCheck(this, Definitions);
  }

  _createClass(Definitions, null, [{
    key: "CMD_WAKEUP",
    get: function get() {
      return 0x00;
    }
  }, {
    key: "CMD_RDATA",
    get: function get() {
      return 0x01;
    }
  }, {
    key: "CMD_RDATAC",
    get: function get() {
      return 0x03;
    }
  }, {
    key: "CMD_SDATAC",
    get: function get() {
      return 0x0F;
    }
  }, {
    key: "CMD_RREG",
    get: function get() {
      return 0x10;
    }
  }, {
    key: "CMD_WREG",
    get: function get() {
      return 0x50;
    }
  }, {
    key: "CMD_SELFCAL",
    get: function get() {
      return 0xF0;
    }
  }, {
    key: "CMD_SELFOCAL",
    get: function get() {
      return 0xF1;
    }
  }, {
    key: "CMD_SELFGCAL",
    get: function get() {
      return 0xF2;
    }
  }, {
    key: "CMD_SYSOCAL",
    get: function get() {
      return 0xF3;
    }
  }, {
    key: "CMD_SYSGCAL",
    get: function get() {
      return 0xF4;
    }
  }, {
    key: "CMD_SYNC",
    get: function get() {
      return 0xFC;
    }
  }, {
    key: "CMD_STANDBY",
    get: function get() {
      return 0xFD;
    }
  }, {
    key: "CMD_RESET",
    get: function get() {
      return 0xFE;
    }
  }, {
    key: "REG_STATUS",
    get: function get() {
      return 0x00;
    }
  }, {
    key: "REG_MUX",
    get: function get() {
      return 0x01;
    }
  }, {
    key: "REG_ADCON",
    get: function get() {
      return 0x02;
    }
  }, {
    key: "REG_DRATE",
    get: function get() {
      return 0x03;
    }
  }, {
    key: "REG_IO",
    get: function get() {
      return 0x04;
    }
  }, {
    key: "REG_OFC0",
    get: function get() {
      return 0x05;
    }
  }, {
    key: "REG_OFC1",
    get: function get() {
      return 0x06;
    }
  }, {
    key: "REG_OFC2",
    get: function get() {
      return 0x07;
    }
  }, {
    key: "REG_FSC0",
    get: function get() {
      return 0x08;
    }
  }, {
    key: "REG_FSC1",
    get: function get() {
      return 0x09;
    }
  }, {
    key: "REG_FSC2",
    get: function get() {
      return 0x0A;
    }
  }, {
    key: "NUM_REG",
    get: function get() {
      return 11;
    }
  }]);

  return Definitions;
}();

exports.default = Definitions;