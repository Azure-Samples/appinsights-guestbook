"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var Client = require("../../Library/TelemetryClient");
var Sampling = require("../../TelemetryProcessors/SamplingTelemetryProcessor");
describe("TelemetryProcessors/SamplingTelemetryProcessor", function () {
    var iKey = "Instrumentation-Key-12345-6789A";
    var name = "name";
    var value = 3;
    var mockData = { baseData: { properties: {} }, baseType: "BaseTestData" };
    var client = new Client(iKey);
    describe("#samplingTelemetryProcessor()", function () {
        it("will not send data on 0% sampling", function () {
            mockData.sampleRate = 0;
            var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: null });
            assert.equal(result, false, "data should not pass");
        });
        it("will send MetricData data on 0% sampling", function () {
            mockData.sampleRate = 0;
            mockData.baseType = "MetricData";
            var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: null });
            mockData.baseType = "BaseTestData";
            assert.equal(result, false, "data should not pass");
        });
        it("will send data roughly 1/3 of the time on 33% sampling", function () {
            var iterations = 1000;
            var accepted = 0;
            mockData.sampleRate = 33;
            for (var i = 0; i < iterations; i++) {
                var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: null });
                if (result)
                    accepted++;
            }
            assert.ok(accepted > (iterations * 0.25), "data should pass more than 25% of the time");
            assert.ok(accepted < (iterations * 0.45), "data should pass less than 45% the time");
        });
        it("will send data roughly 1/2 of the time on 50% sampling", function () {
            var iterations = 1000;
            var accepted = 0;
            mockData.sampleRate = 50;
            for (var i = 0; i < iterations; i++) {
                var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: null });
                if (result)
                    accepted++;
            }
            assert.ok(accepted > (iterations * 0.40), "data should pass more than 40% of the time");
            assert.ok(accepted < (iterations * 0.60), "data should pass less than 60% the time");
        });
        it("will send data all of the time on 100% sampling", function () {
            var iterations = 1000;
            var accepted = 0;
            mockData.sampleRate = 100;
            for (var i = 0; i < iterations; i++) {
                var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: null });
                if (result)
                    accepted++;
            }
            assert.equal(accepted, iterations, "data should pass 100% of the time");
        });
        it("will keep all telemetry from an operation together if correlation tracking is enabled", function () {
            var iterations = 1000;
            var accepted = 0;
            mockData.sampleRate = 33;
            for (var i = 0; i < iterations; i++) {
                var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: { operation: { id: "a" } } });
                if (result)
                    accepted++;
            }
            assert.equal(accepted, iterations, "data should pass 100% of the time");
        });
        it("will keep all telemetry from an operation together if correlation tracking is enabled #2", function () {
            var iterations = 1000;
            var accepted = 0;
            mockData.sampleRate = 33;
            for (var i = 0; i < iterations; i++) {
                var result = Sampling.samplingTelemetryProcessor(mockData, { correlationContext: { operation: { id: "abc" } } });
                if (result)
                    accepted++;
            }
            assert.equal(accepted, 0, "data should pass 0% of the time");
        });
    });
    describe("#getSamplingHashCode()", function () {
        it("has results consistent with .net", function () {
            // test array is produced by .net sdk test
            var testArray = [
                ["ss", 1179811869],
                ["kxi", 34202699],
                ["wr", 1281077591],
                ["ynehgfhyuiltaiqovbpyhpm", 2139623659],
                ["iaxxtklcw", 1941943012],
                ["hjwvqjiiwhoxrtsjma", 1824011880],
                ["rpiauyg", 251412007],
                ["jekvjvh", 9189387],
                ["hq", 1807146729],
                ["kgqxrftjhefkwlufcxibwjcy", 270215819],
                ["lkfc", 1228617029],
                ["skrnpybqqu", 223230949],
                ["px", 70671963],
                ["dtn", 904623389],
                ["nqfcxobaequ", 397313566],
                ["togxlt", 948170633],
                ["jvvdkhnahkaujxarkd", 1486894898],
                ["mcloukvkamiaqja", 56804453],
                ["ornuu", 1588005865],
                ["otodvlhtvu", 1544494884],
                ["uhpwhasnvmnykjkitla", 981289895],
                ["itbnryqnjcgpmgivlghqtg", 1923061690],
                ["wauetkdnivwlafbfhiedsfx", 2114415420],
                ["fniwmeidbvd", 508699380],
                ["vuwdgoxspstvj", 1821547235],
                ["y", 1406544563],
                ["pceqcixfb", 1282453766],
                ["aentke", 255756533],
                ["ni", 1696510239],
                ["lbwehevltlnl", 1466602040],
                ["ymxql", 1974582171],
                ["mvqbaosfuip", 1560556398],
                ["urmwofajwmmlornynglm", 701710403],
                ["buptyvonyacerrt", 1315240646],
                ["cxsqcnyieliatqnwc", 76148095],
                ["svvco", 1849105799],
                ["luwmjhwyt", 553630912],
                ["lisvmmug", 822987687],
                ["mmntilfbmxwuyij", 882214597],
                ["hqmyv", 1510970959],
            ];
            var csharpMax = 2147483647;
            for (var i = 0; i < testArray.length; ++i) {
                var res = Sampling.getSamplingHashCode(testArray[i][0]);
                assert.equal(res, testArray[i][1] / csharpMax * 100);
            }
        });
    });
});
//# sourceMappingURL=SamplingTelemetryProcessor.tests.js.map