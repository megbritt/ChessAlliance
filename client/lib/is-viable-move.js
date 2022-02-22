import Coords from './coords';
import copy from './copy';
import movePiece from './move-piece';
import findEnemyMoveSpace from './find-enemy-move-space';

const coords = new Coords();

export default function isViableMove(board, gamestate, turn, start, end) {
  const potentialBoard = copy(board);
  movePiece(potentialBoard, start, end);
  const enemyMoveSpace = findEnemyMoveSpace(potentialBoard, turn, gamestate);

  // find ally king coord after move
  let kingCoord;
  for (const coord of coords) {
    if (potentialBoard[coord].player === turn[0] && potentialBoard[coord].piece === 'king') {
      kingCoord = coord;
      break;
    }
  }

  // is not viable if king is in enemy move space
  for (let i = 0; i < enemyMoveSpace.length; i++) {
    if (kingCoord === enemyMoveSpace[i]) {
      return false;
    }
  }

  return true;
}
