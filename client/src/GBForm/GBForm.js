import React from 'react';
import Reflux from 'reflux';
import GuestStore from '../Stores';
import axios from 'axios';
import './GBForm.css';
import { withMezzurite } from '@microsoft/mezzurite-react';

class GBForm extends Reflux.Component {

  constructor(props){
    super(props);
    this.store = GuestStore;
    this.state = {
      email: '',
      message: '',
      name: ''
    };
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="container form-group">
            <div className="row">
              <div className="col-4">
                <label htmlFor="inputName">Name</label>
                <form autoComplete="new-password"><input type="text" autoComplete="off" className="form-control" name="name" value={this.state.name} onChange={this.handleInputChange} id="nameInput" placeholder="Name (required)"/></form>
              </div>
              <div className="col-4">
                <label htmlFor="inputTeam">Team</label>
                <input type="text" autoComplete="off" className="form-control" name="team" value={this.state.team} onChange={this.handleInputChange} id="teamInput" placeholder="Team Name (optional)"/>
              </div>
              <div className="col-3">
                <label htmlFor="inputAlias">Email or Alias</label>
                <input type="text" autoComplete="off" className="form-control" name="email" value={this.state.email} onChange={this.handleInputChange} id="aliasInput" placeholder="Alias or Email (optional)"/>
              </div>
            <div className="col-11" style={{paddingTop: '10px', paddingBottom: '10px'}}>
              <label htmlFor="inputMessage">Say something!</label>
              <input type="text" autoComplete="off" className="form-control" name="message" value={this.state.message} onChange={this.handleInputChange} id="messageInput" placeholder="Message (optional)"/>
            </div>
            </div>
            <button className="btn btn-primary" onClick={this.onClick}>Submit</button>
          </div>
        </div>
      </div>
    );
  }

  onClick = (e) => {
    let { email, name, message, team } = this.state;
    if (email.length > 0 && email.indexOf('@') === -1) {
      email += '@microsoft.com';
    }

    if(this.state.name) {
      axios
        .post('/api/signatures', {
          email: email,
          guestSignature: name,
          message: message,
          team: team
        })
        .then(response => {
          console.log(response, 'Signature added!');
        })
        .catch(err => {
          console.log(err, 'Signature not added');
        });
      this.setState({email: '', message: '', name: '', team: ''});
    }


  }

  handleInputChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;

    this.setState((prevState, props) => {
      return { [name]: value };
    });

  }


}

GBForm.displayName = 'GBForm';
export default withMezzurite(GBForm);
