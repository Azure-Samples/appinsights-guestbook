"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var HttpRequests = require("../../AutoCollection/HttpRequests");
var AppInsights = require("../../applicationinsights");
describe("AutoCollection/HttpRequests", function () {
    afterEach(function () {
        AppInsights.dispose();
    });
    describe("#init and #dispose()", function () {
        it("init should enable and dispose should stop server requests autocollection", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectRequests(true);
            var enableHttpRequestsSpy = sinon.spy(HttpRequests.INSTANCE, "enable");
            appInsights.start();
            assert.equal(enableHttpRequestsSpy.callCount, 1, "enable should be called once as part of requests autocollection initialization");
            assert.equal(enableHttpRequestsSpy.getCall(0).args[0], true);
            AppInsights.dispose();
            assert.equal(enableHttpRequestsSpy.callCount, 2, "enable(false) should be called once as part of requests autocollection shutdown");
            assert.equal(enableHttpRequestsSpy.getCall(1).args[0], false);
        });
    });
});
//# sourceMappingURL=HttpRequests.tests.js.map