import Coords from './coords';
import findEnemyMoveSpace from './find-enemy-move-space';

const coords = new Coords();

export default function checkScan(board, gamestate) {
  const allyMoveSpace = findEnemyMoveSpace(board, gamestate.nextTurn, gamestate);

  // find enemy king coord after move
  let kingCoord;
  for (const coord of coords) {
    if (board[coord].player === gamestate.turn[1] && board[coord].piece === 'k') {
      kingCoord = coord;
      break;
    }
  }

  // change gamestate if there is check
  gamestate.check[gamestate.turn] = false;
  if (allyMoveSpace.includes(kingCoord)) {
    gamestate.check[gamestate.nextTurn] = true;
  }
}
