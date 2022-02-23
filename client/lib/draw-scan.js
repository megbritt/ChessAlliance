import Coords from './coords';
import pseudoCopy from './pseudo-copy';
import isEmptyAt from './is-empty-at';
import isViableStart from './is-viable-start';

const coords = new Coords();

export default function drawScan(board, gamestate) {
  if (gamestate.checkmate) {
    return;
  }
  gamestate.pastBoards.push(pseudoCopy(board));

  const { turn } = gamestate;
  // 50 move rule draw
  if (gamestate.pawnOrKillCounter === 100) {
    gamestate.drawCase = '50 move rule';
    gamestate.draw = true;
  }

  // stalemate draw
  const enemyCoords = [];

  for (const coord of coords) {
    if (isEmptyAt(board, coord)) {
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

  // threefold-repetition draw
  for (let i = 0; i < gamestate.pastBoards.length; i++) {
    let repeats = 1;
    const currentBoard = gamestate.pastBoards[i];
    // create a copy of pastBoards and remove the currentBoard from the copy
    const pastBoardsCopy = [...gamestate.pastBoards];
    pastBoardsCopy.splice(i, 1);
    // see if there are any repeats
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

  // insufficient material draw
  // list all black and white squares
  const blackSquares = [];
  const whiteSquares = [];
  for (const coord of coords) {
    const tens = Math.floor(coord / 10);
    const ones = coord % 10;
    if ((tens % 2) === 0) {
      if ((ones % 2) === 0) {
        blackSquares.push(coord);
      } else {
        whiteSquares.push(coord);
      }
    } else {
      if ((ones % 2) === 0) {
        whiteSquares.push(coord);
      } else {
        blackSquares.push(coord);
      }
    }
  }
  // find remaining pieces
  const whitePieces = [];
  const blackPieces = [];
  for (const coord of coords) {
    if (board[coord].player === 'w') {
      whitePieces.push(board[coord].piece);
    } else if (board[coord].player === 'b') {
      blackPieces.push(board[coord].piece);
    }
  }
  // cases
  if (blackPieces.length === 1) {
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
    if (blackPieces.length === 1) {
      gamestate.drawCase = 'insufficient materials';
      gamestate.draw = true;
    } else if (blackPieces.length === 2) {
      if (blackPieces.includes('b') || blackPieces.includes('n')) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      }
    }
  } else if (blackPieces.length === 2 && whitePieces.length === 2) {
    if (blackPieces.includes('b') && whitePieces.includes('b')) {
      const bishopCoords = [];
      for (const coord of coords) {
        if (board[coord].piece === 'b') {
          bishopCoords.push(coord);
        }
      }
      if (blackSquares.includes(bishopCoords[0]) && blackSquares.includes(bishopCoords[1])) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      } else if (whitePieces.includes(bishopCoords[0]) && whitePieces.includes(bishopCoords[1])) {
        gamestate.drawCase = 'insufficient materials';
        gamestate.draw = true;
      }
    }
  }
}
