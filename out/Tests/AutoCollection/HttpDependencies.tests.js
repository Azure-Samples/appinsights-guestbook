"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var HttpDependencies = require("../../AutoCollection/HttpDependencies");
var AppInsights = require("../../applicationinsights");
describe("AutoCollection/HttpDependencies", function () {
    afterEach(function () {
        AppInsights.dispose();
    });
    describe("#init and #dispose()", function () {
        it("init should enable and dispose should stop dependencies autocollection", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectDependencies(true);
            var enableHttpDependenciesSpy = sinon.spy(HttpDependencies.INSTANCE, "enable");
            appInsights.start();
            assert.equal(enableHttpDependenciesSpy.callCount, 1, "enable should be called once as part of dependencies autocollection initialization");
            assert.equal(enableHttpDependenciesSpy.getCall(0).args[0], true);
            AppInsights.dispose();
            assert.equal(enableHttpDependenciesSpy.callCount, 2, "enable(false) should be called once as part of dependencies autocollection shutdown");
            assert.equal(enableHttpDependenciesSpy.getCall(1).args[0], false);
        });
    });
    describe("#trackRequest", function () {
        var telemetry = {
            options: {},
            request: {
                headers: {},
                getHeader: function (name) { return this.headers[name]; },
                setHeader: function (name, value) { this.headers[name] = value; },
                clearHeaders: function () { this.headers = {}; }
            }
        };
        afterEach(function () {
            AppInsights.dispose();
            telemetry.request.clearHeaders();
        });
        it("should accept string request-context", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectDependencies(true);
            AppInsights.defaultClient.config.correlationId = "abcdefg";
            appInsights.start();
            telemetry.request.setHeader("request-context", "appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa");
            assert.doesNotThrow(function () { return HttpDependencies.trackRequest(AppInsights.defaultClient, telemetry); });
        });
        it("should accept nonstring request-context", function () {
            var appInsights = AppInsights.setup("key").setAutoCollectDependencies(true);
            AppInsights.defaultClient.config.correlationId = "abcdefg";
            appInsights.start();
            telemetry.request.setHeader("request-context", ["appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa"]);
            assert.doesNotThrow(function () { return HttpDependencies.trackRequest(AppInsights.defaultClient, telemetry); });
            assert.deepEqual(telemetry.request.getHeader("request-context"), ["appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa"], "does not modify valid appId header");
            var myCustomObject = { foo: { bar: "appId=cid-v1:aaaaed48-297a-4ea2-af46-0a5a5d26aaaa" } };
            myCustomObject.toString = function () { return myCustomObject.foo.bar; };
            telemetry.request.setHeader("request-context", myCustomObject);
            assert.doesNotThrow(function () { return HttpDependencies.trackRequest(AppInsights.defaultClient, telemetry); });
            assert.equal(telemetry.request.getHeader("request-context"), myCustomObject.toString(), "does not modify valid appId header");
            telemetry.request.setHeader("request-context", 123);
            assert.doesNotThrow(function () { return HttpDependencies.trackRequest(AppInsights.defaultClient, telemetry); });
            assert.ok(telemetry.request.getHeader("request-context").indexOf("abcdefg") !== -1);
            telemetry.request.setHeader("request-context", { foo: 'bar' });
            assert.doesNotThrow(function () { return HttpDependencies.trackRequest(AppInsights.defaultClient, telemetry); });
            assert.ok(telemetry.request.getHeader("request-context").indexOf("abcdefg") !== -1);
        });
    });
});
//# sourceMappingURL=HttpDependencies.tests.js.map