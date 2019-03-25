import Config = require("./Config");
import Context = require("./Context");
import * as Contracts from "../Declarations/Contracts";
/** State Container for sending to the QuickPulse Service */
declare class QuickPulseStateManager {
    config: Config;
    context: Context;
    private _sender;
    private _isEnabled;
    private _lastSuccessTime;
    private _handle;
    private _metrics;
    private _documents;
    private _collectors;
    private static _isCollectingData;
    constructor(iKey?: string, context?: Context);
    /**
     *
     * @param collector
     */
    addCollector(collector: any): void;
    /**
     * Override of TelemetryClient.trackMetric
     */
    trackMetric(telemetry: Contracts.MetricTelemetry): void;
    /**
     * Add a document to the current buffer
     * @param envelope
     */
    addDocument(envelope: Contracts.Envelope): void;
    /**
     * Enable or disable communication with QuickPulseService
     * @param isEnabled
     */
    enable(isEnabled: boolean): void;
    /**
     * Enable or disable all collectors in this instance
     * @param enable
     */
    private enableCollectors(enable);
    /**
     * Add the metric to this buffer. If same metric already exists in this buffer, add weight to it
     * @param telemetry
     */
    private _addMetric(telemetry);
    private _resetQuickPulseBuffer();
    private _goQuickPulse();
    private _ping(envelope);
    private _post(envelope);
    private _quickPulseDone(shouldPOST, res);
}
export = QuickPulseStateManager;
