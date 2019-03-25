import React, { Component } from 'react';
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import { withRouter } from 'react-router-dom';

const ai = new ApplicationInsights({
    config: {
        instrumentationKey: 'a08f3f2d-9884-4437-b6ec-c835d3d58d82',
        maxBatchInterval: 100,
        disableFetchTracking: false
    }
});
ai.loadAppInsights();

class AppContainer extends Component {
    componentWillMount() {
        ai.trackPageView({});
        this.unlisten = this.props.history.listen((location, action) => {
            ai.properties.context.telemetryTrace.traceID = Util.newId();
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
export default withRouter(AppContainer);
