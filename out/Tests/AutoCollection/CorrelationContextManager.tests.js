"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CorrelationContextManager_1 = require("../../AutoCollection/CorrelationContextManager");
var assert = require("assert");
var sinon = require("sinon");
var customProperties = {
    getProperty: function (prop) { return ""; },
    setProperty: function (prop, val) { },
};
if (CorrelationContextManager_1.CorrelationContextManager.isNodeVersionCompatible()) {
    describe("AutoCollection/CorrelationContextManager", function () {
        var testContext = {
            operation: {
                id: "test",
                name: "test",
                parentId: "test"
            },
            customProperties: customProperties
        };
        var testContext2 = {
            operation: {
                id: "test2",
                name: "test2",
                parentId: "test2"
            },
            customProperties: customProperties
        };
        describe("#enable", function () {
            beforeEach(function () {
                CorrelationContextManager_1.CorrelationContextManager.hasEverEnabled = false;
                CorrelationContextManager_1.CorrelationContextManager.cls = undefined;
                CorrelationContextManager_1.CorrelationContextManager.disable();
            });
            afterEach(function () {
                CorrelationContextManager_1.CorrelationContextManager.hasEverEnabled = false;
                CorrelationContextManager_1.CorrelationContextManager.cls = undefined;
                CorrelationContextManager_1.CorrelationContextManager.disable();
            });
            it("should use cls-hooked if force flag is set to true", function () {
                if (CorrelationContextManager_1.CorrelationContextManager.canUseClsHooked()) {
                    CorrelationContextManager_1.CorrelationContextManager.enable(true);
                    assert.deepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('cls-hooked'), 'cls-hooked is loaded');
                    assert.notDeepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('continuation-local-storage'));
                }
            });
            it("should use continuation-local-storage if force flag is set to false", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable(false);
                assert.deepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('continuation-local-storage'), 'cls is loaded');
                if (CorrelationContextManager_1.CorrelationContextManager.canUseClsHooked()) {
                    assert.notDeepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('cls-hooked'));
                }
            });
            it("should pick correct version of cls based on node version", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                if (CorrelationContextManager_1.CorrelationContextManager.shouldUseClsHooked()) {
                    assert.deepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('cls-hooked'), 'cls-hooked is loaded');
                    assert.notDeepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('continuation-local-storage'));
                }
                else {
                    assert.deepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('continuation-local-storage'), 'cls is loaded');
                    if (CorrelationContextManager_1.CorrelationContextManager.canUseClsHooked()) {
                        assert.notDeepEqual(CorrelationContextManager_1.CorrelationContextManager.cls, require('cls-hooked'));
                    }
                }
            });
        });
        describe("#getCurrentContext()", function () {
            afterEach(function () {
                // Mocha's async "done" methods cause future tests to be in the same context chain
                // Reset the context each time
                CorrelationContextManager_1.CorrelationContextManager.reset();
                assert.equal(null, CorrelationContextManager_1.CorrelationContextManager.getCurrentContext());
            });
            it("should return null if not in a context", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
            });
            it("should return null if the ContextManager is disabled (outside context)", function () {
                CorrelationContextManager_1.CorrelationContextManager.disable();
                assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
            });
            it("should return null if the ContextManager is disabled (inside context)", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    CorrelationContextManager_1.CorrelationContextManager.disable();
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                    done();
                });
            });
            it("should return the context if in a context", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), testContext);
                    done();
                });
            });
            it("should return the context if called by an asynchronous callback in a context", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext2, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), testContext2);
                        done();
                    });
                });
            });
            it("should return the correct context to asynchronous callbacks occuring in parallel", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), testContext);
                    });
                });
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext2, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), testContext2);
                    });
                });
                setTimeout(function () { return done(); }, 10);
            });
        });
        describe("#AppInsightsAsyncCorrelatedErrorWrapper", function () {
            it("should not crash if prepareStackTrace is used", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                try {
                    var stackTrace = Error['prepareStackTrace'];
                    Error['prepareStackTrace'] = function (_, stack) {
                        Error['prepareStackTrace'] = stackTrace;
                        return stack;
                    };
                    var error = new Error();
                    assert(error.stack instanceof Array);
                }
                catch (e) {
                    assert(false);
                }
            });
            it("should remove extra AI+Zone methods if prepareStackTrace is used", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var stackTrace = Error['prepareStackTrace'];
                Error['prepareStackTrace'] = function (_, stack) {
                    Error['prepareStackTrace'] = stackTrace;
                    return stack;
                };
                var error = new Error();
                var topOfStack = error.stack[0].getFileName();
                assert(topOfStack.indexOf("CorrelationContextManager.tests.js") !== -1, "Top of stack not expected to be " + topOfStack);
            });
            it("should not crash on missing filename", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var stackTrace = Error['prepareStackTrace'];
                Error['prepareStackTrace'] = function (_, stack) {
                    return stack;
                };
                var error = new Error();
                try {
                    Error['prepareStackTrace'](null, [{ getFunctionName: function () { return ''; }, getFileName: function () { return null; } }]);
                    Error['prepareStackTrace'] = stackTrace;
                }
                catch (e) {
                    Error['prepareStackTrace'] = stackTrace;
                    assert(false, "prepareStackTrace should not throw. Threw: " + e);
                }
            });
        });
        describe("#runWithContext()", function () {
            it("should run the supplied function", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var fn = sinon.spy();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, fn);
                assert(fn.calledOnce);
            });
        });
        describe("#wrapCallback()", function () {
            it("should return the supplied function if disabled", function () {
                CorrelationContextManager_1.CorrelationContextManager.disable();
                var fn = sinon.spy();
                var wrapped = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(fn);
                assert.equal(wrapped, fn);
            });
            it("should return a function that calls the supplied function if enabled", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var fn = sinon.spy();
                var wrapped = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(fn);
                wrapped();
                assert.notEqual(wrapped, fn);
                assert(fn.calledOnce);
            });
            it("should return a function that restores the context available at call-time into the supplied function if enabled", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var sharedFn = function () {
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), testContext);
                };
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    sharedFn = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(sharedFn);
                });
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext2, function () {
                    setTimeout(function () {
                        sharedFn();
                    }, 8);
                });
                setTimeout(function () { return done(); }, 10);
            });
        });
    });
}
else {
    describe("AutoCollection/CorrelationContextManager[IncompatibleVersion!]", function () {
        var testContext = {
            operation: {
                id: "test",
                name: "test",
                parentId: "test"
            },
            customProperties: customProperties
        };
        var testContext2 = {
            operation: {
                id: "test2",
                name: "test2",
                parentId: "test2"
            },
            customProperties: customProperties
        };
        describe("#getCurrentContext()", function () {
            it("should return null if not in a context", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
            });
            it("should return null if the ContextManager is disabled (outside context)", function () {
                CorrelationContextManager_1.CorrelationContextManager.disable();
                assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
            });
            it("should return null if the ContextManager is disabled (inside context)", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    CorrelationContextManager_1.CorrelationContextManager.disable();
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                    done();
                });
            });
            it("should return null if in a context", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                    done();
                });
            });
            it("should return null if called by an asynchronous callback in a context", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                        done();
                    });
                });
            });
            it("should return null to asynchronous callbacks occuring in parallel", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                    });
                });
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext2, function () {
                    process.nextTick(function () {
                        assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                    });
                });
                setTimeout(function () { return done(); }, 10);
            });
        });
        describe("#runWithContext()", function () {
            it("should run the supplied function", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var fn = sinon.spy();
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, fn);
                assert(fn.calledOnce);
            });
        });
        describe("#wrapCallback()", function () {
            it("should return the supplied function if disabled", function () {
                CorrelationContextManager_1.CorrelationContextManager.disable();
                var fn = sinon.spy();
                var wrapped = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(fn);
                assert.equal(wrapped, fn);
            });
            it("should return the supplied function if enabled", function () {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var fn = sinon.spy();
                var wrapped = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(fn);
                assert.equal(wrapped, fn);
            });
            it("should not return a function that restores a null context at call-time into the supplied function if enabled", function (done) {
                CorrelationContextManager_1.CorrelationContextManager.enable();
                var sharedFn = function () {
                    assert.equal(CorrelationContextManager_1.CorrelationContextManager.getCurrentContext(), null);
                };
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext, function () {
                    sharedFn = CorrelationContextManager_1.CorrelationContextManager.wrapCallback(sharedFn);
                });
                CorrelationContextManager_1.CorrelationContextManager.runWithContext(testContext2, function () {
                    setTimeout(function () {
                        sharedFn();
                    }, 8);
                });
                setTimeout(function () { return done(); }, 10);
            });
        });
    });
}
//# sourceMappingURL=CorrelationContextManager.tests.js.map