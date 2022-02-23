import React from 'react';
import GlobalContext from '../lib/global-context';

export default class AuthRouteButton extends React.Component {
  render() {
    if (this.context.user.userId) {
      return null;
    }

    const { type } = this.props;
    let text, href;
    let btnClass = 'auth-btn mx-2';
    if (type === 'sign-up') {
      text = 'Sign Up';
      href = '#sign-up';
      btnClass += ' sign-up';
    } else if (type === 'sign-in') {
      text = 'Log In';
      href = '#sign-in';
      btnClass += ' sign-in';
    }
    return (
      <a className={btnClass} href={href}>{text}</a>
    );
  }
}

AuthRouteButton.contextType = GlobalContext;
