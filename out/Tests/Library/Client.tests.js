"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var eventEmitter = require("events");
var Client = require("../../Library/NodeClient");
var Config = require("../../Library/Config");
var Contracts = require("../../Declarations/Contracts");
var RequestResponseHeaders = require("../../Library/RequestResponseHeaders");
var Util = require("../../Library/Util");
var EnvelopeFactory = require("../../Library/EnvelopeFactory");
describe("Library/TelemetryClient", function () {
    var iKey = "Instrumentation-Key-12345-6789A";
    var appId = "Application-Key-12345-6789A";
    var name = "name";
    var value = 3;
    var testEventTelemetry = { name: "testEvent" };
    var properties = { p1: "p1", p2: "p2", common: "commonArg" };
    var failedProperties = { p1: "p1", p2: "p2", common: "commonArg", errorProp: "errorVal" };
    var measurements = { m1: 1, m2: 2 };
    var client = new Client(iKey);
    client.config.correlationId = "cid-v1:" + appId;
    var trackStub;
    var triggerStub;
    var sendStub;
    var saveOnCrashStub;
    before(function () {
        trackStub = sinon.stub(client, "track");
        triggerStub = sinon.stub(client.channel, "triggerSend");
        sendStub = sinon.stub(client.channel, "send");
        saveOnCrashStub = sinon.stub(client.channel._sender, "saveOnCrash");
    });
    after(function () {
        trackStub.restore();
        triggerStub.restore();
        sendStub.restore();
        saveOnCrashStub.restore();
    });
    afterEach(function () {
        sendStub.reset();
        client.clearTelemetryProcessors();
        saveOnCrashStub.reset();
    });
    var invalidInputHelper = function (name) {
        assert.doesNotThrow(function () { return client[name](null, null); }, "#1");
        assert.doesNotThrow(function () { return client[name](undefined, undefined); }, "#2");
        assert.doesNotThrow(function () { return client[name]({}, {}); }, "#3");
        assert.doesNotThrow(function () { return client[name]([], []); }, "#4");
        assert.doesNotThrow(function () { return client[name]("", ""); }, "#5");
        assert.doesNotThrow(function () { return client[name](1, 1); }, "#6");
        assert.doesNotThrow(function () { return client[name](true, true); }, "#7");
    };
    describe("#constructor()", function () {
        it("should initialize config", function () {
            var client = new Client("key");
            assert.ok(client.config);
            assert.ok(client.config.instrumentationKey);
        });
        it("should initialize context", function () {
            var client = new Client("key");
            assert.ok(client.context);
            assert.ok(client.context.tags);
        });
        it("should initialize common properties", function () {
            var client = new Client("key");
            assert.ok(client.commonProperties);
        });
        it("should initialize channel", function () {
            var client = new Client("key");
            assert.ok(client.channel);
        });
    });
    describe("#trackEvent()", function () {
        it("should track Event with correct data", function () {
            trackStub.reset();
            client.trackEvent({ name: name });
            client.trackEvent({ name: name, properties: properties });
            client.trackEvent({ name: name, properties: properties, measurements: measurements });
            assert.ok(trackStub.calledThrice);
            var eventTelemetry1 = trackStub.firstCall.args[0];
            var eventTelemetry2 = trackStub.secondCall.args[0];
            var eventTelemetry3 = trackStub.thirdCall.args[0];
            assert.equal(eventTelemetry1.name, name);
            assert.equal(eventTelemetry2.name, name);
            assert.deepEqual(eventTelemetry2.properties, properties);
            assert.equal(eventTelemetry3.name, name);
            assert.deepEqual(eventTelemetry3.properties, properties);
            assert.equal(eventTelemetry3.measurements, measurements);
        });
        it("should not crash with invalid input", function () {
            invalidInputHelper("trackEvent");
        });
    });
    describe("#trackTrace()", function () {
        it("should track Trace with correct data", function () {
            trackStub.reset();
            client.trackTrace({ message: name });
            client.trackTrace({ message: name, severity: 0 });
            client.trackTrace({ message: name, severity: 0, properties: properties });
            assert.ok(trackStub.calledThrice);
            var traceTelemetry1 = trackStub.firstCall.args[0];
            var traceTelemetry2 = trackStub.secondCall.args[0];
            var traceTelemetry3 = trackStub.thirdCall.args[0];
            assert.equal(traceTelemetry1.message, name);
            assert.equal(traceTelemetry2.message, name);
            assert.deepEqual(traceTelemetry2.severity, 0);
            assert.equal(traceTelemetry3.message, name);
            assert.deepEqual(traceTelemetry3.severity, 0);
            assert.equal(traceTelemetry3.properties, properties);
        });
        it("should not crash with invalid input", function () {
            invalidInputHelper("trackTrace");
        });
    });
    describe("#trackException()", function () {
        it("should track Exception with correct data - Error only", function () {
            trackStub.reset();
            client.trackException({ exception: new Error(name) });
            assert.ok(trackStub.calledOnce);
            var exceptionTelemetry = trackStub.firstCall.args[0];
            assert.equal(exceptionTelemetry.exception.message, name);
        });
        it("should track Exception with correct data - Error and properties", function () {
            trackStub.reset();
            client.trackException({ exception: new Error(name), properties: properties });
            assert.ok(trackStub.calledOnce);
            var exceptionTelemetry = trackStub.firstCall.args[0];
            assert.equal(exceptionTelemetry.exception.message, name);
            assert.deepEqual(exceptionTelemetry.properties, properties);
        });
        it("should track Exception with correct data - Error, properties and measurements", function () {
            trackStub.reset();
            client.trackException({ exception: new Error(name), properties: properties, measurements: measurements });
            assert.ok(trackStub.calledOnce);
            var exceptionTelemetry = trackStub.firstCall.args[0];
            assert.equal(exceptionTelemetry.exception.message, name);
            assert.deepEqual(exceptionTelemetry.properties, properties);
            assert.deepEqual(exceptionTelemetry.measurements, measurements);
        });
        it("should not crash with invalid input", function () {
            invalidInputHelper("trackException");
        });
    });
    describe("#trackMetric()", function () {
        it("should track Metric with correct data", function () {
            trackStub.reset();
            var count = 1;
            var min = 0;
            var max = 0;
            var stdev = 0;
            client.trackMetric({ name: name, value: value });
            client.trackMetric({ name: name, value: value, count: count, min: min, max: max, stdDev: stdev, properties: properties });
            assert.ok(trackStub.calledTwice);
            var metricTelemetry1 = trackStub.firstCall.args[0];
            var metricTelemetry2 = trackStub.secondCall.args[0];
            assert.equal(metricTelemetry1.name, name);
            assert.equal(metricTelemetry1.value, value);
            assert.equal(metricTelemetry2.name, name);
            assert.equal(metricTelemetry2.value, value);
            assert.equal(metricTelemetry2.count, count);
            assert.equal(metricTelemetry2.min, min);
            assert.equal(metricTelemetry2.max, max);
            assert.equal(metricTelemetry2.stdDev, stdev);
            assert.deepEqual(metricTelemetry2.properties, properties);
        });
        it("should not crash with invalid input", function () {
            invalidInputHelper("trackMetric");
        });
    });
    describe("request tracking", function () {
        var response = {
            emitFinish: function () {
                if (this.finishCallback) {
                    this.finishCallback();
                }
            },
            once: function (event, callback) {
                if (event === 'finish') {
                    this.finishCallback = callback;
                }
                return new eventEmitter.EventEmitter();
            },
            statusCode: 200,
            headers: {},
            getHeader: function (name) { return this.headers[name]; },
            setHeader: function (name, value) { this.headers[name] = value; },
        };
        var request = {
            emitError: function () {
                if (this.errorCallback) {
                    var error = {
                        "errorProp": "errorVal"
                    };
                    this.errorCallback(error);
                }
            },
            emitResponse: function () {
                if (this.responseCallback) {
                    this.responseCallback(response);
                }
            },
            on: function (event, callback) {
                if (event === 'error') {
                    this.errorCallback = callback;
                }
                else if (event === 'response') {
                    this.responseCallback = callback;
                }
            },
            method: "GET",
            url: "/search?q=test",
            connection: {
                encrypted: false
            },
            agent: {
                protocol: 'http'
            },
            headers: {
                host: "bing.com"
            },
            getHeader: function (name) { return this.headers[name]; },
            setHeader: function (name, value) { this.headers[name] = value; },
        };
        afterEach(function () {
            delete request.headers[RequestResponseHeaders.requestContextHeader];
            delete response.headers[RequestResponseHeaders.requestContextHeader];
            client.config = new Config(iKey);
            client.config.correlationId = "cid-v1:" + appId;
        });
        function parseDuration(duration) {
            if (!duration) {
                return 0;
            }
            var parts = duration.match("(\\d\\d):(\\d\\d):(\\d\\d).(\\d\\d\\d)");
            return parseInt(parts[1]) * 60 * 60 * 1000 + parseInt(parts[2]) * 60 * 1000 + parseInt(parts[3]) * 1000 + parseInt(parts[4]);
        }
        describe("#trackNodeHttpRequest()", function () {
            var clock;
            before(function () {
                clock = sinon.useFakeTimers();
            });
            after(function () {
                clock.restore();
            });
            it("should not crash with invalid input", function () {
                invalidInputHelper("trackRequest");
            });
            it('should track request with correct data on response finish event ', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties });
                // finish event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit finish event
                clock.tick(10);
                response.emitFinish();
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                assert.equal(requestTelemetry.resultCode, "200");
                assert.deepEqual(requestTelemetry.properties, properties);
                assert.equal(requestTelemetry.duration, 10);
            });
            it('should track request with correct tags on response finish event', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties });
                // emit finish event
                response.emitFinish();
                // validate
                var args = trackStub.args;
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                var tags = requestTelemetry.tagOverrides;
                assert.equal(tags["ai.operation.name"], "GET /search");
                assert.equal(tags["ai.device.id"], "");
                assert.equal(tags["ai.device.type"], null);
            });
            it('should track request with tagOverrides on response finish event', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties, tagOverrides: { "custom": "A", "ai.device.id": "B" } });
                // emit finish event
                response.emitFinish();
                // validate
                var args = trackStub.args;
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                var tags = requestTelemetry.tagOverrides;
                assert.equal(tags["ai.operation.name"], "GET /search");
                assert.equal(tags["ai.device.id"], "B");
                assert.equal(tags["custom"], "A");
                assert.equal(tags["ai.device.type"], null);
            });
            it('should track request with correct data on request error event #1', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties });
                // finish event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit finish event
                clock.tick(10);
                request.emitError();
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                assert.equal(requestTelemetry.success, false);
                assert.deepEqual(requestTelemetry.properties, failedProperties);
                assert.equal(requestTelemetry.duration, 10);
            });
            it('should use source and target correlationId headers', function () {
                trackStub.reset();
                clock.reset();
                // Simulate an incoming request that has a different source correlationId header.
                var testCorrelationId = 'cid-v1:Application-Id-98765-4321A';
                request.headers[RequestResponseHeaders.requestContextHeader] = RequestResponseHeaders.requestContextSourceKey + "=" + testCorrelationId;
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties });
                // finish event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit finish event
                clock.tick(10);
                response.emitFinish();
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                assert.equal(requestTelemetry.source, testCorrelationId);
                // The client's correlationId should have been added as the response target correlationId header.
                assert.equal(response.headers[RequestResponseHeaders.requestContextHeader], RequestResponseHeaders.requestContextSourceKey + "=" + client.config.correlationId);
            });
            it('should NOT use source and target correlationId headers when url is on the excluded list', function () {
                trackStub.reset();
                clock.reset();
                client.config.correlationHeaderExcludedDomains = ["bing.com"];
                // Simulate an incoming request that has a different source ikey hash header.
                var testCorrelationId = 'cid-v1:Application-Id-98765-4321A';
                request.headers[RequestResponseHeaders.requestContextHeader] = RequestResponseHeaders.requestContextSourceKey + "=" + testCorrelationId;
                client.trackNodeHttpRequest({ request: request, response: response, properties: properties });
                // finish event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit finish event
                clock.tick(10);
                response.emitFinish();
                assert.ok(trackStub.calledOnce);
                assert.equal(response.headers[RequestResponseHeaders.requestContextHeader], undefined);
            });
        });
        describe("#trackNodeHttpRequestSync()", function () {
            it('should track request with correct data synchronously', function () {
                trackStub.reset();
                client.trackNodeHttpRequestSync({ request: request, response: response, duration: 100, properties: properties });
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                assert.equal(requestTelemetry.resultCode, "200");
                assert.equal(requestTelemetry.duration, 100);
                assert.deepEqual(requestTelemetry.properties, properties);
                var tags = requestTelemetry.tagOverrides;
                assert.equal(tags["ai.operation.name"], "GET /search");
                assert.equal(tags["ai.device.id"], "");
                assert.equal(tags["ai.device.type"], null);
            });
            it('should track request with correct data and tag overrides synchronously', function () {
                trackStub.reset();
                client.trackNodeHttpRequestSync({ request: request, response: response, duration: 100, properties: properties, tagOverrides: { "custom": "A", "ai.device.id": "B" } });
                assert.ok(trackStub.calledOnce);
                var requestTelemetry = trackStub.firstCall.args[0];
                assert.equal(requestTelemetry.resultCode, "200");
                assert.equal(requestTelemetry.duration, 100);
                assert.deepEqual(requestTelemetry.properties, properties);
                var tags = requestTelemetry.tagOverrides;
                assert.equal(tags["ai.operation.name"], "GET /search");
                assert.equal(tags["ai.device.id"], "B");
                assert.equal(tags["custom"], "A");
                assert.equal(tags["ai.device.type"], null);
            });
        });
        describe("#trackNodeHttpDependency()", function () {
            var clock;
            before(function () {
                clock = sinon.useFakeTimers();
            });
            after(function () {
                clock.restore();
            });
            it("should not crash with invalid input", function () {
                invalidInputHelper("trackNodeHttpDependency");
            });
            it('should track request with correct data from request options', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpDependency({
                    options: {
                        host: 'bing.com',
                        path: '/search?q=test'
                    },
                    request: request, properties: properties,
                    tagOverrides: { "custom": "A", "ai.device.id": "B" }
                });
                // response event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit response event
                clock.tick(10);
                request.emitResponse();
                assert.ok(trackStub.calledOnce);
                var dependencyTelemetry = trackStub.firstCall.args[0];
                assert.equal(dependencyTelemetry.success, true);
                assert.equal(dependencyTelemetry.duration, 10);
                assert.equal(dependencyTelemetry.name, "GET /search");
                assert.equal(dependencyTelemetry.data, "http://bing.com/search?q=test");
                assert.equal(dependencyTelemetry.target, "bing.com");
                assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
                assert.deepEqual(dependencyTelemetry.properties, properties);
                assert.deepEqual(dependencyTelemetry.tagOverrides, { "custom": "A", "ai.device.id": "B" });
            });
            it('should track request with correct data on response event', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpDependency({ options: 'http://bing.com/search?q=test', request: request, properties: properties });
                // response event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit response event
                clock.tick(10);
                request.emitResponse();
                assert.ok(trackStub.calledOnce);
                var dependencyTelemetry = trackStub.firstCall.args[0];
                assert.equal(dependencyTelemetry.success, true);
                assert.equal(dependencyTelemetry.duration, 10);
                assert.equal(dependencyTelemetry.name, "GET /search");
                assert.equal(dependencyTelemetry.data, "http://bing.com/search?q=test");
                assert.equal(dependencyTelemetry.target, "bing.com");
                assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
                assert.deepEqual(dependencyTelemetry.properties, properties);
            });
            it('should track request with correct data on request error event #2', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpDependency({ options: 'http://bing.com/search?q=test', request: request, properties: properties });
                // error event was not emitted yet
                assert.ok(trackStub.notCalled);
                // emit error event
                clock.tick(10);
                request.emitError();
                assert.ok(trackStub.calledOnce);
                var dependencyTelemetry = trackStub.firstCall.args[0];
                assert.equal(dependencyTelemetry.success, false);
                assert.equal(dependencyTelemetry.duration, 10);
                assert.equal(dependencyTelemetry.name, "GET /search");
                assert.equal(dependencyTelemetry.data, "http://bing.com/search?q=test");
                assert.equal(dependencyTelemetry.target, "bing.com");
                assert.deepEqual(dependencyTelemetry.properties, failedProperties);
            });
            it('should use source and target correlationId headers', function () {
                trackStub.reset();
                clock.reset();
                client.trackNodeHttpDependency({
                    options: {
                        host: 'bing.com',
                        path: '/search?q=test'
                    },
                    request: request, properties: properties
                });
                // The client's correlationId should have been added as the request source correlationId header.
                assert.equal(request.headers[RequestResponseHeaders.requestContextHeader], RequestResponseHeaders.requestContextSourceKey + "=" + client.config.correlationId);
                // response event was not emitted yet
                assert.ok(trackStub.notCalled);
                // Simulate a response from another service that includes a target correlationId header.
                var targetCorrelationId = "cid-v1:Application-Key-98765-4321A";
                response.headers[RequestResponseHeaders.requestContextHeader] =
                    RequestResponseHeaders.requestContextTargetKey + "=" + targetCorrelationId;
                // emit response event
                clock.tick(10);
                request.emitResponse();
                assert.ok(trackStub.calledOnce);
                var dependencyTelemetry = trackStub.firstCall.args[0];
                assert.equal(dependencyTelemetry.target, "bing.com | " + targetCorrelationId);
                assert.equal(dependencyTelemetry.dependencyTypeName, "Http (tracked component)");
            });
            it('should not set source correlationId headers when the host is on a excluded domain list', function () {
                trackStub.reset();
                clock.reset();
                client.config.correlationHeaderExcludedDomains = ["*.domain.com"];
                client.trackNodeHttpDependency({
                    options: {
                        host: 'excluded.domain.com',
                        path: '/search?q=test'
                    },
                    request: request, properties: properties
                });
                // The client's correlationId should NOT have been added for excluded domains
                assert.equal(request.headers[RequestResponseHeaders.requestContextHeader], null);
            });
        });
    });
    describe("#trackDependency()", function () {
        it("should create envelope with correct properties", function () {
            trackStub.restore();
            var commandName = "http://bing.com/search?q=test";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ name: name, data: commandName, duration: value, success: true, resultCode: "0", dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.name, name);
            assert.equal(obj0.baseData.data, commandName);
            assert.equal(obj0.baseData.target, 'bing.com');
            assert.equal(obj0.baseData.duration, Util.msToTimeSpan(value));
            assert.equal(obj0.baseData.success, true);
            assert.equal(obj0.baseData.type, dependencyTypeName);
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should create envelope with correct properties (numeric result code)", function () {
            trackStub.restore();
            var commandName = "http://bing.com/search?q=test";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ name: name, data: commandName, duration: value, success: true, resultCode: 0, dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.name, name);
            assert.equal(obj0.baseData.data, commandName);
            assert.equal(obj0.baseData.target, 'bing.com');
            assert.equal(obj0.baseData.duration, Util.msToTimeSpan(value));
            assert.equal(obj0.baseData.success, true);
            assert.equal(obj0.baseData.type, dependencyTypeName);
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should process the id when specified", function () {
            trackStub.restore();
            var commandName = "http://bing.com/search?q=test";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ id: "testid", name: name, data: commandName, duration: value, success: true, resultCode: "0", dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.id, "testid");
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should auto-generate the id when not specified", function () {
            trackStub.restore();
            var commandName = "http://bing.com/search?q=test";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ name: name, data: commandName, duration: value, success: true, resultCode: "0", dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.ok(!!obj0.baseData.id);
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should autopopulate target field for url data", function () {
            trackStub.restore();
            var commandName = "http://bing.com/search?q=test";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ name: name, data: commandName, duration: value, success: true, resultCode: "0", dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.target, "bing.com");
        });
        it("should not autopopulate target field for non-url data", function () {
            trackStub.restore();
            var commandName = "NOT A URL";
            var dependencyTypeName = "dependencyTypeName";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackDependency({ name: name, data: commandName, duration: value, success: true, resultCode: "0", dependencyTypeName: dependencyTypeName, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.target, null);
        });
    });
    describe("#trackRequest()", function () {
        it("should create envelope with correct properties", function () {
            trackStub.restore();
            var url = "http://bing.com/search?q=test";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackRequest({ url: url, source: "source", name: name, duration: value, success: true, resultCode: "200", properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.name, name);
            assert.equal(obj0.baseData.url, url);
            assert.equal(obj0.baseData.source, 'source');
            assert.equal(obj0.baseData.duration, Util.msToTimeSpan(value));
            assert.equal(obj0.baseData.success, true);
            assert.equal(obj0.baseData.responseCode, "200");
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should create envelope with correct properties (numeric resultCode)", function () {
            trackStub.restore();
            var url = "http://bing.com/search?q=test";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackRequest({ url: url, source: "source", name: name, duration: value, success: true, resultCode: 200, properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.name, name);
            assert.equal(obj0.baseData.url, url);
            assert.equal(obj0.baseData.source, 'source');
            assert.equal(obj0.baseData.duration, Util.msToTimeSpan(value));
            assert.equal(obj0.baseData.success, true);
            assert.equal(obj0.baseData.responseCode, "200");
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should process the id when specified", function () {
            trackStub.restore();
            var url = "http://bing.com/search?q=test";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackRequest({ id: "testid", url: url, source: "source", name: name, duration: value, success: true, resultCode: "200", properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.equal(obj0.baseData.id, "testid");
            assert.deepEqual(obj0.baseData.properties, properties);
        });
        it("should auto-generate the id when not specified", function () {
            trackStub.restore();
            var url = "http://bing.com/search?q=test";
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            client.trackRequest({ url: url, source: "source", name: name, duration: value, success: true, resultCode: "200", properties: properties });
            assert.ok(createEnvelopeSpy.calledOnce);
            var envelopeCreated = createEnvelopeSpy.firstCall.returnValue;
            var obj0 = envelopeCreated.data;
            createEnvelopeSpy.restore();
            assert.ok(!!obj0.baseData.id);
            assert.deepEqual(obj0.baseData.properties, properties);
        });
    });
    describe("#flush()", function () {
        afterEach(function () {
            client.clearTelemetryProcessors();
            saveOnCrashStub.reset();
            sendStub.restore();
            sendStub = sinon.stub(client.channel, "send");
            triggerStub.restore();
            triggerStub = sinon.stub(client.channel, "triggerSend");
        });
        it("should invoke the sender", function () {
            triggerStub.reset();
            client.flush();
            assert.ok(triggerStub.calledOnce);
        });
        it("should accept a callback", function () {
            triggerStub.reset();
            var callback = sinon.spy();
            client.flush({ callback: callback });
            assert.strictEqual(triggerStub.firstCall.args[0], false);
            assert.strictEqual(triggerStub.firstCall.args[1], callback);
        });
        it("should save on disk when isAppCrashing option is set to true", function () {
            sendStub.reset();
            client.flush({ isAppCrashing: true });
            assert.ok(sendStub.notCalled, "saveOnCrash should be called, not send");
            saveOnCrashStub.reset();
            // temporarily restore send and trigger stubs to allow saveOnCrash to be called
            sendStub.restore();
            triggerStub.restore();
            // fake something in the buffer
            client.channel._buffer.push("");
            client.flush({ isAppCrashing: true });
            assert.ok(saveOnCrashStub.calledOnce);
            saveOnCrashStub.restore();
        });
    });
    describe("#track()", function () {
        it("should pass data to the channel", function () {
            sendStub.reset();
            trackStub.restore();
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            trackStub = sinon.stub(client, "track");
            assert.ok(sendStub.calledOnce);
        });
        it("should send the envelope that was created", function () {
            sendStub.reset();
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            trackStub.restore();
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            trackStub = sinon.stub(client, "track");
            var expected = createEnvelopeSpy.firstCall.returnValue;
            var actual = sendStub.firstCall.args[0];
            createEnvelopeSpy.restore();
            assert.deepEqual(actual, expected);
        });
        it("should use timestamp if it was set", function () {
            var timestamp = new Date("Mon Aug 28 2017 11:44:17");
            var createEnvelopeSpy = sinon.spy(EnvelopeFactory, "createEnvelope");
            trackStub.restore();
            client.trackEvent({ name: "eventName", time: timestamp });
            trackStub = sinon.stub(client, "track");
            var envelope = createEnvelopeSpy.firstCall.returnValue;
            createEnvelopeSpy.restore();
            assert.equal(envelope.time, timestamp.toISOString());
        });
        it("telemetry processor can change the envelope", function () {
            trackStub.restore();
            var expectedName = "I was here";
            client.addTelemetryProcessor(function (env) {
                env.name = expectedName;
                return true;
            });
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.equal(sendStub.callCount, 1, "send called once");
            var actualData = sendStub.firstCall.args[0];
            assert.equal(actualData.name, expectedName, "envelope name should be changed by the processor");
        });
        it("telemetry processor can access the context object", function () {
            trackStub.restore();
            var expectedName = "I was here";
            client.addTelemetryProcessor(function (env, contextObjects) {
                env.name = contextObjects["name"];
                return true;
            });
            testEventTelemetry.contextObjects = { "name": expectedName };
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            testEventTelemetry.contextObjects = undefined;
            assert.equal(sendStub.callCount, 1, "send called once");
            var actualData = sendStub.firstCall.args[0];
            assert.equal(actualData.name, expectedName, "envelope name should be changed by the processor");
        });
        it("telemetry processors are executed in a right order", function () {
            trackStub.restore();
            client.addTelemetryProcessor(function (env) {
                env.name = "First";
                return true;
            });
            client.addTelemetryProcessor(function (env) {
                env.name += ", Second";
                return true;
            });
            client.addTelemetryProcessor(function (env) {
                env.name += ", Third";
                return true;
            });
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.equal(sendStub.callCount, 1, "send called once");
            var actualData = sendStub.firstCall.args[0];
            assert.equal(actualData.name, "First, Second, Third", "processors should executed in the right order");
        });
        it("envelope rejected by the telemetry processor will not be sent", function () {
            trackStub.restore();
            client.addTelemetryProcessor(function (env) {
                return false;
            });
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.ok(sendStub.notCalled, "send should not be called");
        });
        it("envelope is sent when processor throws exception", function () {
            trackStub.restore();
            client.addTelemetryProcessor(function (env) {
                throw "telemetry processor failed";
            });
            client.addTelemetryProcessor(function (env) {
                env.name = "more data";
                return true;
            });
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.ok(sendStub.called, "send should be called despite telemetry processor failure");
            var actualData = sendStub.firstCall.args[0];
            assert.equal(actualData.name, "more data", "more data is added as part of telemetry processor");
        });
    });
    describe("#addTelemetryProcessor()", function () {
        it("adds telemetry processor to the queue", function () {
            trackStub.restore();
            var processorExecuted = false;
            client.addTelemetryProcessor(function (env) {
                processorExecuted = true;
                return true;
            });
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.ok(processorExecuted, "telemetry processor should be executed");
        });
    });
    describe("#clearTelemetryProcessors()", function () {
        it("removes all processors from the telemetry processors list", function () {
            trackStub.restore();
            var processorExecuted = false;
            client.addTelemetryProcessor(function (env) {
                processorExecuted = true;
                return true;
            });
            client.clearTelemetryProcessors();
            client.track(testEventTelemetry, Contracts.TelemetryType.Event);
            assert.ok(!processorExecuted, "telemetry processor should NOT be executed");
        });
    });
});
//# sourceMappingURL=Client.tests.js.map