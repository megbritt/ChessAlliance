import React from 'react';

export default function AuthRouteButton(props) {
  const { type } = props;
  let text, href;
  let btnClass = 'auth-btn';
  if (type === 'sign-up') {
    text = 'Sign Up';
    href = '#sign-up';
    btnClass += ' sign-up';
  }
  return (
    <a className={btnClass} href={href}>{text}</a>
  );
}
