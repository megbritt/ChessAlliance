import Coords from './coords';
import isViableStart from './is-viable-start';

const coords = new Coords();

export default function checkmateScan(board, gamestate) {
  const enemyCoords = [];

  for (const coord of coords) {
    if (board[coord]) {
      if (board[coord].player === gamestate.turn[1]) {
        enemyCoords.push(coord);
      }
    }
  }

  if (!gamestate.check[gamestate.nextTurn]) {
    return;
  }

  for (const enemyCoord of enemyCoords) {
    if (isViableStart(board, gamestate, enemyCoord, gamestate.nextTurn)) {
      return;
    }
  }

  gamestate.checkmate = true;
}
