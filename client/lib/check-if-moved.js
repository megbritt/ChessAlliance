import blankSquare from './blank-square';

export default function checkIfMoved(gamestate, board) {
  const coords = [15, 85, 18, 11, 88, 81];
  const movedKeys = [
    'whiteKingMoved',
    'brownKingMoved',
    'whiteKingRookMoved',
    'whiteQueenRookMoved',
    'brownKingRookMoved',
    'brownQueenRookMoved'
  ];
  for (let i = 0; i < movedKeys.length; i++) {
    if (blankSquare(board, coords[i])) {
      gamestate[movedKeys[i]] = true;
    }
  }
}
