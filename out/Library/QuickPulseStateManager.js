"use strict";
var Logging = require("./Logging");
var Config = require("./Config");
var QuickPulseEnvelopeFactory = require("./QuickPulseEnvelopeFactory");
var QuickPulseSender = require("./QuickPulseSender");
var Constants = require("../Declarations/Constants");
var Context = require("./Context");
/** State Container for sending to the QuickPulse Service */
var QuickPulseStateManager = (function () {
    function QuickPulseStateManager(iKey, context) {
        this._lastSuccessTime = Date.now();
        this._metrics = {};
        this._documents = [];
        this._collectors = [];
        this.config = new Config(iKey);
        this.context = context || new Context();
        this._sender = new QuickPulseSender(this.config);
        this._isEnabled = false;
    }
    /**
     *
     * @param collector
     */
    QuickPulseStateManager.prototype.addCollector = function (collector) {
        this._collectors.push(collector);
    };
    /**
     * Override of TelemetryClient.trackMetric
     */
    QuickPulseStateManager.prototype.trackMetric = function (telemetry) {
        this._addMetric(telemetry);
    };
    /**
     * Add a document to the current buffer
     * @param envelope
     */
    QuickPulseStateManager.prototype.addDocument = function (envelope) {
        var document = QuickPulseEnvelopeFactory.telemetryEnvelopeToQuickPulseDocument(envelope);
        if (document) {
            this._documents.push(document);
        }
    };
    /**
     * Enable or disable communication with QuickPulseService
     * @param isEnabled
     */
    QuickPulseStateManager.prototype.enable = function (isEnabled) {
        if (isEnabled && !this._isEnabled) {
            this._isEnabled = true;
            this._goQuickPulse();
        }
        else if (!isEnabled && this._isEnabled) {
            this._isEnabled = false;
            clearTimeout(this._handle);
            this._handle = undefined;
        }
    };
    /**
     * Enable or disable all collectors in this instance
     * @param enable
     */
    QuickPulseStateManager.prototype.enableCollectors = function (enable) {
        this._collectors.forEach(function (collector) {
            collector.enable(enable);
        });
    };
    /**
     * Add the metric to this buffer. If same metric already exists in this buffer, add weight to it
     * @param telemetry
     */
    QuickPulseStateManager.prototype._addMetric = function (telemetry) {
        var value = telemetry.value, count = telemetry.count;
        var name = Constants.PerformanceToQuickPulseCounter[telemetry.name];
        if (name) {
            if (this._metrics[name]) {
                this._metrics[name].Value = (this._metrics[name].Value * this._metrics[name].Weight + value * count) / (this._metrics[name].Weight + count);
                this._metrics[name].Weight += count;
            }
            else {
                this._metrics[name] = QuickPulseEnvelopeFactory.createQuickPulseMetric(telemetry);
                this._metrics[name].Name = name;
            }
        }
    };
    QuickPulseStateManager.prototype._resetQuickPulseBuffer = function () {
        // TODO
        delete this._metrics;
        this._metrics = {};
        this._documents.length = 0;
    };
    QuickPulseStateManager.prototype._goQuickPulse = function () {
        var _this = this;
        // Create envelope from Documents and Metrics
        var metrics = Object.keys(this._metrics).map(function (k) { return _this._metrics[k]; });
        var envelope = QuickPulseEnvelopeFactory.createQuickPulseEnvelope(metrics, this._documents.slice(), this.config, this.context);
        // Clear this document, metric buffer
        this._resetQuickPulseBuffer();
        // Send it to QuickPulseService, if collecting
        if (QuickPulseStateManager._isCollectingData) {
            this._post(envelope);
        }
        else {
            this._ping(envelope);
        }
        var currentTimeout = QuickPulseStateManager._isCollectingData ? 1000 : 5000;
        if (QuickPulseStateManager._isCollectingData && Date.now() - this._lastSuccessTime >= 20000) {
            // Haven't posted successfully in 20 seconds, so wait 60 seconds and ping
            QuickPulseStateManager._isCollectingData = false;
            currentTimeout = 60000;
        }
        else if (!QuickPulseStateManager._isCollectingData && Date.now() - this._lastSuccessTime >= 60000) {
            // Haven't pinged successfully in 60 seconds, so wait another 60 seconds
            currentTimeout = 60000;
        }
        this._handle = setTimeout(this._goQuickPulse.bind(this), currentTimeout);
        this._handle.unref(); // Don't block apps from terminating
    };
    QuickPulseStateManager.prototype._ping = function (envelope) {
        this._sender.ping(envelope, this._quickPulseDone.bind(this));
    };
    QuickPulseStateManager.prototype._post = function (envelope) {
        this._sender.post(envelope, this._quickPulseDone.bind(this));
    };
    QuickPulseStateManager.prototype._quickPulseDone = function (shouldPOST, res) {
        if (QuickPulseStateManager._isCollectingData !== shouldPOST) {
            Logging.info("Live Metrics sending data", shouldPOST);
            this.enableCollectors(shouldPOST);
        }
        QuickPulseStateManager._isCollectingData = shouldPOST;
        if (res.statusCode < 300 && res.statusCode >= 200) {
            this._lastSuccessTime = Date.now();
        }
    };
    QuickPulseStateManager._isCollectingData = false;
    return QuickPulseStateManager;
}());
module.exports = QuickPulseStateManager;
//# sourceMappingURL=QuickPulseStateManager.js.map