export default class GameState {
  constructor() {
    this.turn = 'wb';
    this.nextTurn = 'bw';
    this.turnNum = 1;

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

    this.blackQueenCanCastle = false;
    this.blackKingCanCastle = false;
    this.blackKingMoved = false;
    this.blackQueenRookMoved = false;
    this.blackKingRookMoved = false;

    this.promoting = null;

    this.enPassantWhite = 0;
    this.enPassantBlack = 0;

    this.draw = false;
    this.pawnOrKillCounter = 0;
    this.drawCase = null;
    this.pastBoards = [];
    this.pawnKingMoveCounter = 0;
  }
}
