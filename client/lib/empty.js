export default function empty(board, coord) {
  board[coord] = {
    piece: null,
    player: null
  };
}
