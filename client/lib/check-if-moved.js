import isEmptyAt from './is-empty-at';

export default function checkIfMoved(gamestate, board) {
  const coords = [15, 85, 18, 11, 88, 81];
  const movedKeys = [
    'whiteKingMoved',
    'blackKingMoved',
    'whiteKingRookMoved',
    'whiteQueenRookMoved',
    'blackKingRookMoved',
    'blackQueenRookMoved'
  ];
  for (let i = 0; i < movedKeys.length; i++) {
    if (isEmptyAt(board, coords[i])) {
      gamestate[movedKeys[i]] = true;
    }
  }
}
