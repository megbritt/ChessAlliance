import Coords from './coords';
import pseudoCopy from './pseudo-copy';
import blankSquare from './blank-square';
import isViableStart from './is-viable-start';

const coords = new Coords();

export default function drawScan(board, gamestate) {
  if (gamestate.checkmate) {
    return;
  }
  gamestate.pastBoards.push(pseudoCopy(board));

  const { turn } = gamestate;

  if (gamestate.pawnOrKillCounter === 100) {
    gamestate.drawCase = '50 move rule';
    gamestate.draw = true;
  }

  const enemyCoords = [];

  for (const coord of coords) {
    if (blankSquare(board, coord)) {
      continue;
    } else if (board[coord].player === turn[1]) {
      enemyCoords.push(coord);
    }
  }

  let enemyCanMove = false;
  for (const enemyCoord of enemyCoords) {
    if (isViableStart(board, gamestate, enemyCoord, gamestate.nextTurn)) {
      enemyCanMove = true;
      break;
    }
  }

  if (!enemyCanMove) {
    gamestate.drawCase = 'stalemate';
    gamestate.draw = true;
  }

  for (let i = 0; i < gamestate.pastBoards.length; i++) {
    let repeats = 1;
    const currentBoard = gamestate.pastBoards[i];
    const pastBoardsCopy = [...gamestate.pastBoards];

    pastBoardsCopy.splice(i, 1);

    for (const otherBoard of pastBoardsCopy) {
      if (currentBoard === otherBoard) {
        repeats++;
      }
    }
    if (repeats > 2) {
      gamestate.drawCase = 'threefold repetition';
      gamestate.draw = true;
      break;
    }
  }

  const brownSquares = [];
  const whiteSquares = [];
  for (const coord of coords) {
    const tens = Math.floor(coord / 10);
    const ones = coord % 10;
    if ((tens % 2) === 0) {
      if ((ones % 2) === 0) {
        brownSquares.push(coord);
      } else {
        whiteSquares.push(coord);
      }
    } else {
      if ((ones % 2) === 0) {
        whiteSquares.push(coord);
      } else {
        brownSquares.push(coord);
      }
    }
  }

  const whitePieces = [];
  const brownPieces = [];
  for (const coord of coords) {
    if (board[coord].player === 'w') {
      whitePieces.push(board[coord].piece);
    } else if (board[coord].player === 'b') {
      brownPieces.push(board[coord].piece);
    }
  }

  if (brownPieces.length === 1) {
    if (whitePieces.length === 1) {
      gamestate.drawCase = 'insufficient materials';
      gamestate.draw = true;
    } else if (whitePieces.length === 2) {
      if (whitePieces.includes('b') || whitePieces.includes('n')) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      }
    }
  } else if (whitePieces.length === 1) {
    if (brownPieces.length === 1) {
      gamestate.drawCase = 'insufficient materials';
      gamestate.draw = true;
    } else if (brownPieces.length === 2) {
      if (brownPieces.includes('b') || brownPieces.includes('n')) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      }
    }
  } else if (brownPieces.length === 2 && whitePieces.length === 2) {
    if (brownPieces.includes('b') && whitePieces.includes('b')) {
      const bishopCoords = [];
      for (const coord of coords) {
        if (board[coord].piece === 'b') {
          bishopCoords.push(coord);
        }
      }
      if (brownSquares.includes(bishopCoords[0]) && brownSquares.includes(bishopCoords[1])) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      } else if (whitePieces.includes(bishopCoords[0]) && whitePieces.includes(bishopCoords[1])) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      }
    }
  }
}
