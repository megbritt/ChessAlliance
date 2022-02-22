import Coords from './coords';
import blankSquare from './blank-square';

const coords = new Coords();

export default function findMoveSpace(board, turn, start, capturesOnly, gamestate) {
  const piece = board[start].piece;
  const moveSpace = [];

  if (piece === 'pawn') {
    if (board[start].player === 'white') {
      // starting moves
      if (!capturesOnly) {
        if (!board[start + 10].piece) {
          moveSpace.push(start + 10);
        }
        if ((start < 30) && blankSquare(board, start + 10) && blankSquare(board, start + 20)) {
          moveSpace.push(start + 20);
        }
      }
      // attack moves
      const pawnMoves = [9, 11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (blankSquare(board, newSpot)) {
          continue;
        } else if (board[newSpot].player === turn[0]) {
          continue;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
        }
      }
      // en passant
      const potentialEnPassants = [-1, 1];
      for (const potentialEnPassant of potentialEnPassants) {
        const newSpot = start + potentialEnPassant;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if ((start > 50 && start < 59) &&
          (board[newSpot].player === 'brown' && board[newSpot].piece === 'pawn') &&
          gamestate.enPassantBlack === (newSpot + 20)) {
          moveSpace.push(newSpot + 10);
        }
      }
    } else if (board[start].player === 'brown') {
      // starting moves
      if (!capturesOnly) {
        if (!board[start - 10].piece) {
          moveSpace.push(start - 10);
        }
        if ((start > 70) && blankSquare(board, start - 10) && blankSquare(board, start - 20)) {
          moveSpace.push(start - 20);
        }
      }
      // attack moves
      const pawnMoves = [-9, -11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (blankSquare(board, newSpot)) {
          continue;
        } else if (board[newSpot].player === turn[0]) {
          continue;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
        }
      }
      // en passant
      const potentialEnPassants = [-1, 1];
      for (const potentialEnPassant of potentialEnPassants) {
        const newSpot = start + potentialEnPassant;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if ((start > 40 && start < 49) &&
          (board[newSpot].player === 'white' && board[newSpot].piece === 'pawn') &&
          gamestate.enPassantWhite === (newSpot - 20)) {
          moveSpace.push(newSpot - 10);
        }
      }
    }
  } else if (piece === 'rook') {
    const rookMoves = [1, -1, 10, -10];
    for (const rookmove of rookMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + rookmove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'knight') {
    const knightMoves = [21, 12, -21, -12, 8, 19, -8, -19];
    for (const knightMove of knightMoves) {
      const newSpot = start + knightMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (blankSquare(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }
  } else if (piece === 'bishop') {
    const bishopMoves = [11, -11, 9, -9];
    for (const bishopMove of bishopMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + bishopMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'queen') {
    const queenMoves = [1, -1, 10, -10, 11, -11, 9, -9];
    for (const queenMove of queenMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + queenMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'king') {
    const kingMoves = [10, -10, 1, -1, 11, -11, 9, -9];

    // normal moves
    for (const kingMove of kingMoves) {
      const newSpot = start + kingMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (blankSquare(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }

    // castling
    if (!capturesOnly) {
      const canCastleKeys = turn === 'wb'
        ? ['whiteKingCanCastle', 'whiteQueenCanCastle']
        : ['brownKingCanCastle', 'brownQueenCanCastle'];
      for (const canCastleKey of canCastleKeys) {
        if (gamestate[canCastleKey]) {
          if (canCastleKey === 'whiteKingCanCastle') {
            moveSpace.push(17);
          } else if (canCastleKey === 'whiteQueenCanCastle') {
            moveSpace.push(13);
          } else if (canCastleKey === 'brownKingCanCastle') {
            moveSpace.push(87);
          } else if (canCastleKey === 'brownQueenCanCastle') {
            moveSpace.push(83);
          }
        }
      }
    }
  }

  return moveSpace;
}
