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
// THIS FILE WAS AUTOGENERATED
var Domain = require("./Domain");
"use strict";
/**
 * An instance of Exception represents a handled or unhandled exception that occurred during execution of the monitored application.
 */
var ExceptionData = (function (_super) {
    __extends(ExceptionData, _super);
    function ExceptionData() {
        var _this = _super.call(this) || this;
        _this.ver = 2;
        _this.exceptions = [];
        _this.properties = {};
        _this.measurements = {};
        return _this;
    }
    return ExceptionData;
}(Domain));
module.exports = ExceptionData;
//# sourceMappingURL=ExceptionData.js.map