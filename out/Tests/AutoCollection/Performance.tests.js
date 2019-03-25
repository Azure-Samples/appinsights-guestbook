"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var AppInsights = require("../../applicationinsights");
describe("AutoCollection/Performance", function () {
    afterEach(function () {
        AppInsights.dispose();
    });
    describe("#init and #dispose()", function () {
        it("init should enable and dispose should stop autocollection interval", function () {
            var setIntervalSpy = sinon.spy(global, "setInterval");
            var clearIntervalSpy = sinon.spy(global, "clearInterval");
            AppInsights.setup("key").setAutoCollectPerformance(true).start();
            assert.equal(setIntervalSpy.callCount, 1, "setInteval should be called once as part of performance initialization");
            AppInsights.dispose();
            assert.equal(clearIntervalSpy.callCount, 1, "clearInterval should be called once as part of performance shutdown");
        });
    });
});
//# sourceMappingURL=Performance.tests.js.map