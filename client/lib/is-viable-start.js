import findMoveSpace from './find-move-space';
import isViableMove from './is-viable-move';

export default function isViableStart(board, gamestate, start, turn) {
  if (board[start].player !== turn[0]) {
    return false;
  }

  // find move space of start
  const moveSpace = findMoveSpace(board, turn, start, false, gamestate);
  if (!moveSpace) {
    return false;
  }

  // is viable start if it has viable moves
  for (let i = 0; i < moveSpace.length; i++) {
    if (isViableMove(board, gamestate, turn, start, moveSpace[i])) {
      return true;
    }
  }

  return false;
}
