import Coords from './coords';

const coords = new Coords();

export default class Board {
  constructor() {
    for (const coord of coords) {
      this[coord] = {
        piece: null,
        player: null
      };

      if ((coord > 20 && coord < 29) || (coord > 70 && coord < 79)) {
        this[coord].piece = 'pawn';
      } else if (coord === 11 || coord === 18 || coord === 81 || coord === 88) {
        this[coord].piece = 'rook';
      } else if (coord === 12 || coord === 17 || coord === 82 || coord === 87) {
        this[coord].piece = 'knight';
      } else if (coord === 13 || coord === 16 || coord === 83 || coord === 86) {
        this[coord].piece = 'bishop';
      } else if (coord === 14 || coord === 84) {
        this[coord].piece = 'queen';
      } else if (coord === 15 || coord === 85) {
        this[coord].piece = 'king';
      } else {
        this[coord].piece = null;
      }

      if (coord > 10 && coord < 29) {
        this[coord].player = 'white';
      } else if (coord > 70 && coord < 89) {
        this[coord].player = 'brown';
      } else {
        this[coord].player = null;
      }
    }
  }
}
