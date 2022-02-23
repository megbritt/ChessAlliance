import React from 'react';

export default function GameModeButton(props) {
  const { type } = props;
  const text = type === 's' ? 'Local' : 'Online';
  const href = type === 's' ? '#local' : '#join';
  return (
    <a href={href} className="gamemode my-4">{text}</a>
  );
}
