import empty from './empty';

export default function movePiece(board, start, end) {

  // castling

  if (board[start].piece === 'king') {
    if (start === 15 && end === 13) {
      movePiece(board, 11, 14);
    } else if (start === 15 && end === 17) {
      movePiece(board, 18, 16);
    } else if (start === 85 && end === 83) {
      movePiece(board, 81, 84);
    } else if (start === 85 && end === 87) {
      movePiece(board, 88, 86);
    }
  }

  // en passant
  if (board[start].piece === 'pawn') {
    if ((end - start === 11 || end - start === 9) && !board[end].piece) {
      empty(board, end - 10);
    } else if ((end - start === -11 || end - start === -9) && !board[end].piece) {
      empty(board, end + 10);
    }
  }

}
