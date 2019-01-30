import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { withMezzurite } from '@microsoft/mezzurite-react';

class Header extends Component {
  render() {
    const { pathname } = this.props.location;
    const linkName = pathname === "/guestbook" ? "Signing Page" : "Guestbook";
    const linkTo = pathname === '/guestbook' ? '/': '/guestbook';
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
      <span className="navbar-brand d-flex">Application Insights Demo Guestbook</span>
      <div className="divider-vertical navbar-collapse collapse" id="navbar">
          <ul className="navbar-nav d-flex">
              <li className="nav-item">
                  <Link className="nav-link" to={linkTo}>{linkName}</Link>
              </li>
          </ul>
      </div>
  </nav>
    );
  }
}

Header.displayName = 'Header';
export default withMezzurite(Header);
