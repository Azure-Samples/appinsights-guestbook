"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var EnvelopeFactory = require("../../Library/EnvelopeFactory");
var Contracts = require("../../Declarations/Contracts");
var Client = require("../../Library/TelemetryClient");
describe("Library/EnvelopeFactory", function () {
    var properties = { p1: "p1", p2: "p2", common: "commonArg" };
    var mockData = { baseData: { properties: {} }, baseType: "BaseTestData" };
    describe("#createEnvelope()", function () {
        var commonproperties = { common1: "common1", common2: "common2", common: "common" };
        it("should assign common properties to the data", function () {
            var client1 = new Client("key");
            client1.commonProperties = commonproperties;
            client1.config.samplingPercentage = 99;
            var eventTelemetry = { name: "name" };
            eventTelemetry.properties = properties;
            var env = EnvelopeFactory.createEnvelope(eventTelemetry, Contracts.TelemetryType.Event, commonproperties, client1.context, client1.config);
            // check sample rate
            assert.equal(env.sampleRate, client1.config.samplingPercentage);
            var envData = env.data;
            // check common properties
            assert.equal(envData.baseData.properties.common1, commonproperties.common1);
            assert.equal(envData.baseData.properties.common2, commonproperties.common2);
            // check argument properties
            assert.equal(envData.baseData.properties.p1, properties.p1);
            assert.equal(envData.baseData.properties.p2, properties.p2);
            // check that argument properties overwrite common properties1
            assert.equal(envData.baseData.properties.common, properties.common);
        });
        it("should allow tags to be overwritten", function () {
            var client = new Client("key");
            var env = EnvelopeFactory.createEnvelope({ name: "name" }, Contracts.TelemetryType.Event, commonproperties, client.context, client.config);
            assert.deepEqual(env.tags, client.context.tags, "tags are set by default");
            var customTag = { "ai.cloud.roleInstance": "override" };
            var expected = {};
            for (var tag in client.context.tags) {
                expected[tag] = customTag[tag] || client.context.tags[tag];
            }
            env = EnvelopeFactory.createEnvelope({ name: "name", tagOverrides: customTag }, Contracts.TelemetryType.Event, commonproperties, client.context, client.config);
            assert.deepEqual(env.tags, expected);
        });
        it("should have valid name", function () {
            var client = new Client("key");
            var envelope = EnvelopeFactory.createEnvelope({ name: "name" }, Contracts.TelemetryType.Event, commonproperties, client.context, client.config);
            assert.equal(envelope.name, "Microsoft.ApplicationInsights.key.Event");
        });
    });
    describe("#createExceptionData()", function () {
        var simpleError;
        beforeEach(function () {
            try {
                throw Error("simple error");
            }
            catch (e) {
                simpleError = e;
            }
        });
        it("fills empty 'method' with '<no_method>'", function () {
            simpleError.stack = "  at \t (/path/file.js:12:34)\n" + simpleError.stack;
            var envelope = EnvelopeFactory.createEnvelope({ exception: simpleError }, Contracts.TelemetryType.Exception);
            var exceptionData = envelope.data;
            var actual = exceptionData.baseData.exceptions[0].parsedStack[0].method;
            var expected = "<no_method>";
            assert.deepEqual(actual, expected);
        });
        it("fills empty 'method' with '<no_filename>'", function () {
            simpleError.stack = "  at Context.<anonymous> (\t:12:34)\n" + simpleError.stack;
            var envelope = EnvelopeFactory.createEnvelope({ exception: simpleError }, Contracts.TelemetryType.Exception);
            var exceptionData = envelope.data;
            var actual = exceptionData.baseData.exceptions[0].parsedStack[0].fileName;
            var expected = "<no_filename>";
            assert.deepEqual(actual, expected);
        });
    });
});
//# sourceMappingURL=EnvelopeFactoryTests.js.map