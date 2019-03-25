"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var Logging = require("../../Library/Logging");
describe("Library/Logging", function () {
    describe("#info(message, ...optionalParams: any)", function () {
        it("should do nothing if disabled", function () {
            var originalSetting = Logging.enableDebug;
            Logging.enableDebug = false;
            var infoStub = sinon.stub(console, "info");
            Logging.info("test");
            assert.ok(infoStub.notCalled);
            infoStub.restore();
            Logging.enableDebug = originalSetting;
        });
        it("should log 'info' if enabled", function () {
            var originalSetting = Logging.enableDebug;
            Logging.enableDebug = true;
            var infoStub = sinon.stub(console, "info");
            Logging.info("test");
            assert.ok(infoStub.calledOnce);
            infoStub.restore();
            Logging.enableDebug = originalSetting;
        });
    });
    describe("#warn(message, ...optionalParams: any)", function () {
        it("should do nothing if disabled", function () {
            var originalSetting = Logging.enableDebug;
            Logging.enableDebug = false;
            var warnStub = sinon.stub(console, "warn");
            Logging.info("test");
            assert.ok(warnStub.notCalled);
            warnStub.restore();
            Logging.enableDebug = originalSetting;
        });
        it("should log 'warn' if enabled", function () {
            var originalSetting = Logging.enableDebug;
            Logging.enableDebug = true;
            var warnStub = sinon.stub(console, "warn");
            Logging.warn("test");
            assert.ok(warnStub.calledOnce);
            warnStub.restore();
            Logging.enableDebug = originalSetting;
        });
    });
});
//# sourceMappingURL=Logging.tests.js.map