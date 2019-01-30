import React from 'react';
import './GBList.css';
import { withMezzurite } from '@microsoft/mezzurite-react';

class GBList extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    fetch('/api/signatures').then(results => {
      results.json().then(data => {
        const messages = data.map(msg => {return {name: msg.guestSignature, text: msg.message, team: msg.team}});
        this.setState({ messages: messages });
      }).catch(err => console.warn(err.toString()));
    });
  }


  render() {
    const messageList =  this.state.messages.map((message, index) => {
      return (
          <div key={`${message.name}-${index}`} className="list-group-item">
          <p className="h4 list-group-item-heading">
            {message.name}
            <small className="text-muted">{message.team ? ` - ${message.team}` : ''}</small>
          </p>
          <p className="list-group-item-text">{message.text}</p>
        </div>
        );
    });

    return (
      <div className="list-group">
        {messageList}
      </div>
    );
  }
}

GBList.displayName = 'GBList';
export default withMezzurite(GBList);
