"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var AutoCollectionExceptions = require("../../AutoCollection/Exceptions");
var AppInsights = require("../../applicationinsights");
describe("AutoCollection/Exceptions", function () {
    describe("#init and dispose()", function () {
        afterEach(function () {
            AppInsights.dispose();
        });
        it("disables autocollection", function () {
            var processOnSpy = sinon.spy(global.process, "on");
            var processRemoveListenerSpy = sinon.spy(global.process, "removeListener");
            AppInsights.setup("key").setAutoCollectExceptions(true).start();
            assert.equal(processOnSpy.callCount, 2, "After enabling exception autocollection, there should be 2 calls to processOnSpy");
            assert.equal(processOnSpy.getCall(0).args[0], AutoCollectionExceptions.UNCAUGHT_EXCEPTION_HANDLER_NAME);
            assert.equal(processOnSpy.getCall(1).args[0], AutoCollectionExceptions.UNHANDLED_REJECTION_HANDLER_NAME);
        });
    });
});
//# sourceMappingURL=Exceptions.tests.js.map