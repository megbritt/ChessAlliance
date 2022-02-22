export default function pawnScan(board, gamestate) {
  for (let i = 81; i < 89; i++) {
    if (board[i].piece === 'p') {
      gamestate.promoting = i;
      return;
    }
  }

  for (let i = 11; i < 19; i++) {
    if (board[i].piece === 'p') {
      gamestate.promoting = i;
      return;
    }
  }
}
