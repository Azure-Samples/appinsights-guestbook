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
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var Channel = require("../../Library/Channel");
var Contracts = require("../../Declarations/Contracts");
var ChannelMock = (function (_super) {
    __extends(ChannelMock, _super);
    function ChannelMock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChannelMock.prototype.getBuffer = function () {
        return this._buffer;
    };
    ChannelMock.prototype.getTimeoutHandle = function () {
        return this._timeoutHandle;
    };
    return ChannelMock;
}(Channel));
describe("Library/Channel", function () {
    var testEnvelope = new Contracts.Envelope();
    var sender = {
        saveOnCrash: (function (str) { return null; }),
        send: (function (buffer) { return null; })
    };
    var sendSpy = sinon.spy(sender, "send");
    var saveSpy = sinon.spy(sender, "saveOnCrash");
    var channel;
    var config;
    var clock;
    before(function () { return clock = sinon.useFakeTimers(); });
    after(function () { return clock.restore(); });
    beforeEach(function () {
        config = {
            isDisabled: false,
            batchSize: 3,
            batchInterval: 10
        };
        channel = new ChannelMock(function () { return config.isDisabled; }, function () { return config.batchSize; }, function () { return config.batchInterval; }, sender);
    });
    afterEach(function () {
        sendSpy.reset();
        saveSpy.reset();
    });
    describe("#send(envelope)", function () {
        it("should enqueue telemetry", function () {
            channel.send(testEnvelope);
            clock.tick(config.batchInterval);
            assert.ok(sendSpy.calledOnce);
            assert.equal(sendSpy.firstCall.args[0].toString(), JSON.stringify(testEnvelope));
        });
        it("should do nothing if disabled", function () {
            config.isDisabled = true;
            channel.send(testEnvelope);
            clock.tick(config.batchInterval);
            assert.ok(sendSpy.notCalled);
        });
        it("should log warning if invalid input is passed", function () {
            var warnStub = sinon.stub(console, "warn");
            channel.send(undefined);
            channel.send(null);
            channel.send("");
            assert.ok(warnStub.calledThrice);
            warnStub.restore();
        });
        it("should not crash JSON.stringify", function () {
            var a = { b: null };
            a.b = a;
            var warnStub = sinon.stub(console, "warn");
            assert.doesNotThrow(function () { return channel.send(a); });
            assert.ok(warnStub.calledOnce);
            warnStub.restore();
        });
        it("should flush the buffer when full", function () {
            for (var i = 0; i < config.batchSize; i++) {
                channel.send(testEnvelope);
            }
            assert.ok(sendSpy.calledOnce);
            assert.ok(channel.getBuffer().length === 0);
        });
        it("should add the payload to the buffer", function () {
            channel.send(testEnvelope);
            assert.ok(channel.getBuffer().length === 1);
            assert.ok(channel.getBuffer()[0] === JSON.stringify(testEnvelope));
        });
        it("should start the timer if not started", function () {
            assert.ok(!channel.getTimeoutHandle());
            channel.send(testEnvelope);
            assert.ok(channel.getTimeoutHandle());
        });
        it("should clear timeout handle after flushing", function () {
            for (var i = 0; i < config.batchSize; i++) {
                channel.send(testEnvelope);
            }
            assert.ok(!channel.getTimeoutHandle(), "cleared after buffer full");
            channel.send(testEnvelope);
            clock.tick(config.batchInterval);
            assert.ok(!channel.getTimeoutHandle(), "cleared after batch interval");
        });
    });
    describe("#triggerSend(isCrash)", function () {
        it("should clear timeout handle", function () {
            channel.send(testEnvelope);
            channel.triggerSend(false);
            assert.ok(sendSpy.calledOnce);
            assert.ok(saveSpy.notCalled);
            assert.ok(channel.getBuffer().length === 0);
            assert.ok(!channel.getTimeoutHandle());
        });
        it("should save to disk if crashing", function () {
            channel.send(testEnvelope);
            channel.triggerSend(true);
            assert.ok(sendSpy.notCalled);
            assert.ok(saveSpy.calledOnce);
            assert.ok(channel.getBuffer().length === 0);
            assert.ok(!channel.getTimeoutHandle());
        });
        it("should format X-JSON by default", function () {
            var first = { "first": true };
            var second = { "second": true };
            channel.send(first);
            channel.send(second);
            channel.triggerSend(true);
            assert.ok(sendSpy.notCalled);
            assert.ok(saveSpy.calledOnce);
            assert.ok(saveSpy.calledWith(JSON.stringify(first) + "\n" + JSON.stringify(second)));
        });
        it("should not send if empty", function () {
            channel.triggerSend(false);
            assert.ok(sendSpy.notCalled);
            assert.ok(saveSpy.notCalled);
        });
        it("should call callback when empty", function () {
            var callback = sinon.spy();
            channel.triggerSend(false, callback);
            assert.ok(callback.calledOnce);
        });
        it("should call callback when crashing", function () {
            channel.send(testEnvelope);
            var callback = sinon.spy();
            channel.triggerSend(true, callback);
            assert.ok(callback.calledOnce);
        });
    });
});
//# sourceMappingURL=Channel.tests.js.map