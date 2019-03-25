"use strict";
var https = require("https");
var Constants = require("../Declarations/Constants");
var AutoCollectHttpDependencies = require("../AutoCollection/HttpDependencies");
var QuickPulseSender = (function () {
    function QuickPulseSender(config) {
        this._config = config;
    }
    QuickPulseSender.prototype.ping = function (envelope, done) {
        this._submitData(envelope, done, "ping");
    };
    QuickPulseSender.prototype.post = function (envelope, done) {
        // Important: When POSTing data, envelope must be an array
        this._submitData([envelope], done, "post");
    };
    QuickPulseSender.prototype._submitData = function (envelope, done, postOrPing) {
        var payload = JSON.stringify(envelope);
        var options = (_a = {},
            _a[AutoCollectHttpDependencies.disableCollectionRequestOption] = true,
            _a.host = this._config.quickPulseHost,
            _a.method = Constants.QuickPulseConfig.method,
            _a.path = "/QuickPulseService.svc/" + postOrPing + "?ikey=" + this._config.instrumentationKey,
            _a.headers = (_b = {
                    'Expect': '100-continue'
                },
                _b[Constants.QuickPulseConfig.time] = 10000 * Date.now(),
                _b['Content-Type'] = 'application\/json',
                _b['Content-Length'] = Buffer.byteLength(payload),
                _b),
            _a);
        var req = https.request(options, function (res) {
            var shouldPOSTData = res.headers[Constants.QuickPulseConfig.subscribed] === "true";
            done(shouldPOSTData, res);
        });
        req.write(payload);
        req.end();
        var _a, _b;
    };
    return QuickPulseSender;
}());
module.exports = QuickPulseSender;
//# sourceMappingURL=QuickPulseSender.js.map