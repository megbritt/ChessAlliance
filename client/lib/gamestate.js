export default class GameState {
  constructor() {
    this.turn = 'wb';
    this.nextTurn = 'bw';
    this.turnNum = 1;
    this.seeingOptions = false;
    this.start = 0;

    this.check = {
      wb: false,
      bw: false
    };
    this.checkmate = false;

    this.whiteQueenCanCastle = false;
    this.whiteKingCanCastle = false;
    this.whiteKingMoved = false;
    this.whiteQueenRookMoved = false;
    this.whiteKingRookMoved = false;

    this.brownQueenCanCastle = false;
    this.brownKingCanCastle = false;
    this.brownKingMoved = false;
    this.brownQueenRookMoved = false;
    this.brownKingRookMoved = false;

    this.promoting = null;

    this.enPassantWhite = 0;
    this.enPassantBlack = 0;

    this.draw = false;
    this.drawCase = null;
    this.pastBoards = [];
    this.pawnKingMoveCounter = 0;
  }

  changeTurn() {
    if (this.turn === 'bw') {
      this.turnNum++;
      console.log('turnNum:', this.turnNum); // eslint-disable-line
      this.enPassantWhite = 0;
    } else {
      this.enPassantBlack = 0;
    }
    this.nextTurn = this.turn;
    this.turn = this.turn[1] + this.turn[0];
  }

  checkIfMoved(board) {
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
      if (board.isEmptyAt(coords[i])) {
        this[movedKeys[i]] = true;
      }
    }
  }

  updateCastling(runway, runwayOpen) {
    const turn = runway[0] === 'w'
      ? 'wb'
      : runway[0] === 'b'
        ? 'bw'
        : null;
    const kingMovedKey = runway[0] === 'w'
      ? 'whiteKingMoved'
      : runway[0] === 'b'
        ? 'brownKingMoved'
        : null;
    const rookMovedKey = runway === 'wk'
      ? 'whiteKingRookMoved'
      : runway === 'wq'
        ? 'whiteQueenRookMoved'
        : runway === 'bk'
          ? 'brownKingRookMoved'
          : runway === 'bq'
            ? 'brownQueenRookMoved'
            : null;
    const canCastleKey = runway === 'wk'
      ? 'whiteKingCanCastle'
      : runway === 'wq'
        ? 'whiteQueenCanCastle'
        : runway === 'bk'
          ? 'brownKingCanCastle'
          : runway === 'bq'
            ? 'brownQueenCanCastle'
            : null;

    if (runwayOpen && !this[kingMovedKey] && !this[rookMovedKey] && !this.check[turn]) {
      this[canCastleKey] = true;
    } else {
      this[canCastleKey] = false;
    }
  }
}
