/// <reference types="node" />
import Config = require("./Config");
import * as http from "http";
import * as Contracts from "../Declarations/Contracts";
declare class QuickPulseSender {
    private _config;
    constructor(config: Config);
    ping(envelope: Contracts.EnvelopeQuickPulse, done: (shouldPOST: boolean) => void): void;
    post(envelope: Contracts.EnvelopeQuickPulse, done: (shouldPOST: boolean, res: http.IncomingMessage) => void): void;
    private _submitData(envelope, done, postOrPing);
}
export = QuickPulseSender;
