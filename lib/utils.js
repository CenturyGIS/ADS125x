'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timeDelay = timeDelay;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function timeDelay(delay) {
  return new _bluebird2.default(function (resolve) {
    return setTimeout(function () {
      return resolve();
    }, delay);
  });
}