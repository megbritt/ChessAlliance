import Coords from './coords';

const coords = new Coords();

export default function pseudoCopy(board) {
  let copy = '';
  for (const coord of coords) {
    if (board[coord].piece) {
      copy += board[coord].player + board[coord].piece;
    } else {
      copy += 'ee';
    }
  }

  return copy;
}
