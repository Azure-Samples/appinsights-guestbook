"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var http = require("http");
var https = require("https");
var url = require("url");
var Util = require("../../Library/Util");
describe("Library/Util", function () {
    describe("#getCookie(name, cookie)", function () {
        var test = function (cookie, query, expected) {
            var actual = Util.getCookie(query, cookie);
            assert.equal(expected, actual, "cookie is parsed correctly");
        };
        it("should parse expected input", function () {
            test("testCookie=id|acq|renewal", "testCookie", "id|acq|renewal");
        });
        it("should parse expected input with another cookie present before", function () {
            test("other=foo; testCookie=id|acq|renewal", "testCookie", "id|acq|renewal");
        });
        it("should parse expected input with another cookie present after", function () {
            test("another=bar; ;a=testCookie=; testCookie=id|acq|renewal; other=foo|3|testCookie=", "testCookie", "id|acq|renewal");
        });
        it("should ignore similar names", function () {
            test("xtestCookiex=id|acq|renewal", "testCookie", "");
        });
        it("should not crash on unexpected input", function () {
            test("", "testCookie", "");
        });
    });
    describe("#trim(str)", function () {
        it("should not crash", function () {
            assert.doesNotThrow(function () { return Util.trim(undefined); });
            assert.doesNotThrow(function () { return Util.trim(null); });
            assert.doesNotThrow(function () { return Util.trim(""); });
            assert.doesNotThrow(function () { return Util.trim(3); });
            assert.doesNotThrow(function () { return Util.trim({}); });
            assert.doesNotThrow(function () { return Util.trim([]); });
        });
        it("should trim strings", function () {
            assert.equal(Util.trim(""), "");
            assert.equal(Util.trim("\t"), "");
            assert.equal(Util.trim("\n"), "");
            assert.equal(Util.trim("\t\n\r test \t\n\r"), "test");
            assert.equal(Util.trim("\t\n\r test \t\n\r test \t\n\r"), "test \t\n\r test");
        });
    });
    describe("#w3cTraceId()", function () {
        it("should generate a valid trace id", function () {
            var mathStub = sinon.stub(Math, "random", function () { return 0; });
            var expected = "00000000000040008000000000000000";
            var actual = Util.w3cTraceId();
            assert.equal(actual, expected, "expected guid was generated");
            mathStub.restore();
        });
        it("should generate a valid trace id (conformance rules)", function () {
            var alreadySeen = {};
            for (var i = 0; i < 10; i++) {
                var traceId = Util.w3cTraceId();
                assert.equal(traceId.length, 32);
                assert.equal(traceId, traceId.toLowerCase());
                assert.equal(traceId, traceId.replace(/[^a-z0-9]/g, ''));
                assert.ok(!alreadySeen[traceId]);
                alreadySeen[traceId] = true;
            }
        });
    });
    describe("#isArray(obj)", function () {
        it("should detect if an object is an array", function () {
            assert.ok(Util.isArray([]));
            assert.ok(!Util.isArray("sdf"));
            assert.ok(Util.isArray([0, 1]));
            assert.ok(!Util.isArray({ length: "" }));
            assert.ok(!Util.isArray({ length: 10 }));
        });
    });
    describe("#isError(obj)", function () {
        it("should detect if an object is an instance of Error", function () {
            var MyError = (function (_super) {
                __extends(MyError, _super);
                function MyError() {
                    return _super.call(this) || this;
                }
                return MyError;
            }(Error));
            assert.ok(!Util.isError(undefined));
            assert.ok(!Util.isError(null));
            assert.ok(!Util.isError(true));
            assert.ok(!Util.isError(1));
            assert.ok(!Util.isError(""));
            assert.ok(!Util.isError([]));
            assert.ok(!Util.isError({}));
            assert.ok(Util.isError(new Error()));
            assert.ok(Util.isError(new MyError()));
        });
    });
    describe("#random32()", function () {
        var test = function (i, expected) {
            var mathStub = sinon.stub(Math, "random", function () { return i; });
            assert.equal(Util.random32(), expected);
            mathStub.restore();
        };
        it("should generate a number in the range [-0x80000000..0x7FFFFFFF]", function () {
            test(0, 0);
            test(0.125, 0x20000000);
            test(0.25, 0x40000000);
            test(0.5, -0x80000000);
            test(0.75, -0x40000000);
            test(1.0, 0);
        });
    });
    describe("#randomu32()", function () {
        var test = function (i, expected) {
            var mathStub = sinon.stub(Math, "random", function () { return i; });
            assert.equal(Util.randomu32(), expected);
            mathStub.restore();
        };
        it("should generate a number in the range [0x00000000..0xFFFFFFFF]", function () {
            test(0, 0x80000000);
            test(0.125, 0xA0000000);
            test(0.25, 0xC0000000);
            test(0.5, 0x00000000);
            test(0.75, 0x40000000);
            test(1.0, 0x80000000);
        });
    });
    describe("#uint32ArrayToBase64()", function () {
        it("should convert an 32-bit array to Base64", function () {
            assert.equal(Util.int32ArrayToBase64([-1, -1, -1, -1]), "/////////////////////w");
            assert.equal(Util.int32ArrayToBase64([0, 0, 0, 0]), "AAAAAAAAAAAAAAAAAAAAAA");
            assert.equal(Util.int32ArrayToBase64([0x1234567]), "ASNFZw");
        });
    });
    describe("#msToTimeSpan(totalMs)", function () {
        var test = function (input, expected, message) {
            var actual = Util.msToTimeSpan(input);
            assert.equal(expected, actual, message);
        };
        it("should convert milliseconds to a c# timespan", function () {
            test(0, "00:00:00.000", "zero");
            test(1, "00:00:00.001", "milliseconds digit 1");
            test(10, "00:00:00.010", "milliseconds digit 2");
            test(100, "00:00:00.100", "milliseconds digit 3");
            test(1 * 1000, "00:00:01.000", "seconds digit 1");
            test(10 * 1000, "00:00:10.000", "seconds digit 2");
            test(1 * 60 * 1000, "00:01:00.000", "minutes digit 1");
            test(10 * 60 * 1000, "00:10:00.000", "minutes digit 2");
            test(1 * 60 * 60 * 1000, "01:00:00.000", "hours digit 1");
            test(10 * 60 * 60 * 1000, "10:00:00.000", "hours digit 2");
            test(24 * 60 * 60 * 1000, "1.00:00:00.000", "hours overflow");
            test(11 * 3600000 + 11 * 60000 + 11111, "11:11:11.111", "all digits");
            test(5 * 86400000 + 13 * 3600000 + 9 * 60000 + 8 * 1000 + 789, "5.13:09:08.789", "all digits with days");
            test(1001.505, "00:00:01.001505", "fractional milliseconds");
            test(1001.5, "00:00:01.0015", "fractional milliseconds - not all precision 1");
            test(1001.55, "00:00:01.00155", "fractional milliseconds - not all precision 2");
            test(1001.5059, "00:00:01.0015059", "fractional milliseconds - all digits");
            test(1001.50559, "00:00:01.0015056", "fractional milliseconds - too many digits, round up");
        });
        it("should handle invalid input", function () {
            test("", "00:00:00.000", "invalid input");
            test("'", "00:00:00.000", "invalid input");
            test(NaN, "00:00:00.000", "invalid input");
            test({}, "00:00:00.000", "invalid input");
            test([], "00:00:00.000", "invalid input");
            test(-1, "00:00:00.000", "invalid input");
        });
    });
    describe("#validateStringMap", function () {
        it("should only allow string:string", function () {
            assert.equal(Util.validateStringMap(undefined), undefined);
            assert.equal(Util.validateStringMap(1), undefined);
            assert.equal(Util.validateStringMap(true), undefined);
            assert.equal(Util.validateStringMap("test"), undefined);
            assert.equal(Util.validateStringMap(function () { return null; }), undefined);
            assert.deepEqual(Util.validateStringMap({ a: {} }), { a: "{}" });
            assert.deepEqual(Util.validateStringMap({ a: 3, b: "test" }), { a: "3", b: "test" });
            assert.deepEqual(Util.validateStringMap({ a: 0, b: null, c: undefined, d: [], e: '', f: -1, g: true, h: false }), { a: "0", b: "", c: "", d: "[]", e: "", f: "-1", g: "true", h: "false" });
            assert.deepEqual(Util.validateStringMap({ d: new Date("1995-12-17T03:24:00") }), { d: new Date("1995-12-17T03:24:00").toJSON() });
        });
        it("skips functions", function () {
            assert.deepEqual(Util.validateStringMap({ f: function () { } }), {});
        });
        it("should gracefully handle errors", function () {
            var vanillaError = new Error("Test userland error");
            var mapped = Util.validateStringMap({ error: vanillaError });
            var stringMapped = JSON.parse(mapped.error);
            assert.equal(stringMapped.message, "Test userland error");
            assert.equal(stringMapped.stack, undefined);
            assert.equal(stringMapped.code, "");
            var errorWithCode = new Error("Test error with code");
            errorWithCode.code = 418;
            var idMapped = Util.validateStringMap({ error: errorWithCode });
            assert.equal(JSON.parse(idMapped.error).code, 418);
        });
        it("supports object and string .toJSON return values", function () {
            var complex = {
                secret: "private",
                isPublic: "public",
                toJSON: function () {
                    return {
                        isPublic: this.isPublic,
                    };
                },
            };
            var d = new Date(1971, 5, 28);
            var mapped = Util.validateStringMap({ date: d, complex: complex });
            assert.deepEqual(JSON.parse(mapped.complex), { isPublic: "public" });
            assert.equal(mapped.date, d.toJSON());
        });
        it("should handle circular references", function () {
            var circObj = {};
            circObj.test = true;
            circObj.circular = circObj;
            circObj.arr = [0, 1, circObj.circular];
            var nodeVer = process.versions.node.split(".");
            if (parseInt(nodeVer[0]) >= 12) {
                // node12 changed the error string
                assert.deepEqual(Util.validateStringMap(circObj), {
                    test: "true",
                    circular: "Object (Error: Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'circular' closes the circle)",
                    arr: "Array (Error: Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'circular' closes the circle)",
                });
            }
            else {
                assert.deepEqual(Util.validateStringMap(circObj), {
                    test: "true",
                    circular: "Object (Error: Converting circular structure to JSON)",
                    arr: "Array (Error: Converting circular structure to JSON)",
                });
            }
        });
    });
    describe("#canIncludeCorrelationHeader", function () {
        it("should return true if arguments are missing", function () {
            assert.equal(Util.canIncludeCorrelationHeader(null, null), true);
            assert.equal(Util.canIncludeCorrelationHeader({ config: null }, null), true);
            assert.equal(Util.canIncludeCorrelationHeader({ config: { correlationHeaderExcludedDomains: [] } }, null), true);
        });
        it("should return true if domain is not on the excluded list", function () {
            var client = { config: { correlationHeaderExcludedDomains: ["example.com", "bing.net", "abc.bing.com"] } };
            var url = "http://bing.com/search?q=example.com";
            assert.equal(Util.canIncludeCorrelationHeader(client, url), true);
        });
        it("should return false if domain is on the excluded list", function () {
            var client = { config: { correlationHeaderExcludedDomains: ["bing.com", "bing.net"] } };
            var url = "http://bing.com/search?q=node";
            assert.equal(Util.canIncludeCorrelationHeader(client, url), false);
            var urlSecure = "https://bing.com/search?q=node";
            assert.equal(Util.canIncludeCorrelationHeader(client, urlSecure), false);
            var secondDomainUrl = "http://bing.net/search?q=node";
            assert.equal(Util.canIncludeCorrelationHeader(client, secondDomainUrl), false);
        });
        it("can take wildcards in the excluded domain list", function () {
            var client = { config: { correlationHeaderExcludedDomains: ["*.bing.com"] } };
            var url = "https://abc.def.bing.com";
            assert.equal(Util.canIncludeCorrelationHeader(client, url), false);
        });
    });
    describe("#makeRequest()", function () {
        var proxyUrl = "http://10.0.0.1:3128";
        var proxyUrlHttps = "https://10.0.0.1:3128";
        var proxyUrlParsed = url.parse(proxyUrl);
        var options = {
            method: "GET",
            headers: {
                "Content-Type": "application/x-json-stream"
            }
        };
        describe("for http request", function () {
            var requestUrl = "http://abc.def.bing.com";
            var requestUrlParsed = url.parse(requestUrl);
            beforeEach(function () {
                if (process.env.hasOwnProperty('https_proxy')) {
                    delete process.env.https_proxy;
                }
                if (process.env.hasOwnProperty('http_proxy')) {
                    delete process.env.http_proxy;
                }
                if (process.env.hasOwnProperty('no_proxy')) {
                    delete process.env.no_proxy;
                }
                sinon.stub(http, 'request');
                sinon.stub(https, 'request');
            });
            afterEach(function () {
                http.request.restore();
                https.request.restore();
            });
            it("should not override options when http_proxy not defined", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: undefined };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(http.request.calledOnce, true);
                assert.deepEqual(http.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(http.request.getCall(0).args[1], callback);
            });
            it("should not override options when http_proxy not defined and https_proxy is defined", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: proxyUrl };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(http.request.calledOnce, true);
                assert.deepEqual(http.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(http.request.getCall(0).args[1], callback);
            });
            it("should override options when http_proxy is defined with the correct values", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { host: proxyUrlParsed.hostname, port: proxyUrlParsed.port, path: requestUrl, headers: __assign({}, options.headers, { Host: requestUrlParsed.hostname }) });
                var config = { proxyHttpUrl: proxyUrl, proxyHttpsUrl: undefined };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(http.request.calledOnce, true);
                assert.deepEqual(http.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(http.request.getCall(0).args[1], callback);
            });
        });
        describe("for https request", function () {
            var requestUrl = "https://abc.def.bing.com";
            var requestUrlParsed = url.parse(requestUrl);
            beforeEach(function () {
                if (process.env.hasOwnProperty('https_proxy')) {
                    delete process.env.https_proxy;
                }
                if (process.env.hasOwnProperty('http_proxy')) {
                    delete process.env.http_proxy;
                }
                if (process.env.hasOwnProperty('no_proxy')) {
                    delete process.env.no_proxy;
                }
                sinon.stub(http, 'request');
                sinon.stub(https, 'request');
            });
            afterEach(function () {
                http.request.restore();
                https.request.restore();
            });
            it("should not override options when https_proxy not defined", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { agent: Util.tlsRestrictedAgent, host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: undefined };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(https.request.calledOnce, true, "https.request should be called");
                assert.deepEqual(https.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(https.request.getCall(0).args[1], callback);
            });
            it("should not override options when https_proxy not defined (custom agent - not applied)", function () {
                var customAgent = new https.Agent();
                var reqOptions = __assign({}, options, { agent: customAgent });
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { agent: Util.tlsRestrictedAgent, host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: undefined };
                var req = Util.makeRequest(config, requestUrl, reqOptions, callback);
                assert.equal(https.request.calledOnce, true, "https.request should be called");
                assert.deepEqual(https.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(https.request.getCall(0).args[1], callback);
            });
            it("should not override options when https_proxy not defined (custom agent - applied)", function () {
                var customAgent = new https.Agent();
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { agent: customAgent, host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: undefined, httpsAgent: customAgent };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(https.request.calledOnce, true, "https.request should be called");
                assert.deepEqual(https.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(https.request.getCall(0).args[1], callback);
            });
            it("should not override options when https_proxy not defined and http_proxy is defined", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { agent: Util.tlsRestrictedAgent, host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: proxyUrl, proxyHttpsUrl: undefined };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(https.request.calledOnce, true);
                assert.deepEqual(https.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(https.request.getCall(0).args[1], callback);
            });
            it("should override options when https_proxy is defined with the correct values", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { host: proxyUrlParsed.hostname, port: proxyUrlParsed.port, path: requestUrl, headers: __assign({}, options.headers, { Host: requestUrlParsed.hostname }) });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: proxyUrl };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(https.request.calledOnce, false);
                assert.equal(http.request.calledOnce, true);
                assert.deepEqual(http.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(http.request.getCall(0).args[1], callback);
            });
            it("should not override options when https_proxy is defined with a proxy using https", function () {
                var callback = sinon.spy();
                var expectedOptions = __assign({}, options, { agent: Util.tlsRestrictedAgent, host: requestUrlParsed.hostname, port: requestUrlParsed.port, path: requestUrlParsed.pathname });
                var config = { proxyHttpUrl: undefined, proxyHttpsUrl: proxyUrlHttps };
                var req = Util.makeRequest(config, requestUrl, options, callback);
                assert.equal(https.request.calledOnce, true);
                assert.equal(http.request.calledOnce, false);
                assert.deepEqual(https.request.getCall(0).args[0], expectedOptions);
                assert.deepEqual(https.request.getCall(0).args[1], callback);
            });
        });
    });
});
//# sourceMappingURL=Util.tests.js.map