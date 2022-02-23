import Coords from './coords';
import isEmptyAt from './is-empty-at';
import findMoveSpace from './find-move-space';
const coords = new Coords();

export default function findEnemyMoveSpace(board, turn, gamestate) {
  const enemyMoveSpace = new Set();
  const enemyCoords = [];

  // find location of all enemy pieces
  for (const coord of coords) {
    if (isEmptyAt(board, coord)) {
      continue;
    } else if (board[coord].player === turn[1]) {
      enemyCoords.push(coord);
    }
  }

  // union all move spaces of enemy pieces
  for (const enemyCoord of enemyCoords) {
    const eachMoveSpace = findMoveSpace(board, turn[1] + turn[0], enemyCoord, true, gamestate);
    for (const move of eachMoveSpace) {
      enemyMoveSpace.add(move);
    }
  }
  return [...enemyMoveSpace];
}
