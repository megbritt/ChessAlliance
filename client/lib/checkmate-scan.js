import Coords from './coords';
import isViableStart from './is-viable-start';

const coords = new Coords();

export default function checkmateScan(board, gamestate) {
  const enemyCoords = [];

  // find location of all enemies
  for (const coord of coords) {
    if (board[coord]) {
      if (board[coord].player === gamestate.turn[1]) {
        enemyCoords.push(coord);
      }
    }
  }

  // return if king is not in check
  if (!gamestate.check[gamestate.nextTurn]) {
    return;
  }

  // return if there is no checkmate
  for (const enemyCoord of enemyCoords) {
    if (isViableStart(board, gamestate, enemyCoord, gamestate.nextTurn)) {
      return;
    }
  }

  // otherwise checkmate
  gamestate.checkmate = true;
}
