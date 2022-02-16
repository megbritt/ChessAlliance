import React from 'react';

export default class NavigationBar extends React.Component {
  render() {
    const menuButtons = [
      {
        href: '#home',
        text: 'Home'
      },
      {
        href: '#join',
        text: 'Join Game'
      }
    ];
    const { navBarMenuShow, handleNavBar } = this.props;
    const navBackgroundClass = 'nav-background position-absolute page-height' + (navBarMenuShow ? ' show' : '');
    const navClass = 'nav position-absolute flex-column page-height' + (navBarMenuShow ? ' show' : '');

    return (
      <>
        <div className={navBackgroundClass} onClick={handleNavBar} />
        <ul className={navClass}>
          {menuButtons.map(link => (
            <li key={link.href} className="nav-item">
              <a href={link.href} className="nav-link navbar-link" onClick={handleNavBar}>
                {link.text}
              </a>
              <hr className="navbar-sep" />
            </li>
          ))}
        </ul>
      </>
    );
  }
}
