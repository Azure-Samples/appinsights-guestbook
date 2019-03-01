import { withMezzurite } from "@microsoft/mezzurite-react";
import React from 'react';

class GBBottom extends React.PureComponent {
    render() {
        return <div style={{position: 'absolute', bottom: 0, marginBottom: '-100px'}}>Component outside of viewport</div>
    }
}

GBBottom.displayName = 'GBBottom';
export default withMezzurite(GBBottom);
