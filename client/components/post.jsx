import React from 'react';
import ReactBoard from './board';
import Board from '../lib/board';

export default function Post(props) {
  const { meta } = props;
  const side = meta.playerSide === 'white'
    ? 'brown'
    : 'white';
  const board = new Board();
  return (
    <div className="post p-2">
      <div className="row bg-black">
        <div className="col-4">
          <div className="post-board-container">
            <ReactBoard board={board} side={side} />
          </div>
        </div>
        <div className="col post-text">
          <p className="font-24 mb-1">{meta.playerName}</p>
          <p className="mb-0">{meta.message}</p>
        </div>
      </div>
    </div>
  );
}
