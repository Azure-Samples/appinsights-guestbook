"use strict";
var https = require("https");
var AutoCollectHttpDependencies = require("../AutoCollection/HttpDependencies");
var Logging = require("./Logging");
var QuickPulseConfig = {
    method: "POST",
    time: "x-ms-qps-transmission-time",
    subscribed: "x-ms-qps-subscribed"
};
var QuickPulseSender = (function () {
    function QuickPulseSender(config) {
        this._config = config;
        this._consecutiveErrors = 0;
    }
    QuickPulseSender.prototype.ping = function (envelope, done) {
        this._submitData(envelope, done, "ping");
    };
    QuickPulseSender.prototype.post = function (envelope, done) {
        // Important: When POSTing data, envelope must be an array
        this._submitData([envelope], done, "post");
    };
    QuickPulseSender.prototype._submitData = function (envelope, done, postOrPing) {
        var _this = this;
        var payload = JSON.stringify(envelope);
        var options = (_a = {},
            _a[AutoCollectHttpDependencies.disableCollectionRequestOption] = true,
            _a.host = this._config.quickPulseHost,
            _a.method = QuickPulseConfig.method,
            _a.path = "/QuickPulseService.svc/" + postOrPing + "?ikey=" + this._config.instrumentationKey,
            _a.headers = (_b = {
                    'Expect': '100-continue'
                },
                _b[QuickPulseConfig.time] = 10000 * Date.now(),
                _b['Content-Type'] = 'application\/json',
                _b['Content-Length'] = Buffer.byteLength(payload),
                _b),
            _a);
        var req = https.request(options, function (res) {
            var shouldPOSTData = res.headers[QuickPulseConfig.subscribed] === "true";
            _this._consecutiveErrors = 0;
            done(shouldPOSTData, res);
        });
        req.on("error", function (error) {
            // Unable to contact qps endpoint.
            // Do nothing for now.
            _this._consecutiveErrors++;
            // LOG every error, but WARN instead when X number of consecutive errors occur
            var notice = "Transient error connecting to the Live Metrics endpoint. This packet will not appear in your Live Metrics Stream. Error:";
            if (_this._consecutiveErrors % QuickPulseSender.MAX_QPS_FAILURES_BEFORE_WARN === 0) {
                notice = "Live Metrics endpoint could not be reached " + _this._consecutiveErrors + " consecutive times. Most recent error:";
                Logging.warn(QuickPulseSender.TAG, notice, error);
            }
            else {
                Logging.info(QuickPulseSender.TAG, notice, error);
            }
            done(false); // Stop POSTing QPS data
        });
        req.write(payload);
        req.end();
        var _a, _b;
    };
    QuickPulseSender.TAG = "QuickPulseSender";
    QuickPulseSender.MAX_QPS_FAILURES_BEFORE_WARN = 25;
    return QuickPulseSender;
}());
module.exports = QuickPulseSender;
//# sourceMappingURL=QuickPulseSender.js.map