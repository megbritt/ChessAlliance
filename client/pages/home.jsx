import React from 'react';
import GameModeButton from '../components/game-mode-button';

export default class Home extends React.Component {
  render() {
    return (
      <div className="home container d-flex flex-column align-items-center page-height">
        <div className="row">
          <div className="col">
            <img src="images/logo-final.png" className="home-logo" />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <GameModeButton type="s" />
            <GameModeButton type="m" />
          </div>
        </div>
      </div>

    );
  }
}
