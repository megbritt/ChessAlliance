import React from 'react';

export default function AuthRouteButton(props) {
  const { type } = props;
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
