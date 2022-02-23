import React from 'react';

export default class Header extends React.Component {
  render() {
    const { navOpen, handleClickNav } = this.props;
    const hamburgerClass = 'btn hamburger-menu-btn' + (navOpen ? ' selected' : '');
    return (
      <div className="header container-fluid">
        <button className={hamburgerClass} onClick={handleClickNav}>
          <img src="images/hamburger-menu.svg" />
        </button>
        <img className="avatar" src="images/default-avatar.png" />
      </div>
    );
  }
}
