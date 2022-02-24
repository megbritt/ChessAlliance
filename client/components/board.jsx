import React from 'react';
import Coords from '../lib/coords';

const coords = new Coords();

export default function Board(props) {
  const { board, side, highlighted, selected } = props;

  // generate plain board
  const rows = [];
  let row = [];
  for (const coord of coords) {
    row.push(coord);
    if (coord % 10 === 8) {
      rows.push(row);
      row = [];
    }
  }
  const tiles = rows.map((row, index) => {
    const rowClass = side === 'white'
      ? 'board-row d-flex'
      : 'board-row d-flex flex-row-reverse';
    return (
      <div key={index} className={rowClass}>
        {row.map(coord => {
          const highlight = highlighted.includes(coord) ? ' highlighted' : '';
          const select = selected === coord ? ' selected' : '';
          const tileClass = 'tile' + highlight + select;
          return (
            <div key={coord} className={tileClass} id={coord} />
          );
        })}
      </div>
    );
  });

  // modify piece src and class
  const srcs = [];
  const pieceClasses = [];
  for (const coord of coords) {
    if (board[coord].piece) {
      const piece = board[coord];
      const description = piece.player + piece.piece;
      const pieceId = piece.pieceId;
      let [row, col] = coord.toString();
      if (side === 'brown') {
        row = 9 - row;
        col = 9 - col;
      }
      const src = `/images/${description}.png`;
      const pieceClass = `chess-piece playing board-row-${row} board-col-${col}`;
      srcs[pieceId] = src;
      pieceClasses[pieceId] = pieceClass;
    }
  }

  const boardClass = side === 'white'
    ? 'board d-flex flex-column-reverse'
    : 'board d-flex flex-column';
  return (
    <>
      <div className={boardClass}>
        {tiles}
      </div>
      <img src={srcs[0]} className={pieceClasses[0] ? pieceClasses[0] : 'hidden'} />
      <img src={srcs[1]} className={pieceClasses[1] ? pieceClasses[1] : 'hidden'} />
      <img src={srcs[2]} className={pieceClasses[2] ? pieceClasses[2] : 'hidden'} />
      <img src={srcs[3]} className={pieceClasses[3] ? pieceClasses[3] : 'hidden'} />
      <img src={srcs[4]} className={pieceClasses[4] ? pieceClasses[4] : 'hidden'} />
      <img src={srcs[5]} className={pieceClasses[5] ? pieceClasses[5] : 'hidden'} />
      <img src={srcs[6]} className={pieceClasses[6] ? pieceClasses[6] : 'hidden'} />
      <img src={srcs[7]} className={pieceClasses[7] ? pieceClasses[7] : 'hidden'} />
      <img src={srcs[8]} className={pieceClasses[8] ? pieceClasses[8] : 'hidden'} />
      <img src={srcs[9]} className={pieceClasses[9] ? pieceClasses[9] : 'hidden'} />
      <img src={srcs[10]} className={pieceClasses[10] ? pieceClasses[10] : 'hidden'} />
      <img src={srcs[11]} className={pieceClasses[11] ? pieceClasses[11] : 'hidden'} />
      <img src={srcs[12]} className={pieceClasses[12] ? pieceClasses[12] : 'hidden'} />
      <img src={srcs[13]} className={pieceClasses[13] ? pieceClasses[13] : 'hidden'} />
      <img src={srcs[14]} className={pieceClasses[14] ? pieceClasses[14] : 'hidden'} />
      <img src={srcs[15]} className={pieceClasses[15] ? pieceClasses[15] : 'hidden'} />
      <img src={srcs[16]} className={pieceClasses[16] ? pieceClasses[16] : 'hidden'} />
      <img src={srcs[17]} className={pieceClasses[17] ? pieceClasses[17] : 'hidden'} />
      <img src={srcs[18]} className={pieceClasses[18] ? pieceClasses[18] : 'hidden'} />
      <img src={srcs[19]} className={pieceClasses[19] ? pieceClasses[19] : 'hidden'} />
      <img src={srcs[20]} className={pieceClasses[20] ? pieceClasses[20] : 'hidden'} />
      <img src={srcs[21]} className={pieceClasses[21] ? pieceClasses[21] : 'hidden'} />
      <img src={srcs[22]} className={pieceClasses[22] ? pieceClasses[22] : 'hidden'} />
      <img src={srcs[23]} className={pieceClasses[23] ? pieceClasses[23] : 'hidden'} />
      <img src={srcs[24]} className={pieceClasses[24] ? pieceClasses[24] : 'hidden'} />
      <img src={srcs[25]} className={pieceClasses[25] ? pieceClasses[25] : 'hidden'} />
      <img src={srcs[26]} className={pieceClasses[26] ? pieceClasses[26] : 'hidden'} />
      <img src={srcs[27]} className={pieceClasses[27] ? pieceClasses[27] : 'hidden'} />
      <img src={srcs[28]} className={pieceClasses[28] ? pieceClasses[28] : 'hidden'} />
      <img src={srcs[29]} className={pieceClasses[29] ? pieceClasses[29] : 'hidden'} />
      <img src={srcs[30]} className={pieceClasses[30] ? pieceClasses[30] : 'hidden'} />
      <img src={srcs[31]} className={pieceClasses[31] ? pieceClasses[31] : 'hidden'} />
    </>
  );
}
