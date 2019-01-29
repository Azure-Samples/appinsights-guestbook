import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import {ApplicationInsightsMezzurite} from '@microsoft/applicationinsights-mezzurite';

var mzLog = new ApplicationInsightsMezzurite.MezzuritePlugIn();
const ai = new ApplicationInsights({config: {extensions: [mzLog], instrumentationKey: '4a795cb3-5b9e-4428-8777-0441b7ae7dc8', maxBatchInterval: 100, disableFetchTracking: false}});
ai.loadAppInsights();

class AppContainer extends Component {
    componentWillMount() {
      this.unlisten = this.props.history.listen((location, action) => {
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

  export default withRouter(AppContainer);
