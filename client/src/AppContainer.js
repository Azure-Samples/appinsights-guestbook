import React, { Component } from 'react';
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import {MezzuritePlugIn} from '@microsoft/applicationinsights-mezzurite';
import {withMezzuriteRouter} from '@microsoft/mezzurite-react';

var mzLog = new MezzuritePlugIn();
const ai = new ApplicationInsights({config: {extensions: [mzLog], instrumentationKey: '5d2830ed-8910-4f41-9e77-d534dea79127', maxBatchInterval: 100, disableFetchTracking: false}});
ai.loadAppInsights();

class AppContainer extends Component {
    componentWillMount() {
        ai.trackPageView({});
        this.unlisten = this.props.history.listen((location, action) => {
            ai.core._extensions[1].context.telemetryTrace.traceID = Util.newId();
            ai.trackPageView({name: location.pathname});
      });
    }
    componentWillUnmount() {
        this.unlisten();
    }
    render() {
       return (
           <div className="App container">{this.props.children}</div>
        );
    }
}

AppContainer.displayName = 'AppContainer';
export default withMezzuriteRouter(AppContainer);
