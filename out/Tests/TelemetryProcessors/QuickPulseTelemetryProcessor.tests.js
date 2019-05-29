"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var QuickPulse = require("../../TelemetryProcessors/QuickPulseTelemetryProcessor");
var QuickPulseStateManager = require("../../Library/QuickPulseStateManager");
describe("TelemetryProcessors/QuickPulseTelemetryProcessor", function () {
    describe("#quickPulseTelemetryProcessor()", function () {
        var envelope = {
            ver: 2,
            name: "name",
            data: {
                baseType: "SomeData"
            },
            iKey: ikey,
            sampleRate: 100,
            seq: "",
            time: "",
            tags: []
        };
        var ikey = "ikey";
        it("should return true if no client provided", function () {
            var qpSpy = sinon.spy(QuickPulse, "quickPulseTelemetryProcessor");
            var res = QuickPulse.quickPulseTelemetryProcessor(envelope);
            assert.ok(qpSpy.calledOnce);
            assert.equal(res, true, "returns true");
            qpSpy.restore();
        });
        it("should add document to the provided client", function () {
            var qpSpy = sinon.spy(QuickPulse, "quickPulseTelemetryProcessor");
            var client = new QuickPulseStateManager(ikey);
            var addDocumentStub = sinon.stub(client, "addDocument");
            // Act
            var res = QuickPulse.quickPulseTelemetryProcessor(envelope, client);
            // Test
            assert.ok(qpSpy.calledOnce);
            assert.equal(res, true);
            assert.ok(addDocumentStub.calledOnce);
            qpSpy.restore();
            addDocumentStub.restore();
        });
    });
});
//# sourceMappingURL=QuickPulseTelemetryProcessor.tests.js.map