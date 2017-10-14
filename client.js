'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('node-fetch');
var Mustache = require('mustache');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var xpath = require('xpath');

var baseURI = 'https://global.americanexpress.com';

var Amex = function () {
    function Amex(username, password) {
        _classCallCheck(this, Amex);

        this.username = username;
        this.password = password;
    }

    _createClass(Amex, [{
        key: 'getAccounts',
        value: function getAccounts() {
            var requestXML = this.getRequestXML();
            var options = {
                method: 'POST',
                body: 'PayLoadText=' + requestXML,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            var self = this;

            return fetch(baseURI + '/myca/intl/moblclient/emea/ws.do?Face=en_GB', options).then(function (response) {
                if (response.ok) {
                    return response.text();
                } else {
                    return Promise.reject(new Error(response.status));
                }
            }).then(function (text) {
                var XML = new DOMParser().parseFromString(text, 'text/xml');
                var status = xpath.select('/XMLResponse/ServiceResponse/Status/text()', XML).toString();

                if (status !== 'success') {
                    return Promise.reject(new Error('Authentication failure'));
                }

                self.securityToken = xpath.select('/XMLResponse/ClientSecurityToken/text()', XML).toString();
                var balance = xpath.select("/XMLResponse/CardAccounts/CardAccount/AccountSummaryData/SummaryElement[@name='availableCredit']/@value", XML).toString();
                return Promise.resolve(balance);
            });
        }
    }, {
        key: 'getTransactions',
        value: function getTransactions(cardIndex) {
            var billingPeriod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var requestXML = this.getStatementRequestXML(cardIndex, billingPeriod);
            var options = {
                method: 'POST',
                body: 'PayLoadText=' + requestXML,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            return fetch(baseURI + '/myca/intl/moblclient/emea/ws.do?Face=en_GB', options).then(function (response) {
                if (response.ok) {
                    return response.text();
                } else {
                    return Promise.reject(new Error(response.status));
                }
            }).then(function (text) {
                var xml = new DOMParser().parseFromString(text);
                var status = xpath.select('/XMLResponse/ServiceResponse/Status/text()', xml).toString();
                var message = xpath.select('/XMLResponse/ServiceResponse/Message/text()', xml).toString();
                var transactions = void 0;

                if (status !== 'success') {
                    return Promise.reject(new Error(message));
                }

                transactions = xpath.select('//Transaction', xml).map(function (transaction) {
                    return {
                        date: xpath.select('./TransChargeDate/text()', transaction).toString(),
                        description: xpath.select('./TransDesc/text()', transaction).toString(),
                        amount: xpath.select('./TransAmount/text()', transaction).toString()
                    };
                });
                console.log(transactions);
                return Promise.resolve(transactions);
            });
        }
    }, {
        key: 'getRequestXML',
        value: function getRequestXML() {
            var requestXML = fs.readFileSync(__dirname + '/data/request.xml', 'utf8');
            var requestData = {
                userID: this.username,
                password: this.password,
                timestamp: Date.now(),
                hardwareID: this.generateHardwareID()
            };

            return Mustache.render(requestXML, requestData);
        }
    }, {
        key: 'getStatementRequestXML',
        value: function getStatementRequestXML(cardIndex, billingPeriod) {
            var requestXML = fs.readFileSync(__dirname + '/data/statement-request.xml', 'utf8');
            var requestData = {
                securityToken: this.securityToken,
                cardIndex: cardIndex,
                billingPeriod: billingPeriod
            };

            return Mustache.render(requestXML, requestData);
        }
    }, {
        key: 'generateHardwareID',
        value: function generateHardwareID() {
            var chars = 'abcdefghjkmnpqrstuvwxyz1234567890';

            return new Array(40).fill('x').map(function () {
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
        }
    }]);

    return Amex;
}();

exports.default = Amex;


module.exports = Amex;