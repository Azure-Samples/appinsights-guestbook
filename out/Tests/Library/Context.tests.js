"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var os = require("os");
var Context = require("../../Library/Context");
describe("Library/Context", function () {
    describe("#constructor()", function () {
        var stubs = [];
        beforeEach(function () {
            stubs = [
                sinon.stub(os, "hostname", function () { return "host"; }),
                sinon.stub(os, "type", function () { return "type"; }),
                sinon.stub(os, "arch", function () { return "arch"; }),
                sinon.stub(os, "release", function () { return "release"; }),
                sinon.stub(os, "platform", function () { return "platform"; })
            ];
        });
        afterEach(function () {
            stubs.forEach(function (s, i, arr) { return s.restore(); });
        });
        it("should initialize default context", function () {
            var context = new Context();
            var defaultkeys = [
                context.keys.cloudRoleInstance,
                context.keys.deviceOSVersion,
                context.keys.internalSdkVersion,
                context.keys.cloudRole
            ];
            for (var i = 0; i < defaultkeys.length; i++) {
                var key = defaultkeys[i];
                assert.ok(!!context.tags[key], key = " is set");
            }
        });
        it("should set internalSdkVersion to 'node:<version>'", function () {
            var context = new Context();
            // todo: make this less fragile (will need updating on each minor version change)
            assert.equal(context.tags[context.keys.internalSdkVersion].substring(0, 9), "node:1.3.");
        });
        it("should correctly set device context", function () {
            var context = new Context();
            assert.equal(context.tags[context.keys.cloudRoleInstance], "host");
            assert.equal(context.tags[context.keys.deviceOSVersion], "type release");
            assert.equal(context.tags[context.keys.cloudRole], Context.DefaultRoleName);
            assert.equal(context.tags["ai.device.osArchitecture"], "arch");
            assert.equal(context.tags["ai.device.osPlatform"], "platform");
        });
    });
});
//# sourceMappingURL=Context.tests.js.map