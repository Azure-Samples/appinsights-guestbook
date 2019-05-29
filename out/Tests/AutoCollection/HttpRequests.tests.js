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
    describe("#addResponseCorrelationIdHeader", function () {
        var response = {
            headers: {},
            getHeader: function (name) { return this.headers[name]; },
            setHeader: function (name, value) { this.headers[name] = value; },
            clearHeaders: function () { this.headers = {}; }
        };
        afterEach(function () {
            AppInsights.dispose();
            response.clearHeaders();
        });
        it("should accept string request-context", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectRequests(true);
            AppInsights.defaultClient.config.correlationId = "abcdefg";
            appInsights.start();
            response.setHeader("request-context", "appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa");
            assert.doesNotThrow(function () { return HttpRequests["addResponseCorrelationIdHeader"](AppInsights.defaultClient, response); });
        });
        it("should accept nonstring request-context", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectDependencies(true);
            AppInsights.defaultClient.config.correlationId = "abcdefg";
            appInsights.start();
            response.setHeader("request-context", ["appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa"]);
            assert.doesNotThrow(function () { return HttpRequests["addResponseCorrelationIdHeader"](AppInsights.defaultClient, response); });
            assert.deepEqual(response.getHeader("request-context"), ["appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa"], "does not modify valid appId");
            response.setHeader("request-context", 123);
            assert.doesNotThrow(function () { return HttpRequests["addResponseCorrelationIdHeader"](AppInsights.defaultClient, response); });
            assert.ok(response.getHeader("request-context").indexOf("abcdefg") !== -1);
            response.setHeader("request-context", { foo: 'bar' });
            assert.doesNotThrow(function () { return HttpRequests["addResponseCorrelationIdHeader"](AppInsights.defaultClient, response); });
            assert.ok(response.getHeader("request-context").indexOf("abcdefg") !== -1);
        });
    });
});
//# sourceMappingURL=HttpRequests.tests.js.map