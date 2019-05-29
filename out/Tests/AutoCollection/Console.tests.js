"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var Console = require("../../AutoCollection/Console");
var AppInsights = require("../../applicationinsights");
describe("AutoCollection/Console", function () {
    afterEach(function () {
        AppInsights.dispose();
    });
    describe("#init and #dispose()", function () {
        it("init should enable and dispose should stop console autocollection", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectConsole(true);
            var enableConsoleRequestsSpy = sinon.spy(Console.INSTANCE, "enable");
            appInsights.start();
            assert.equal(enableConsoleRequestsSpy.callCount, 1, "enable should be called once as part of console autocollection initialization");
            assert.equal(enableConsoleRequestsSpy.getCall(0).args[0], true);
            AppInsights.dispose();
            assert.equal(enableConsoleRequestsSpy.callCount, 2, "enable(false) should be called once as part of console autocollection shutdown");
            assert.equal(enableConsoleRequestsSpy.getCall(1).args[0], false);
        });
    });
});
//# sourceMappingURL=Console.tests.js.map