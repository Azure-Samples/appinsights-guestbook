"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var QuickPulseClient = require("../../Library/QuickPulseStateManager");
describe("Library/QuickPulseStateManager", function () {
    describe("#constructor", function () {
        var qps;
        afterEach(function () {
            qps = null;
        });
        it("should create a config with ikey", function () {
            qps = new QuickPulseClient("ikey");
            assert.ok(qps.config);
            assert.equal(qps.config.instrumentationKey, "ikey");
            assert.ok(qps.context);
            assert.equal(qps["_isEnabled"], false);
            assert.equal(qps["_isCollectingData"], false);
            assert.ok(qps["_sender"]);
            assert.ok(Object.keys(qps["_metrics"]).length === 0);
            assert.ok(qps["_documents"].length === 0);
            assert.ok(qps["_collectors"].length === 0);
        });
    });
    describe("#enable", function () {
        var qps;
        beforeEach(function () {
            qps = new QuickPulseClient("ikey");
        });
        afterEach(function () {
            qps = null;
        });
        it("should call _goQuickPulse() when isEnabled == true", function () {
            var qpsStub = sinon.stub(qps, "_goQuickPulse");
            assert.ok(qpsStub.notCalled);
            qps.enable(true);
            assert.ok(qpsStub.calledOnce);
            assert.equal(qps["_isEnabled"], true);
            qpsStub.restore();
        });
        it("should clear timeout handle when isEnabled == false", function () {
            assert.equal(qps["_handle"], undefined);
            qps["_isEnabled"] = true;
            qps["_handle"] = setTimeout(function () { throw new Error("this error should be cancelled"); }, 1000);
            qps["_handle"].unref();
            assert.ok(qps["_handle"]);
            qps.enable(false);
            assert.equal(qps["_handle"], undefined);
            assert.equal(qps["_isEnabled"], false);
        });
    });
    describe("#reset", function () {
        it("should reset metric and document buffers", function () {
            var qps = new QuickPulseClient("ikey");
            qps["_metrics"] = { foo: "bar" };
            qps["_documents"] = [{ foo: "bar" }];
            assert.ok(qps["_metrics"].foo);
            assert.ok(qps["_documents"].length > 0);
            assert.ok(qps["_documents"][0].foo);
            qps["_resetQuickPulseBuffer"]();
            assert.ok(!qps["_metrics"].foo);
            assert.ok(qps["_documents"].length === 0);
        });
    });
    describe("#_goQuickPulse", function () {
        var qps;
        var postStub;
        var pingStub;
        beforeEach(function () {
            qps = new QuickPulseClient("ikey");
            postStub = sinon.stub(qps, "_post");
            pingStub = sinon.stub(qps, "_ping");
        });
        afterEach(function () {
            qps = null;
            postStub.restore();
            pingStub.restore();
        });
        it("should call _ping when not collecting data", function () {
            qps.enable(true);
            assert.ok(pingStub.calledOnce);
            assert.ok(postStub.notCalled);
            qps.enable(false);
        });
        it("should call _post when collecting data", function () {
            assert.ok(pingStub.notCalled);
            assert.ok(postStub.notCalled);
            qps["_isCollectingData"] = true;
            qps.enable(true);
            assert.ok(postStub.calledOnce);
            assert.ok(pingStub.notCalled);
            qps.enable(false);
        });
    });
});
//# sourceMappingURL=QuickPulseStateManager.tests.js.map