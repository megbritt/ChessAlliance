import React from 'react';
import GlobalContext from '../lib/global-context';

export default class LogInOut extends React.Component {
  render() {
    const { user, handleClickNav, handleSignOut } = this.context;

    if (!user.userId) {
      return (
        <a className="nav-sign-in-out justify-content-start" href="#sign-in" onClick={handleClickNav}>Log In</a>
      );
    } else {
      return (
        <p className="nav-sign-in-out cursor-pointer" onClick={handleSignOut}>Log Out</p>
      );
    }
  }
}

LogInOut.contextType = GlobalContext;
