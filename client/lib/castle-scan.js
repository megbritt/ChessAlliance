import checkIfMoved from './check-if-moved';
import isRunwayOpen from './is-runway-open';
import updateCastling from './update-castling';

export default function castleScan(board, gamestate) {

  checkIfMoved(gamestate, board);

  for (const runway of ['wk', 'wq', 'bk', 'bq']) {
    const isOpen = isRunwayOpen(board, runway, gamestate);

    updateCastling(gamestate, runway, isOpen);
  }
}
