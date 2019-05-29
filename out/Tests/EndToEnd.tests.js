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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var assert = require("assert");
var path = require("path");
var os = require("os");
var fs = require("fs");
var sinon = require("sinon");
var events = require("events");
var child_process = require("child_process");
var AppInsights = require("../applicationinsights");
var Sender = require("../Library/Sender");
var Traceparent = require("../Library/Traceparent");
var events_1 = require("events");
var CorrelationContextManager_1 = require("../AutoCollection/CorrelationContextManager");
/**
 * A fake response class that passes by default
 */
var fakeResponse = (function () {
    function fakeResponse(passImmediately) {
        if (passImmediately === void 0) { passImmediately = true; }
        this.passImmediately = passImmediately;
        this.callbacks = Object.create(null);
        this.statusCode = 200;
        this.end = this.pass;
        this.once = this.on;
    }
    fakeResponse.prototype.setEncoding = function () { };
    ;
    fakeResponse.prototype.on = function (event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = callback;
        }
        else {
            var lastCallback = this.callbacks[event];
            this.callbacks[event] = function () {
                callback();
                lastCallback();
            };
        }
        if (event == "end" && this.passImmediately) {
            this.pass(true);
        }
    };
    fakeResponse.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return true;
    };
    fakeResponse.prototype.addListener = function (eventName, listener) {
        this.on(eventName, listener);
    };
    fakeResponse.prototype.removeListener = function (eventName, listener) {
    };
    fakeResponse.prototype.pass = function (test) {
        if (test === void 0) { test = false; }
        this.callbacks["data"] ? this.callbacks["data"]("data") : null;
        this.callbacks["end"] ? this.callbacks["end"]() : null;
        this.callbacks["finish"] ? this.callbacks["finish"]() : null;
    };
    return fakeResponse;
}());
/**
 * A fake request class that fails by default
 */
var fakeRequest = (function () {
    function fakeRequest(failImmediatly, url) {
        if (failImmediatly === void 0) { failImmediatly = true; }
        if (url === void 0) { url = undefined; }
        this.failImmediatly = failImmediatly;
        this.url = url;
        this.callbacks = Object.create(null);
        this.headers = {};
        this.agent = { protocol: 'http' };
    }
    fakeRequest.prototype.write = function () { };
    fakeRequest.prototype.on = function (event, callback) {
        var _this = this;
        this.callbacks[event] = callback;
        if (event === "error" && this.failImmediatly) {
            setImmediate(function () { return _this.fail(); });
        }
    };
    fakeRequest.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return true;
    };
    fakeRequest.prototype.addListener = function (eventName, listener) {
        this.on(eventName, listener);
    };
    fakeRequest.prototype.removeListener = function (eventName, listener) {
    };
    fakeRequest.prototype.fail = function () {
        this.callbacks["error"] ? this.callbacks["error"]() : null;
    };
    fakeRequest.prototype.end = function () {
        this.callbacks["end"] ? this.callbacks["end"](new fakeResponse(true)) : null;
    };
    return fakeRequest;
}());
/**
 * A fake http server
 */
var fakeHttpServer = (function (_super) {
    __extends(fakeHttpServer, _super);
    function fakeHttpServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    fakeHttpServer.prototype.setCallback = function (callback) {
        this.on("request", callback);
    };
    fakeHttpServer.prototype.listen = function (port, host, backlog, callback) {
        this.emit("listening");
    };
    fakeHttpServer.prototype.emitRequest = function (url) {
        var request = new fakeRequest(false, url);
        var response = new fakeResponse(false);
        this.emit("request", request, response);
        request.end();
    };
    return fakeHttpServer;
}(events.EventEmitter));
/**
 * A fake https server class that doesn't require ssl certs
 */
var fakeHttpsServer = (function (_super) {
    __extends(fakeHttpsServer, _super);
    function fakeHttpsServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    fakeHttpsServer.prototype.setCallback = function (callback) {
        this.on("request", callback);
    };
    fakeHttpsServer.prototype.listen = function (port, host, backlog, callback) {
        this.emit("listening");
    };
    fakeHttpsServer.prototype.emitRequest = function (url) {
        var request = new fakeRequest(false, url);
        var response = new fakeResponse(false);
        this.emit("request", request, response);
        request.end();
        response.pass();
    };
    return fakeHttpsServer;
}(events.EventEmitter));
describe("EndToEnd", function () {
    describe("Basic usage", function () {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            _this.request = sandbox.stub(https, "request", function (options, callback) {
                var req = new fakeRequest(false);
                req.on("end", callback);
                return req;
            });
        });
        afterEach(function () {
            // Dispose the default app insights client and auto collectors so that they can be reconfigured
            // cleanly for each test
            CorrelationContextManager_1.CorrelationContextManager.reset();
            AppInsights.dispose();
            sandbox.restore();
        });
        it("should send telemetry", function (done) {
            var client = new AppInsights.TelemetryClient("iKey");
            client.trackEvent({ name: "test event" });
            client.trackException({ exception: new Error("test error") });
            client.trackMetric({ name: "test metric", value: 3 });
            client.trackTrace({ message: "test trace" });
            client.flush({
                callback: function (response) {
                    assert.ok(response, "response should not be empty");
                    assert.ok(response !== "no data to send", "response should have data");
                    done();
                }
            });
        });
        it("should collect http request telemetry", function (done) {
            var fakeHttpSrv = new fakeHttpServer();
            sandbox.stub(http, 'createServer', function (callback) {
                fakeHttpSrv.setCallback(callback);
                return fakeHttpSrv;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectRequests(true)
                .start();
            var track = sandbox.stub(AppInsights.defaultClient, 'track');
            http.createServer(function (req, res) {
                assert.equal(track.callCount, 0);
                res.end();
                assert.equal(track.callCount, 1);
                done();
            });
            fakeHttpSrv.emitRequest("http://localhost:0/test");
        });
        it("should collect https request telemetry", function (done) {
            var fakeHttpSrv = new fakeHttpServer();
            sandbox.stub(https, 'createServer', function (options, callback) {
                fakeHttpSrv.setCallback(callback);
                return fakeHttpSrv;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectRequests(true)
                .start();
            var track = sandbox.stub(AppInsights.defaultClient, 'track');
            https.createServer(null, function (req, res) {
                assert.equal(track.callCount, 0);
                res.end();
                assert.equal(track.callCount, 1);
                done();
            });
            fakeHttpSrv.emitRequest("http://localhost:0/test");
        });
        it("should collect http dependency telemetry", function (done) {
            _this.request.restore();
            var eventEmitter = new events_1.EventEmitter();
            eventEmitter.method = "GET";
            sandbox.stub(http, 'request', function (url, c) {
                process.nextTick(c);
                return eventEmitter;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectDependencies(true)
                .start();
            var track = sandbox.stub(AppInsights.defaultClient, 'track');
            http.request('http://test.com', function (c) {
                assert.equal(track.callCount, 0);
                eventEmitter.emit("response", {});
                assert.equal(track.callCount, 1);
                done();
            });
        });
        it("should collect https dependency telemetry", function (done) {
            _this.request.restore();
            var eventEmitter = new events_1.EventEmitter();
            eventEmitter.method = "GET";
            sandbox.stub(https, 'request', function (url, c) {
                process.nextTick(c);
                return eventEmitter;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectDependencies(true)
                .start();
            var track = sandbox.stub(AppInsights.defaultClient, 'track');
            https.request('https://test.com', function (c) {
                assert.equal(track.callCount, 0);
                eventEmitter.emit("response", {});
                assert.equal(track.callCount, 1);
                done();
            });
        });
    });
    describe("W3C mode", function () {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });
        afterEach(function () {
            // Dispose the default app insights client and auto collectors so that they can be reconfigured
            // cleanly for each test
            CorrelationContextManager_1.CorrelationContextManager.reset();
            AppInsights.dispose();
            sandbox.restore();
        });
        it("should pass along traceparent/tracestate header if present in current operation", function (done) {
            var eventEmitter = new events_1.EventEmitter();
            eventEmitter.headers = {};
            eventEmitter["getHeader"] = function (name) { return this.headers[name]; };
            eventEmitter["setHeader"] = function (name, value) { this.headers[name] = value; };
            eventEmitter.method = "GET";
            sandbox.stub(https, 'request', function (url, c) {
                process.nextTick(c);
                return eventEmitter;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectDependencies(true)
                .start();
            sandbox.stub(CorrelationContextManager_1.CorrelationContextManager, "getCurrentContext", function () { return ({
                operation: {
                    traceparent: new Traceparent("00-5e84aff3af474588a42dcbf3bd1db95f-1fc066fb77fa43a3-00"),
                    tracestate: "sometracestate"
                },
                customProperties: {
                    serializeToHeader: function () { return null; }
                }
            }); });
            https.request('https://test.com', function (c) {
                eventEmitter.emit("response", {});
                assert.ok(eventEmitter.headers["request-id"].match(/^\|[0-z]{32}\.[0-z]{16}\./g));
                assert.ok(eventEmitter.headers.traceparent.match(/^00-5e84aff3af474588a42dcbf3bd1db95f-[0-z]{16}-00$/));
                assert.notEqual(eventEmitter.headers.traceparent, "00-5e84aff3af474588a42dcbf3bd1db95f-1fc066fb77fa43a3-00");
                assert.equal(eventEmitter.headers.tracestate, "sometracestate");
                AppInsights.defaultClient.flush();
                done();
            });
        });
        it("should create and pass a traceparent header if w3c is enabled", function (done) {
            var CorrelationIdManager = require("../Library/CorrelationIdManager");
            var eventEmitter = new events_1.EventEmitter();
            eventEmitter.headers = {};
            eventEmitter["getHeader"] = function (name) { return this.headers[name]; };
            eventEmitter["setHeader"] = function (name, value) { this.headers[name] = value; };
            eventEmitter.method = "GET";
            sandbox.stub(https, 'request', function (url, c) {
                process.nextTick(c);
                return eventEmitter;
            });
            AppInsights
                .setup("ikey")
                .setAutoCollectDependencies(true)
                .start();
            CorrelationIdManager.w3cEnabled = true;
            sandbox.stub(CorrelationContextManager_1.CorrelationContextManager, "getCurrentContext", function () { return ({
                operation: {},
                customProperties: {
                    serializeToHeader: function () { return null; }
                }
            }); });
            https.request('https://test.com', function (c) {
                eventEmitter.emit("response", {});
                assert.ok(eventEmitter.headers.traceparent.match(/^00-[0-z]{32}-[0-z]{16}-00/g), "traceparent header is passed, 00-W3C-W3C-00");
                assert.ok(eventEmitter.headers["request-id"].match(/^\|[0-z]{32}\.[0-z]{16}\./g), "back compat header is also passed, |W3C.W3C." + eventEmitter.headers["request-id"]);
                CorrelationIdManager.w3cEnabled = false;
                AppInsights.defaultClient.flush();
                done();
            });
        });
    });
    describe("Disk retry mode", function () {
        var CorrelationIdManager = require("../Library/CorrelationIdManager");
        var cidStub = null;
        var writeFile;
        var writeFileSync;
        var readFile;
        var lstat;
        var mkdir;
        var spawn;
        var spawnSync;
        beforeEach(function () {
            AppInsights.defaultClient = undefined;
            cidStub = sinon.stub(CorrelationIdManager, 'queryCorrelationId'); // TODO: Fix method of stubbing requests to allow CID to be part of E2E tests
            _this.request = sinon.stub(https, 'request');
            writeFile = sinon.stub(fs, 'writeFile');
            writeFileSync = sinon.stub(fs, 'writeFileSync');
            _this.exists = sinon.stub(fs, 'exists').yields(true);
            _this.existsSync = sinon.stub(fs, 'existsSync').returns(true);
            _this.readdir = sinon.stub(fs, 'readdir').yields(null, ['1.ai.json']);
            _this.readdirSync = sinon.stub(fs, 'readdirSync').returns(['1.ai.json']);
            _this.stat = sinon.stub(fs, 'stat').yields(null, { isFile: function () { return true; }, size: 8000 });
            _this.statSync = sinon.stub(fs, 'statSync').returns({ isFile: function () { return true; }, size: 8000 });
            lstat = sinon.stub(fs, 'lstat').yields(null, { isDirectory: function () { return true; } });
            mkdir = sinon.stub(fs, 'mkdir').yields(null);
            _this.mkdirSync = sinon.stub(fs, 'mkdirSync').returns(null);
            readFile = sinon.stub(fs, 'readFile').yields(null, '');
            spawn = sinon.stub(child_process, 'spawn').returns({
                on: function (type, cb) {
                    if (type === 'close') {
                        cb(0);
                    }
                },
                stdout: {
                    on: function (type, cb) {
                        if (type === 'data') {
                            cb('stdoutmock');
                        }
                    }
                }
            });
            if (child_process.spawnSync) {
                spawnSync = sinon.stub(child_process, 'spawnSync').returns({ status: 0, stdout: 'stdoutmock' });
            }
        });
        afterEach(function () {
            cidStub.restore();
            _this.request.restore();
            writeFile.restore();
            _this.exists.restore();
            _this.readdir.restore();
            readFile.restore();
            writeFileSync.restore();
            _this.existsSync.restore();
            _this.stat.restore();
            lstat.restore();
            mkdir.restore();
            _this.mkdirSync.restore();
            _this.readdirSync.restore();
            _this.statSync.restore();
            spawn.restore();
            if (child_process.spawnSync) {
                spawnSync.restore();
            }
        });
        it("disabled by default for new clients", function (done) {
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("key");
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        done();
                    });
                }
            });
        });
        it("enabled by default for default client", function (done) {
            var req = new fakeRequest();
            AppInsights.setup("key").start();
            var client = AppInsights.defaultClient;
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert.equal(writeFile.callCount, 1);
                        assert.equal(spawn.callCount, os.type() === "Windows_NT" ? 2 : 0);
                        done();
                    });
                }
            });
        });
        it("stores data to disk when enabled", function (done) {
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("key");
            client.channel.setUseDiskRetryCaching(true);
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 1);
                        assert.equal(path.dirname(writeFile.firstCall.args[0]), path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key"));
                        assert.equal(writeFile.firstCall.args[2].mode, 384, "File must not have weak permissions");
                        assert.equal(spawn.callCount, 0); // Should always be 0 because of caching after first call to ICACLS
                        done();
                    });
                }
            });
        });
        it("uses WindowsIdentity to get the identity for ICACLS", function (done) {
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("uniquekey");
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            // Clear ICACLS caches for test purposes
            client.channel._sender.constructor.ACL_IDENTITY = null;
            client.channel._sender.constructor.ACLED_DIRECTORIES = {};
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert.equal(writeFile.callCount, 1);
                        assert.equal(spawn.callCount, 2);
                        // First external call should be to powershell to query WindowsIdentity
                        assert(spawn.firstCall.args[0].indexOf('powershell.exe'));
                        assert.equal(spawn.firstCall.args[1][0], "-Command");
                        assert.equal(spawn.firstCall.args[1][1], "[System.Security.Principal.WindowsIdentity]::GetCurrent().Name");
                        assert.equal(client.channel._sender.constructor.ACL_IDENTITY, 'stdoutmock');
                        // Next call should be to ICACLS (with the acquired identity)
                        assert(spawn.lastCall.args[0].indexOf('icacls.exe'));
                        assert.equal(spawn.lastCall.args[1][3], "/grant");
                        assert.equal(spawn.lastCall.args[1][4], "stdoutmock:(OI)(CI)F");
                        client.channel._sender.constructor.USE_ICACLS = origICACLS;
                        done();
                    });
                }
            });
        });
        it("refuses to store data if ACL identity fails", function (done) {
            spawn.restore();
            var tempSpawn = sinon.stub(child_process, 'spawn').returns({
                on: function (type, cb) {
                    if (type == 'close') {
                        cb(2000); // return non-zero status code
                    }
                },
                stdout: {
                    on: function (type, cb) {
                        return; // do nothing
                    }
                }
            });
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("uniquekey");
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            // Set ICACLS caches for test purposes
            client.channel._sender.constructor.ACL_IDENTITY = null;
            client.channel._sender.constructor.ACLED_DIRECTORIES = {};
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        assert.equal(tempSpawn.callCount, 1);
                        tempSpawn.restore();
                        client.channel._sender.constructor.USE_ICACLS = origICACLS;
                        done();
                    });
                }
            });
        });
        it("refuses to query for ACL identity twice", function (done) {
            spawn.restore();
            var tempSpawn = sinon.stub(child_process, 'spawn').returns({
                on: function (type, cb) {
                    if (type == 'close') {
                        cb(2000); // return non-zero status code
                    }
                },
                stdout: {
                    on: function (type, cb) {
                        return; // do nothing
                    }
                }
            });
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("uniquekey");
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            // Set ICACLS caches for test purposes
            client.channel._sender.constructor.ACL_IDENTITY = null;
            client.channel._sender.constructor.ACLED_DIRECTORIES = {};
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        assert.equal(tempSpawn.callCount, 1);
                        client.trackEvent({ name: "test event" });
                        _this.request.returns(req);
                        client.flush({
                            callback: function (response) {
                                // yield for the caching behavior
                                setImmediate(function () {
                                    // The call counts shouldnt have changed
                                    assert(writeFile.callCount === 0);
                                    assert.equal(tempSpawn.callCount, 1);
                                    tempSpawn.restore();
                                    client.channel._sender.constructor.USE_ICACLS = origICACLS;
                                    done();
                                });
                            }
                        });
                    });
                }
            });
        });
        it("refuses to query for ACL identity twice (process never returned)", function (done) {
            spawn.restore();
            var tempSpawn = sinon.stub(child_process, 'spawn').returns({
                on: function (type, cb) {
                    return; // do nothing
                },
                stdout: {
                    on: function (type, cb) {
                        return; // do nothing
                    }
                }
            });
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("uniquekey");
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            // Set ICACLS caches for test purposes
            client.channel._sender.constructor.ACL_IDENTITY = null;
            client.channel._sender.constructor.ACLED_DIRECTORIES = {};
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        assert.equal(tempSpawn.callCount, 1);
                        client.trackEvent({ name: "test event" });
                        _this.request.returns(req);
                        client.flush({
                            callback: function (response) {
                                // yield for the caching behavior
                                setImmediate(function () {
                                    // The call counts shouldnt have changed
                                    assert(writeFile.callCount === 0);
                                    assert.equal(tempSpawn.callCount, 1);
                                    tempSpawn.restore();
                                    client.channel._sender.constructor.USE_ICACLS = origICACLS;
                                    done();
                                });
                            }
                        });
                    });
                }
            });
        });
        it("refuses to store data if ICACLS fails", function (done) {
            spawn.restore();
            var tempSpawn = sinon.stub(child_process, 'spawn').returns({
                on: function (type, cb) {
                    if (type == 'close') {
                        cb(2000); // return non-zero status code
                    }
                }
            });
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("uniquekey");
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            // Set ICACLS caches for test purposes
            client.channel._sender.constructor.ACL_IDENTITY = 'testidentity'; // Don't use spawn for identity
            client.channel._sender.constructor.ACLED_DIRECTORIES = {};
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        assert.equal(tempSpawn.callCount, 1);
                        tempSpawn.restore();
                        client.channel._sender.constructor.USE_ICACLS = origICACLS;
                        done();
                    });
                }
            });
        });
        it("creates directory when nonexistent", function (done) {
            lstat.restore();
            var tempLstat = sinon.stub(fs, 'lstat').yields({ code: "ENOENT" }, null);
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("key");
            client.channel.setUseDiskRetryCaching(true);
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    setImmediate(function () {
                        assert.equal(mkdir.callCount, 1);
                        assert.equal(mkdir.firstCall.args[0], path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key"));
                        assert.equal(writeFile.callCount, 1);
                        assert.equal(path.dirname(writeFile.firstCall.args[0]), path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key"));
                        assert.equal(writeFile.firstCall.args[2].mode, 384, "File must not have weak permissions");
                        tempLstat.restore();
                        done();
                    });
                }
            });
        });
        it("does not store data when limit is below directory size", function (done) {
            var req = new fakeRequest();
            var client = new AppInsights.TelemetryClient("key");
            client.channel.setUseDiskRetryCaching(true, null, 10); // 10 bytes is less than synthetic directory size (see file size in stat mock)
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.flush({
                callback: function (response) {
                    // yield for the caching behavior
                    setImmediate(function () {
                        assert(writeFile.callCount === 0);
                        done();
                    });
                }
            });
        });
        it("checks for files when connection is back online", function (done) {
            var req = new fakeRequest(false);
            var res = new fakeResponse();
            res.statusCode = 200;
            var client = new AppInsights.TelemetryClient("key");
            client.channel.setUseDiskRetryCaching(true, 0);
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            _this.request.yields(res);
            client.flush({
                callback: function (response) {
                    // wait until sdk looks for offline files
                    setTimeout(function () {
                        assert(_this.readdir.callCount === 1);
                        assert(readFile.callCount === 1);
                        assert.equal(path.dirname(readFile.firstCall.args[0]), path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key"));
                        done();
                    }, 10);
                }
            });
        });
        it("cache payload synchronously when process crashes (Node >= 0.11.12)", function () {
            var nodeVer = process.versions.node.split(".");
            if (parseInt(nodeVer[0]) > 0 || parseInt(nodeVer[1]) > 11 || (parseInt(nodeVer[1]) == 11) && parseInt(nodeVer[2]) > 11) {
                var req = new fakeRequest(true);
                var client = new AppInsights.TelemetryClient("key2");
                client.channel.setUseDiskRetryCaching(true);
                client.trackEvent({ name: "test event" });
                _this.request.returns(req);
                client.channel.triggerSend(true);
                assert(_this.existsSync.callCount === 1);
                assert(writeFileSync.callCount === 1);
                assert.equal(spawnSync.callCount, os.type() === "Windows_NT" ? 1 : 0); // This is implicitly testing caching of ACL identity (otherwise call count would be 2 like it is the non-sync time)
                assert.equal(path.dirname(writeFileSync.firstCall.args[0]), path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key2"));
                assert.equal(writeFileSync.firstCall.args[2].mode, 384, "File must not have weak permissions");
            }
        });
        it("cache payload synchronously when process crashes (Node < 0.11.12, ICACLS)", function () {
            var nodeVer = process.versions.node.split(".");
            if (!(parseInt(nodeVer[0]) > 0 || parseInt(nodeVer[1]) > 11 || (parseInt(nodeVer[1]) == 11) && parseInt(nodeVer[2]) > 11)) {
                var req = new fakeRequest(true);
                var client = new AppInsights.TelemetryClient("key22");
                client.channel.setUseDiskRetryCaching(true);
                var origICACLS = client.channel._sender.constructor.USE_ICACLS;
                client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
                client.trackEvent({ name: "test event" });
                _this.request.returns(req);
                client.channel.triggerSend(true);
                assert(_this.existsSync.callCount === 1);
                assert(writeFileSync.callCount === 0);
                client.channel._sender.constructor.USE_ICACLS = origICACLS;
            }
        });
        it("cache payload synchronously when process crashes (Node < 0.11.12, Non-ICACLS)", function () {
            var nodeVer = process.versions.node.split(".");
            if (!(parseInt(nodeVer[0]) > 0 || parseInt(nodeVer[1]) > 11 || (parseInt(nodeVer[1]) == 11) && parseInt(nodeVer[2]) > 11)) {
                var req = new fakeRequest(true);
                var client = new AppInsights.TelemetryClient("key23");
                client.channel.setUseDiskRetryCaching(true);
                var origICACLS = client.channel._sender.constructor.USE_ICACLS;
                client.channel._sender.constructor.USE_ICACLS = false; // Simulate Non-ICACLS environment even on Windows
                client.trackEvent({ name: "test event" });
                _this.request.returns(req);
                client.channel.triggerSend(true);
                assert(_this.existsSync.callCount === 1);
                assert(writeFileSync.callCount === 1);
                assert.equal(path.dirname(writeFileSync.firstCall.args[0]), path.join(os.tmpdir(), Sender.TEMPDIR_PREFIX + "key23"));
                assert.equal(writeFileSync.firstCall.args[2].mode, 384, "File must not have weak permissions");
            }
        });
        it("use WindowsIdentity to get ACL identity when process crashes (Node > 0.11.12, ICACLS)", function () {
            var nodeVer = process.versions.node.split(".");
            if ((parseInt(nodeVer[0]) > 0 || parseInt(nodeVer[1]) > 11 || (parseInt(nodeVer[1]) == 11) && parseInt(nodeVer[2]) > 11)) {
                var req = new fakeRequest(true);
                var client = new AppInsights.TelemetryClient("key22");
                client.channel.setUseDiskRetryCaching(true);
                var origICACLS = client.channel._sender.constructor.USE_ICACLS;
                client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
                // Set ICACLS caches for test purposes
                client.channel._sender.constructor.ACL_IDENTITY = null;
                client.channel._sender.constructor.ACLED_DIRECTORIES = {};
                client.trackEvent({ name: "test event" });
                _this.request.returns(req);
                client.channel.triggerSend(true);
                // First external call should be to powershell to query WindowsIdentity
                assert(spawnSync.firstCall.args[0].indexOf('powershell.exe'));
                assert.equal(spawnSync.firstCall.args[1][0], "-Command");
                assert.equal(spawnSync.firstCall.args[1][1], "[System.Security.Principal.WindowsIdentity]::GetCurrent().Name");
                assert.equal(client.channel._sender.constructor.ACL_IDENTITY, 'stdoutmock');
                // Next call should be to ICACLS (with the acquired identity)
                assert(spawnSync.lastCall.args[0].indexOf('icacls.exe'));
                assert.equal(spawnSync.lastCall.args[1][3], "/grant");
                assert.equal(spawnSync.lastCall.args[1][4], "stdoutmock:(OI)(CI)F");
                client.channel._sender.constructor.USE_ICACLS = origICACLS;
            }
        });
        it("refuses to cache payload when process crashes if ICACLS fails", function () {
            if (child_process.spawnSync) {
                spawnSync.restore();
                var tempSpawnSync = sinon.stub(child_process, 'spawnSync').returns({ status: 2000 });
            }
            var req = new fakeRequest(true);
            var client = new AppInsights.TelemetryClient("key3"); // avoid icacls cache by making key unique
            client.channel.setUseDiskRetryCaching(true);
            var origICACLS = client.channel._sender.constructor.USE_ICACLS;
            client.channel._sender.constructor.USE_ICACLS = true; // Simulate ICACLS environment even on *nix
            client.trackEvent({ name: "test event" });
            _this.request.returns(req);
            client.channel.triggerSend(true);
            assert(_this.existsSync.callCount === 1);
            assert(writeFileSync.callCount === 0);
            if (child_process.spawnSync) {
                assert.equal(tempSpawnSync.callCount, 1);
                client.channel._sender.constructor.USE_ICACLS = origICACLS;
                tempSpawnSync.restore();
            }
        });
    });
});
//# sourceMappingURL=EndToEnd.tests.js.map