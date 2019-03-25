"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var HttpDependencyParser = require("../../AutoCollection/HttpDependencyParser");
var Contracts = require("../../Declarations/Contracts");
describe("AutoCollection/HttpDependencyParser", function () {
    describe("#getDependencyData()", function () {
        var request = {
            agent: { protocol: "http" },
        };
        var response = {};
        it("should return correct data for a URL string", function () {
            request["method"] = "GET";
            var parser = new HttpDependencyParser("http://bing.com/search", request);
            response.statusCode = 200;
            parser.onResponse(response);
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, true);
            assert.equal(dependencyTelemetry.name, "GET /search");
            assert.equal(dependencyTelemetry.data, "http://bing.com/search");
            assert.equal(dependencyTelemetry.target, "bing.com");
        });
        it("should return correct data for a posted URL with query string", function () {
            request["method"] = "POST";
            var parser = new HttpDependencyParser("http://bing.com/search?q=test", request);
            response.statusCode = 200;
            parser.onResponse(response);
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, true);
            assert.equal(dependencyTelemetry.name, "POST /search");
            assert.equal(dependencyTelemetry.data, "http://bing.com/search?q=test");
            assert.equal(dependencyTelemetry.target, "bing.com");
        });
        it("should return correct data for a request options object", function () {
            var requestOptions = {
                host: "bing.com",
                port: 8000,
                path: "/search?q=test",
            };
            request["method"] = "POST";
            var parser = new HttpDependencyParser(requestOptions, request);
            response.statusCode = 200;
            parser.onResponse(response);
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, true);
            assert.equal(dependencyTelemetry.name, "POST /search");
            assert.equal(dependencyTelemetry.data, "http://bing.com:8000/search?q=test");
            assert.equal(dependencyTelemetry.target, "bing.com");
        });
        it("should return correct data for a request options object", function () {
            var path = "/finance/info?client=ig&q=";
            var requestOptions = {
                host: "finance.google.com",
                path: path + "msft"
            };
            request["method"] = "GET";
            var parser = new HttpDependencyParser(requestOptions, request);
            response.statusCode = 200;
            parser.onResponse(response);
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, true);
            assert.equal(dependencyTelemetry.name, "GET /finance/info");
            assert.equal(dependencyTelemetry.data, "http://finance.google.com/finance/info?client=ig&q=msft");
            assert.equal(dependencyTelemetry.target, "finance.google.com");
        });
        it("should return non-success for a request error", function () {
            request["method"] = "GET";
            var parser = new HttpDependencyParser("http://bing.com/search", request);
            parser.onError(new Error("test error message"));
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, false);
            assert.ok(dependencyTelemetry.properties);
            assert.equal(dependencyTelemetry.properties.error, "test error message");
        });
        it("should return non-success for a response error status", function () {
            request["method"] = "GET";
            var parser = new HttpDependencyParser("http://bing.com/search", request);
            response.statusCode = 400;
            parser.onResponse(response);
            var dependencyTelemetry = parser.getDependencyTelemetry();
            assert.equal(dependencyTelemetry.dependencyTypeName, Contracts.RemoteDependencyDataConstants.TYPE_HTTP);
            assert.equal(dependencyTelemetry.success, false);
        });
    });
});
//# sourceMappingURL=HttpDependencyParser.tests.js.map