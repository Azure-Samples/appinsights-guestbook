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
var Sender = require("../../Library/Sender");
var Config = require("../../Library/Config");
var SenderMock = (function (_super) {
    __extends(SenderMock, _super);
    function SenderMock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SenderMock.prototype.getResendInterval = function () {
        return this._resendInterval;
    };
    return SenderMock;
}(Sender));
describe("Library/Sender", function () {
    var sender;
    beforeEach(function () {
        sender = new SenderMock(new Config("testikey"));
    });
    describe("#setOfflineMode(value, resendInterval)", function () {
        it("default resend interval is 60 seconds", function () {
            sender.setDiskRetryMode(true);
            assert.equal(Sender.WAIT_BETWEEN_RESEND, sender.getResendInterval());
        });
        it("resend interval can be configured", function () {
            sender.setDiskRetryMode(true, 0);
            assert.equal(0, sender.getResendInterval());
            sender.setDiskRetryMode(true, 1234);
            assert.equal(1234, sender.getResendInterval());
            sender.setDiskRetryMode(true, 1234.56);
            assert.equal(1234, sender.getResendInterval());
        });
        it("resend interval can't be negative", function () {
            sender.setDiskRetryMode(true, -1234);
            assert.equal(Sender.WAIT_BETWEEN_RESEND, sender.getResendInterval());
        });
    });
});
//# sourceMappingURL=Sender.tests.js.map