"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var applicationinsights_1 = require("../applicationinsights");
describe("ApplicationInsights", function () {
    describe("#setup()", function () {
        var AppInsights = require("../applicationinsights");
        var Console = require("../AutoCollection/Console");
        var Exceptions = require("../AutoCollection/Exceptions");
        var Performance = require("../AutoCollection/Performance");
        var HttpRequests = require("../AutoCollection/HttpRequests");
        var HttpDependencies = require("../AutoCollection/HttpDependencies");
        beforeEach(function () {
            Console.INSTANCE = undefined;
            Exceptions.INSTANCE = undefined;
            Performance.INSTANCE = undefined;
            HttpRequests.INSTANCE = undefined;
            HttpDependencies.INSTANCE = undefined;
        });
        it("should not warn if setup is called once", function () {
            var warnStub = sinon.stub(console, "warn");
            AppInsights.defaultClient = undefined;
            AppInsights.setup("key");
            assert.ok(warnStub.notCalled, "warning was not raised");
            warnStub.restore();
        });
        it("should warn if setup is called twice", function () {
            var warnStub = sinon.stub(console, "warn");
            AppInsights.defaultClient = undefined;
            AppInsights.setup("key");
            AppInsights.setup("key");
            assert.ok(warnStub.calledOn, "warning was raised");
            warnStub.restore();
        });
        it("should not overwrite default client if called more than once", function () {
            var warnStub = sinon.stub(console, "warn");
            AppInsights.defaultClient = undefined;
            AppInsights.setup("key");
            var client = AppInsights.defaultClient;
            AppInsights.setup("key");
            AppInsights.setup("key");
            AppInsights.setup("key");
            assert.ok(client === AppInsights.defaultClient, "client is not overwritten");
            warnStub.restore();
        });
    });
    describe("#start()", function () {
        var AppInsights = require("../applicationinsights");
        var Console = require("../AutoCollection/Console");
        var Exceptions = require("../AutoCollection/Exceptions");
        var Performance = require("../AutoCollection/Performance");
        var HttpRequests = require("../AutoCollection/HttpRequests");
        var HttpDependencies = require("../AutoCollection/HttpDependencies");
        beforeEach(function () {
            Console.INSTANCE = undefined;
            Exceptions.INSTANCE = undefined;
            Performance.INSTANCE = undefined;
            HttpRequests.INSTANCE = undefined;
            HttpDependencies.INSTANCE = undefined;
        });
        afterEach(function () { return AppInsights.defaultClient = undefined; });
        it("should warn if start is called before setup", function () {
            var warnStub = sinon.stub(console, "warn");
            AppInsights.start();
            assert.ok(warnStub.calledOn, "warning was raised");
            warnStub.restore();
        });
        it("should not warn if start is called after setup", function () {
            var warnStub = sinon.stub(console, "warn");
            AppInsights.setup("key").start();
            assert.ok(warnStub.notCalled, "warning was not raised");
            warnStub.restore();
        });
        it("should not start live metrics", function () {
            AppInsights.setup("key").start();
            assert.equal(AppInsights.liveMetricsClient, undefined, "live metrics client is not defined");
        });
    });
    describe("#setDistributedTracingMode", function () {
        var AppInsights = require("../applicationinsights");
        var CorrelationIdManager = require("../Library/CorrelationIdManager");
        beforeEach(function () {
            AppInsights.dispose();
        });
        afterEach(function () {
            AppInsights.dispose();
        });
        it("should enable AI tracing mode by default", function () {
            AppInsights.setup("key").start();
            assert.equal(CorrelationIdManager.w3cEnabled, false);
        });
        it("should be able to enable W3C tracing mode via enum", function () {
            AppInsights.setup("key").setDistributedTracingMode(applicationinsights_1.DistributedTracingModes.AI_AND_W3C).start();
            assert.ok(CorrelationIdManager.w3cEnabled);
        });
        it("should be able to enable W3C tracing mode via number", function () {
            assert.equal(applicationinsights_1.DistributedTracingModes.AI_AND_W3C, 1);
            AppInsights.setup("key").setDistributedTracingMode(1).start();
            assert.ok(CorrelationIdManager.w3cEnabled);
        });
    });
    describe("#setAutoCollect", function () {
        var AppInsights = require("../applicationinsights");
        var Console = require("../AutoCollection/Console");
        var Exceptions = require("../AutoCollection/Exceptions");
        var Performance = require("../AutoCollection/Performance");
        var HttpRequests = require("../AutoCollection/HttpRequests");
        var HttpDependencies = require("../AutoCollection/HttpDependencies");
        beforeEach(function () {
            AppInsights.defaultClient = undefined;
            Console.INSTANCE = undefined;
            Exceptions.INSTANCE = undefined;
            Performance.INSTANCE = undefined;
            HttpRequests.INSTANCE = undefined;
            HttpDependencies.INSTANCE = undefined;
        });
        it("auto-collection is initialized by default", function () {
            AppInsights.setup("key").start();
            //assert.ok(Console.INSTANCE.isInitialized());
            assert.ok(Exceptions.INSTANCE.isInitialized());
            assert.ok(Performance.INSTANCE.isInitialized());
            assert.ok(HttpRequests.INSTANCE.isInitialized());
            assert.ok(HttpRequests.INSTANCE.isAutoCorrelating());
            assert.ok(HttpDependencies.INSTANCE.isInitialized());
        });
        it("auto-collection is not initialized if disabled before 'start'", function () {
            AppInsights.setup("key")
                .setAutoCollectConsole(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectRequests(false)
                .setAutoCollectDependencies(false)
                .setAutoDependencyCorrelation(false)
                .start();
            assert.ok(!Console.INSTANCE.isInitialized());
            assert.ok(!Exceptions.INSTANCE.isInitialized());
            assert.ok(!Performance.INSTANCE.isInitialized());
            assert.ok(!HttpRequests.INSTANCE.isInitialized());
            assert.ok(!HttpRequests.INSTANCE.isAutoCorrelating());
            assert.ok(!HttpDependencies.INSTANCE.isInitialized());
        });
    });
    describe("#Provide access to contracts", function () {
        var AppInsights = require("../applicationinsights");
        var Contracts = require("../Declarations/Contracts");
        it("should provide access to severity levels", function () {
            assert.equal(AppInsights.Contracts.SeverityLevel.Information, Contracts.SeverityLevel.Information);
        });
    });
    describe("#getCorrelationContext", function () {
        var AppInsights = require("../applicationinsights");
        var Contracts = require("../Declarations/Contracts");
        var CCM = require("../AutoCollection/CorrelationContextManager").CorrelationContextManager;
        var origGCC = CCM.getCurrentContext;
        beforeEach(function () {
            CCM.getCurrentContext = function () { return 'context'; };
        });
        afterEach(function () {
            CCM.getCurrentContext = origGCC;
            CCM.hasEverEnabled = false;
            CCM.cls = undefined;
            CCM.disable();
            AppInsights.dispose();
        });
        it("should provide a context if correlating", function () {
            AppInsights.setup("key")
                .setAutoDependencyCorrelation(true)
                .start();
            assert.equal(AppInsights.getCorrelationContext(), 'context');
        });
        it("should provide a cls-hooked context if force flag set to true", function () {
            if (CCM.canUseClsHooked()) {
                AppInsights.setup("key")
                    .setAutoDependencyCorrelation(true, true)
                    .start();
                assert.equal(AppInsights.getCorrelationContext(), 'context');
                if (CCM.isNodeVersionCompatible()) {
                    assert.equal(CCM.cls, require('cls-hooked'));
                }
            }
        });
        it("should provide a continuation-local-storage context if force flag set to false", function () {
            AppInsights.setup("key")
                .setAutoDependencyCorrelation(true, false)
                .start();
            assert.equal(AppInsights.getCorrelationContext(), 'context');
            if (CCM.isNodeVersionCompatible()) {
                assert.equal(CCM.cls, require('continuation-local-storage'));
            }
        });
        it("should not provide a context if not correlating", function () {
            AppInsights.setup("key")
                .setAutoDependencyCorrelation(false)
                .start();
            assert.equal(AppInsights.getCorrelationContext(), null);
        });
    });
});
//# sourceMappingURL=applicationInsights.tests.js.map