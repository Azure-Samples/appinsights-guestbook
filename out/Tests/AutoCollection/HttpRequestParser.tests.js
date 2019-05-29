"use strict";
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
var HttpRequestParser = require("../../AutoCollection/HttpRequestParser");
var CorrelationIdManager = require("../../Library/CorrelationIdManager");
var Traceparent = require("../../Library/Traceparent");
describe("AutoCollection/HttpRequestParser", function () {
    describe("#parseId()", function () {
        it("should extract guid out of cookie", function () {
            var cookieValue = "id|1234|1234";
            var actual = HttpRequestParser.parseId(cookieValue);
            assert.equal("id", actual, "id in cookie is parsed correctly");
        });
    });
    describe("#w3c", function () {
        var backCompatFormat = /^\|[0-z]{32}\.[0-z]{16}\./g; // |traceId.spanId.
        var request = {
            method: "GET",
            url: "/search?q=test",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com"
            }
        };
        var w3cRequest = __assign({}, request, { headers: __assign({}, request.headers, { traceparent: "00-26130040769d49c4826831c978e85131-96665a1c28c5482e-00" }) });
        var legacyRequest = __assign({}, request, { headers: __assign({}, request.headers, { "request-id": "|abc.def." }) });
        var legacyRequestW3C = __assign({}, request, { headers: __assign({}, request.headers, { "request-id": "|26130040769d49c4826831c978e85131.96665a1c28c5482e." }) });
        var legacyRequestUnique = __assign({}, request, { headers: __assign({}, request.headers, { "request-id": "abc" }) });
        var legacyRequestUniqueW3C = __assign({}, request, { headers: __assign({}, request.headers, { "request-id": "26130040769d49c4826831c978e85131" }) });
        before(function () {
            CorrelationIdManager.w3cEnabled = true;
        });
        after(function () {
            CorrelationIdManager.w3cEnabled = false;
        });
        it("should parse traceparent if it is available and w3c tracing is enabled", function () {
            var helper = new HttpRequestParser(w3cRequest);
            var requestTags = helper.getRequestTags({});
            assert.equal(requestTags[HttpRequestParser.keys.operationId], "26130040769d49c4826831c978e85131");
            assert.equal(requestTags[HttpRequestParser.keys.operationParentId], "|26130040769d49c4826831c978e85131.96665a1c28c5482e.");
            assert.ok(Traceparent.isValidSpanId(helper["traceparent"].spanId));
        });
        it("if w3c tracing is enabled and !traceparent && request-id ~ |X.Y., generate traceparent", function () {
            var helper = new HttpRequestParser(legacyRequest);
            var requestTags = helper.getRequestTags({});
            assert.equal(helper["legacyRootId"], "abc");
            assert.equal(helper["parentId"], legacyRequest.headers["request-id"]);
            assert.ok(helper["requestId"].match(backCompatFormat));
            assert.ok(CorrelationIdManager.isValidW3CId(requestTags[HttpRequestParser.keys.operationId]));
            assert.ok(CorrelationIdManager.isValidW3CId(helper["requestId"].substr(1, 32)));
            var traceparent = helper["traceparent"];
            assert.equal(traceparent.version, "00");
            assert.ok(CorrelationIdManager.isValidW3CId(traceparent.traceId));
            assert.ok(Traceparent.isValidSpanId(traceparent.spanId));
            assert.notEqual(traceparent.traceId, traceparent.spanId);
            assert.equal(traceparent.traceFlag, "00");
        });
        it("if w3c tracing is enabled and request-id in format of X", function () {
            var helper = new HttpRequestParser(legacyRequestUnique);
            var requestTags = helper.getRequestTags({});
            assert.equal(helper["parentId"], legacyRequestUnique.headers["request-id"], "parentId is same as request-id");
            assert.ok(helper["requestId"].match(backCompatFormat));
            assert.equal(helper["legacyRootId"], "abc");
            assert.ok(CorrelationIdManager.isValidW3CId(requestTags[HttpRequestParser.keys.operationId]));
            var traceparent = helper["traceparent"];
            assert.equal(traceparent.version, "00");
            assert.ok(CorrelationIdManager.isValidW3CId(traceparent.traceId));
            assert.ok(Traceparent.isValidSpanId(traceparent.spanId));
            assert.notEqual(traceparent.traceId, traceparent.spanId);
            assert.equal(traceparent.traceFlag, "00");
        });
        it("should generate a traceparent if both tracing headers are not present (p4)", function () {
            var helper = new HttpRequestParser(request);
            var requestTags = helper.getRequestTags({});
            assert.ok(!helper["parentId"]);
            assert.ok(helper["requestId"]);
            assert.ok(helper["requestId"].match(backCompatFormat));
            assert.ok(CorrelationIdManager.isValidW3CId(requestTags[HttpRequestParser.keys.operationId]));
            var traceparent = helper["traceparent"];
            assert.equal(traceparent.version, "00");
            assert.ok(CorrelationIdManager.isValidW3CId(traceparent.traceId));
            assert.ok(Traceparent.isValidSpanId(traceparent.spanId));
            assert.notEqual(traceparent.traceId, traceparent.spanId);
            assert.equal(traceparent.traceFlag, "00");
            assert.equal(traceparent.traceId, helper["operationId"]);
            assert.notEqual(traceparent.spanId, helper["operationId"]);
        });
    });
    describe("#getRequestData()", function () {
        var request = {
            method: "GET",
            url: "/search?q=test",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com"
            }
        };
        it("should return an absolute url", function () {
            var helper = new HttpRequestParser(request);
            var requestData = helper.getRequestTelemetry();
            assert.equal(requestData.url, "http://bing.com/search?q=test");
        });
        it("should return an absolute url for encrypted traffic", function () {
            request.connection.encrypted = true;
            var helper = new HttpRequestParser(request);
            var requestData = helper.getRequestTelemetry();
            assert.equal(requestData.url, "https://bing.com/search?q=test");
        });
        var requestComplex = {
            method: "GET",
            url: "/a/b/c/?q=test&test2",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com"
            }
        };
        it("should return an absolute url for complex urls", function () {
            var helper = new HttpRequestParser(requestComplex);
            var requestData = helper.getRequestTelemetry();
            assert.equal(requestData.url, "http://bing.com/a/b/c/?q=test&test2");
        });
        var requestNoSearchParam = {
            method: "method",
            url: "/a/",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com"
            }
        };
        it("should return an absolute url when url does not have search part", function () {
            var helper = new HttpRequestParser(requestNoSearchParam);
            var requestData = helper.getRequestTelemetry();
            assert.equal(requestData.url, "http://bing.com/a/");
        });
        var requestNoPathName = {
            method: "method",
            url: "/",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com"
            }
        };
        it("should return an absolute url when url does not have path name", function () {
            var helper = new HttpRequestParser(requestNoPathName);
            var requestData = helper.getRequestTelemetry();
            assert.equal(requestData.url, "http://bing.com/");
        });
    });
    describe("#getRequestTags()", function () {
        var request = {
            method: "GET",
            url: "/search?q=test",
            connection: {
                encrypted: false
            },
            headers: {
                host: "bing.com",
                "x-forwarded-for": "123.123.123.123",
                "cookie": "ai_user=cookieUser|time;ai_session=cookieSession|time;ai_authUser=cookieAuthUser|time",
                "x-ms-request-id": "parentRequestId",
                "x-ms-request-root-id": "operationId",
            }
        };
        it("should not override context tags if they are already set", function () {
            var helper = new HttpRequestParser(request);
            var originalTags = (_a = {},
                _a[HttpRequestParser.keys.locationIp] = 'originalIp',
                _a[HttpRequestParser.keys.userId] = 'originalUserId',
                _a[HttpRequestParser.keys.userAuthUserId] = 'originalAuthUserId',
                _a[HttpRequestParser.keys.userAgent] = 'originalUserAgent',
                _a[HttpRequestParser.keys.operationName] = 'originalOperationName',
                _a[HttpRequestParser.keys.operationId] = 'originalOperationId',
                _a[HttpRequestParser.keys.operationParentId] = 'originalOperationParentId',
                _a);
            var newTags = helper.getRequestTags(originalTags);
            assert.equal(newTags[HttpRequestParser.keys.locationIp], 'originalIp');
            assert.equal(newTags[HttpRequestParser.keys.userId], 'originalUserId');
            assert.equal(newTags[HttpRequestParser.keys.userAuthUserId], 'originalAuthUserId');
            assert.equal(newTags[HttpRequestParser.keys.userAgent], 'originalUserAgent');
            assert.equal(newTags[HttpRequestParser.keys.operationName], 'originalOperationName');
            assert.equal(newTags[HttpRequestParser.keys.operationId], 'originalOperationId');
            assert.equal(newTags[HttpRequestParser.keys.operationParentId], 'originalOperationParentId');
            var _a;
        });
        it("should read tags from headers", function () {
            var helper = new HttpRequestParser(request);
            var originalTags = {};
            var newTags = helper.getRequestTags(originalTags);
            assert.equal(newTags[HttpRequestParser.keys.locationIp], '123.123.123.123');
            assert.equal(newTags[HttpRequestParser.keys.userId], 'cookieUser');
            assert.equal(newTags[HttpRequestParser.keys.userAuthUserId], 'cookieAuthUser');
            assert.equal(newTags[HttpRequestParser.keys.userAgent], undefined);
            assert.equal(newTags[HttpRequestParser.keys.operationName], 'GET /search');
            assert.equal(newTags[HttpRequestParser.keys.operationId], 'operationId');
            assert.equal(newTags[HttpRequestParser.keys.operationParentId], 'parentRequestId');
        });
    });
});
//# sourceMappingURL=HttpRequestParser.tests.js.map