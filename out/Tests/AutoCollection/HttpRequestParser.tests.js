"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var HttpRequestParser = require("../../AutoCollection/HttpRequestParser");
describe("AutoCollection/HttpRequestParser", function () {
    describe("#parseId()", function () {
        it("should extract guid out of cookie", function () {
            var cookieValue = "id|1234|1234";
            var actual = HttpRequestParser.parseId(cookieValue);
            assert.equal("id", actual, "id in cookie is parsed correctly");
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