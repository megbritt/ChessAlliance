import checkIfMoved from './check-if-moved';
import isRunwayOpen from './is-runway-open';
import updateCastling from './update-castling';

export default function castleScan(board, gamestate) {
  // check if pieces have moved
  checkIfMoved(gamestate, board);

  for (const runway of ['wk', 'wq', 'bk', 'bq']) {
    // see if runway is clear
    const isOpen = isRunwayOpen(board, runway, gamestate);

    // change castling status when possible
    updateCastling(gamestate, runway, isOpen);
  }
}
