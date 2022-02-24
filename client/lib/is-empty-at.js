export default function isEmptyAt(board, coord) {
  if (!board[coord].piece) {
    return true;
  } else {
    return false;
  }
}
