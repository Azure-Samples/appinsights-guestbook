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
});
//# sourceMappingURL=HttpDependencies.tests.js.map