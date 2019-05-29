"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var Contracts = require("../../Declarations/Contracts");
var Constants = require("../../Declarations/Constants");
describe("Library/QuickPulseEnvelopeFactory", function () {
    describe("QPS Constants", function () {
        it("should convert TelemetryTypeValues to QuickPulseType", function () {
            var keys = Object.keys(Contracts.TelemetryTypeString);
            assert.ok(keys.length > 0);
            keys.forEach(function (key) {
                var value = Contracts.TelemetryTypeString[key];
                var qpsType = Constants.TelemetryTypeStringToQuickPulseType[value];
                var qpsDocType = Constants.TelemetryTypeStringToQuickPulseDocumentType[value];
                assert.equal(qpsType, Constants.QuickPulseType[key]);
                assert.equal(qpsDocType, Constants.QuickPulseDocumentType[key]);
            });
        });
    });
});
//# sourceMappingURL=QuickPulseEnvelopeFactory.tests.js.map