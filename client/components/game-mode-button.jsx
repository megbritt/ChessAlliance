import React from 'react';

export default function GameModeButton(props) {
  const { type } = props;
  const text = type === 's' ? 'Singleplayer' : 'Multiplayer';
  const href = type === 's' ? '#singleplayer' : '#join';
  return (
    <a href={href} className="gamemode">{text}</a>
  );
}
