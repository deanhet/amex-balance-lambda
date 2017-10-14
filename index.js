'use strict';

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = new _client2.default('YOUR_USERNAME_HERE', 'YOUR_PASSWORD_HERE');

exports.handler = function (event, context, callback) {
    client.getAccounts().then(function (result) {
        callback(null, {
            amex: Number(result.replace(/[^0-9.,]+/, '').replace('"', ''))
        });
    });
};