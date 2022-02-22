export default function blankSquare(board, coord) {
  if (!board[coord].piece) {
    return true;
  } else {
    return false;
  }
}
