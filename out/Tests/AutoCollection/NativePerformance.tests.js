"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var AppInsights = require("../../applicationinsights");
var TelemetryClient = require("../../Library/TelemetryClient");
var Config = require("../../Library/Config");
var NativePerformance_1 = require("../../AutoCollection/NativePerformance");
describe("AutoCollection/NativePerformance", function () {
    afterEach(function () {
        AppInsights.dispose();
    });
    if (NativePerformance_1.AutoCollectNativePerformance.isNodeVersionCompatible()) {
        describe("#init and #dispose()", function () {
            it("init should enable and dispose should stop autocollection interval", function () {
                var setIntervalSpy = sinon.spy(global, "setInterval");
                var clearIntervalSpy = sinon.spy(global, "clearInterval");
                AppInsights.setup("key").setAutoCollectPerformance(false, true).start();
                if (NativePerformance_1.AutoCollectNativePerformance["_metricsAvailable"]) {
                    assert.equal(setIntervalSpy.callCount, 1, "setInterval should be called once as part of NativePerformance initialization");
                    AppInsights.dispose();
                    assert.equal(clearIntervalSpy.callCount, 1, "clearInterval should be called once as part of NativePerformance shutdown");
                }
                else {
                    assert.equal(setIntervalSpy.callCount, 0, "setInterval should not be called if NativePerformance package is not available");
                    AppInsights.dispose();
                    assert.equal(clearIntervalSpy.callCount, 0, "clearInterval should not be called if NativePerformance package is not available");
                }
                setIntervalSpy.restore();
                clearIntervalSpy.restore();
            });
            it("constructor should be safe to call multiple times", function () {
                var client = new TelemetryClient("key");
                var native = new NativePerformance_1.AutoCollectNativePerformance(client);
                var disposeSpy = sinon.spy(NativePerformance_1.AutoCollectNativePerformance.INSTANCE, "dispose");
                assert.ok(native);
                assert.ok(disposeSpy.notCalled);
                assert.doesNotThrow(function () { native = new NativePerformance_1.AutoCollectNativePerformance(client); }, "NativePerformance can be constructed more than once");
                assert.ok(disposeSpy.calledOnce, "dispose is called when second instance is constructed");
            });
            it("Calling enable when metrics are not available should fail gracefully", function () {
                var client = new TelemetryClient("key");
                var native = new NativePerformance_1.AutoCollectNativePerformance(client);
                NativePerformance_1.AutoCollectNativePerformance["_metricsAvailable"] = false;
                assert.ok(!native["_emitter"]);
                assert.doesNotThrow(function () { return native.enable(true); }, "Does not throw when native metrics are not available and trying to enable");
                assert.doesNotThrow(function () { return native.enable(false); }, "Does not throw when native metrics are not available and trying to disable");
            });
        });
        describe("#_parseEnabled", function () {
            it("should return equal input arg if no env vars are set", function () {
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(true), { isEnabled: true, disabledMetrics: {} });
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(false), { isEnabled: false, disabledMetrics: {} });
                var config = { gc: true, heap: true };
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(config), { isEnabled: true, disabledMetrics: config });
            });
            it("should overwrite input arg if disable all extended metrics env var is set", function () {
                var env = {};
                var originalEnv = process.env;
                env[Config.ENV_nativeMetricsDisableAll] = "set";
                process.env = env;
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(true), { isEnabled: false, disabledMetrics: {} });
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled({}), { isEnabled: false, disabledMetrics: {} });
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled({ gc: true }), { isEnabled: false, disabledMetrics: {} });
                process.env = originalEnv;
            });
            it("should overwrite input arg if individual env vars are set", function () {
                var expectation = { gc: true, heap: true };
                var env = {};
                var originalEnv = process.env;
                env[Config.ENV_nativeMetricsDisablers] = "gc,heap";
                process.env = env;
                var inConfig;
                inConfig = false;
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: false, disabledMetrics: expectation });
                inConfig = true;
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: true, disabledMetrics: expectation });
                inConfig = {};
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: true, disabledMetrics: expectation });
                inConfig = { gc: true };
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: true, disabledMetrics: expectation });
                inConfig = { loop: true };
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: true, disabledMetrics: __assign({}, inConfig, expectation) });
                inConfig = { gc: false, loop: true, heap: 'abc', something: 'else' };
                assert.deepEqual(NativePerformance_1.AutoCollectNativePerformance.parseEnabled(inConfig), { isEnabled: true, disabledMetrics: __assign({}, inConfig, expectation) });
                process.env = originalEnv;
            });
        });
    }
});
//# sourceMappingURL=NativePerformance.tests.js.map