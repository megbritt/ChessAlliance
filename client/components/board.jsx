import React from 'react';
import Coords from '../lib/coords';

const coords = new Coords();

export default function Board(props) {
  const { board } = props;
  const rows = [];
  let row = [];
  for (const coord of coords) {
    row.push(coord);
    if (coord % 10 === 8) {
      rows.push(row);
      row = [];
    }
  }

  const squares = rows.map((row, index) =>
    <div key={index} className="board-row d-flex">
      {row.map(coord => {
        const square = board[coord];
        let piece;
        if (square.piece) {
          const { player: side, piece: type } = square;
          const src = `/images/${side + '-' + type}.png`;
          piece = <img src={src} className="chess-piece" />;
        }

        return (
          <div key={coord} className="square" id={coord}>
            {piece}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="board d-flex flex-column-reverse">
      {squares}
    </div>
  );
}
