import React from 'react';

export default class Header extends React.Component {
  render() {
    const { navBarMenuShow, handleNavBar } = this.props;
    const threeStripes = 'button three-stripes-button' + (navBarMenuShow ? ' selected' : '');
    const avatarStyle = {
      backgroundImage: 'url(images/default-avatar.png)'
    };
    return (
      <div className="header container-fluid d-flex justify-content-between align-items-center">
        <button className={threeStripes} onClick={handleNavBar}>
          <img src="images/three-stripes.png" />
        </button>
        <button className="button avatar" style={avatarStyle} />
      </div>
    );
  }
}
