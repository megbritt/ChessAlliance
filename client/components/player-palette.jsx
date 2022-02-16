import React from 'react';

export default function PlayerPalette(props) {
  if (!props.player) {
    return (
      <div className="player-palette d-flex flex-column justify-content-center align-items-center">
        <p className="font-24 palette-pending">Waiting for opponent...</p>
        <button className="cancel-btn" onClick={props.cancelAction}>Cancel</button>
      </div>
    );
  }
  const { username } = props.player;
  return (
    <div className="player-palette">
      <div className="d-flex align-items-center">
        <img src="images/default-avatar.png" className="palette-avatar" />
        <span className="font-24 palette-username">{username}</span>
      </div>
    </div>
  );
}
