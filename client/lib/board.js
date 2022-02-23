import Coords from './coords';

const coords = new Coords();

export default class Board {
  constructor() {
    let pieceId = 0;
    // add pieces to board
    for (const coord of coords) {
      this[coord] = {
        piece: null,
        player: null,
        pieceId
      };
      pieceId++;

      if ((coord > 20 && coord < 29) || (coord > 70 && coord < 79)) {
        this[coord].piece = 'p';
      } else if (coord === 11 || coord === 18 || coord === 81 || coord === 88) {
        this[coord].piece = 'r';
      } else if (coord === 12 || coord === 17 || coord === 82 || coord === 87) {
        this[coord].piece = 'n';
      } else if (coord === 13 || coord === 16 || coord === 83 || coord === 86) {
        this[coord].piece = 'b';
      } else if (coord === 14 || coord === 84) {
        this[coord].piece = 'q';
      } else if (coord === 15 || coord === 85) {
        this[coord].piece = 'k';
      } else {
        this[coord].pieceId = null;
        pieceId--;
      }

      // assign color to pieces
      if (coord > 10 && coord < 29) {
        this[coord].player = 'w';
      } else if (coord > 70 && coord < 89) {
        this[coord].player = 'b';
      } else {
        this[coord].player = null;
      }
    }
  }
}
