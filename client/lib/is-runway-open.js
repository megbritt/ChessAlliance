import blankSquare from './blank-square';
import findEnemyMoveSpace from './find-enemy-move-space';

export default function isRunwayOpen(board, region, gamestate) {
  let runway, kingRunway, enemyMoveSpace;
  if (region === 'wk') {
    runway = [16, 17];
    kingRunway = [16, 17];
    enemyMoveSpace = findEnemyMoveSpace(board, 'wb', gamestate);
  } else if (region === 'wq') {
    runway = [12, 13, 14];
    kingRunway = [13, 14];
    enemyMoveSpace = findEnemyMoveSpace(board, 'wb', gamestate);
  } else if (region === 'bk') {
    runway = [86, 87];
    kingRunway = [86, 87];
    enemyMoveSpace = findEnemyMoveSpace(board, 'bw', gamestate);
  } else if (region === 'bq') {
    runway = [82, 83, 84];
    kingRunway = [83, 84];
    enemyMoveSpace = findEnemyMoveSpace(board, 'bw', gamestate);
  }

  for (const coord of runway) {
    if (!blankSquare(board, coord)) {
      return false;
    }
  }
  for (const coord of kingRunway) {
    if (enemyMoveSpace.includes(coord)) {
      return false;
    }
  }
  return true;
}
