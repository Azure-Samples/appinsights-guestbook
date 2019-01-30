import React, { Component } from 'react';
import { ApplicationInsights, Util } from '@microsoft/applicationinsights-web';
import {MezzuritePlugIn} from '@microsoft/applicationinsights-mezzurite';
import {withMezzuriteRouter} from '@microsoft/mezzurite-react';

var mzLog = new MezzuritePlugIn();
const ai = new ApplicationInsights({config: {extensions: [mzLog], instrumentationKey: 'a08f3f2d-9884-4437-b6ec-c835d3d58d82', maxBatchInterval: 100, disableFetchTracking: false}});
ai.loadAppInsights();

class AppContainer extends Component {
    componentWillMount() {
        ai.trackPageView({});
        this.unlisten = this.props.history.listen((location, action) => {
            ai.core._extensions[2].operation.id = Util.newId();
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
