import React from 'react';
import GameModeButton from '../components/game-mode-button';

export default class Home extends React.Component {
  render() {
    return (
      <div className="home container d-flex flex-column align-items-center page-height">
        <GameModeButton type="m" />
      </div>

    );
  }
}
