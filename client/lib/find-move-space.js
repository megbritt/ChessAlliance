import Coords from './coords';
import isEmptyAt from './is-empty-at';

const coords = new Coords();

export default function findMoveSpace(board, turn, start, killsOnly, gamestate) {
  const piece = board[start].piece;
  const moveSpace = [];

  if (piece === 'p') {
    if (board[start].player === 'w') {
      // starting moves
      if (!killsOnly) {
        if (!board[start + 10].piece) {
          moveSpace.push(start + 10);
        }
        if ((start < 30) && isEmptyAt(board, start + 10) && isEmptyAt(board, start + 20)) {
          moveSpace.push(start + 20);
        }
      }
      // attack moves
      const pawnMoves = [9, 11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (isEmptyAt(board, newSpot)) {
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
          (board[newSpot].player === 'b' && board[newSpot].piece === 'p') &&
          gamestate.enPassantBrown === (newSpot + 20)) {
          moveSpace.push(newSpot + 10);
        }
      }
    } else if (board[start].player === 'b') {
      // starting moves
      if (!killsOnly) {
        if (!board[start - 10].piece) {
          moveSpace.push(start - 10);
        }
        if ((start > 70) && isEmptyAt(board, start - 10) && isEmptyAt(board, start - 20)) {
          moveSpace.push(start - 20);
        }
      }
      // attack moves
      const pawnMoves = [-9, -11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (isEmptyAt(board, newSpot)) {
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
          (board[newSpot].player === 'w' && board[newSpot].piece === 'p') &&
          gamestate.enPassantWhite === (newSpot - 20)) {
          moveSpace.push(newSpot - 10);
        }
      }
    }
  } else if (piece === 'r') {
    const rookMoves = [1, -1, 10, -10];
    for (const rookmove of rookMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + rookmove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (isEmptyAt(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'n') {
    const knightMoves = [21, 12, -21, -12, 8, 19, -8, -19];
    for (const knightMove of knightMoves) {
      const newSpot = start + knightMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (isEmptyAt(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }
  } else if (piece === 'b') {
    const bishopMoves = [11, -11, 9, -9];
    for (const bishopMove of bishopMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + bishopMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (isEmptyAt(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'q') {
    const queenMoves = [1, -1, 10, -10, 11, -11, 9, -9];
    for (const queenMove of queenMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + queenMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (isEmptyAt(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'k') {
    const kingMoves = [10, -10, 1, -1, 11, -11, 9, -9];

    // normal moves
    for (const kingMove of kingMoves) {
      const newSpot = start + kingMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (isEmptyAt(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }

    // castling
    if (!killsOnly) {
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
