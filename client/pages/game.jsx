import React from 'react';
import { io } from 'socket.io-client';
import ReactBoard from '../components/board';
import PlayerPalette from '../components/player-palette';
import Board from '../lib/board';
import GameState from '../lib/gamestate';
import Coords from '../lib/coords';
import RouteContext from '../lib/route-context';

const coords = new Coords();

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: new Board(),
      gamestate: new GameState(),
      meta: null,
      side: 'white',
      phase: 'selecting',
      selected: 0,
      highlighted: []
    };

    this.cancelGame = this.cancelGame.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.showOptions = this.showOptions.bind(this);
    this.decideMove = this.decideMove.bind(this);
  }

  componentDidMount() {

    const { params } = this.context;

    const gameId = params.get('gameId');
    const side = params.get('side');

    this.socket = io('/', { query: { gameId } });

    this.socket.on('room joined', meta => {
      if (this.state.meta) {
        if (this.state.meta.opponentName) {
          return;
        }
      }
      this.setState({ meta, side });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  cancelGame() {
    const { gameId } = this.state.meta;
    const req = {
      method: 'DELETE'
    };

    fetch(`/api/games/${gameId}`, req)
      .then(res => res.json())
      .then(result => {
        window.location.hash = '#join';
      });
  }

  handleClick(event) {

    const { phase } = this.state;
    const { showOptions, decideMove } = this;

    const coord = parseInt(event.target.closest('.tile').id);
    if (Number.isNaN(coord)) {
      return;
    }
    if (phase === 'selecting') {
      showOptions(coord);
    } else if (phase === 'showing options') {
      decideMove(coord);
    }
  }

  showOptions(start) {
    const { board, gamestate } = this.state;

    if (board.blankSquare(board, start)) {
      return;
    }

    const highlighted = [];
    const moveSpace = findMoveSpace(board, gamestate.turn, start, false, gamestate);
    for (let i = 0; i < moveSpace.length; i++) {
      if (possibleToMove(board, gamestate.turn, start, moveSpace[i])) {
        highlighted.push(moveSpace[i]);
      }
    }
    this.setState({
      selected: start,
      phase: 'showing options',
      highlighted
    });
  }

  decideMove(end) {

    const { board, gamestate, highlighted, selected } = this.state;

    if (!highlighted.includes(end)) {
      this.setState({
        phase: 'selecting',
        selected: 0,
        highlighted: []
      });

      return;
    }

    const nextBoard = copy(board);
    const nextGameState = copy(gamestate);

    if (board[end].piece) {
      nextGameState.pawnOrCaptureCounter = 0;
    } else if (board[selected].piece === 'pawn') {
      nextGameState.pawnOrCaptureCounter = 0;
    } else {
      nextGameState.pawnOrCaptureCounter++;
    }

    // keep track of en passant

    if (board[selected].piece === 'pawn' && (selected > 20 && selected < 29) && (end > 40 && end < 49)) {
      nextGameState.enPassantWhite = selected;
    } else if (board[selected].piece === 'pawn' && (selected > 70 && selected < 79) && (end > 50 && end < 59)) {
      nextGameState.enPassantBrown = selected;
    }

    movePiece(nextBoard, selected, end);

    changeTurn(nextGameState);

    this.setState({
      board: nextBoard,
      gamestate: nextGameState,
      phase: 'selecting',
      selected: 0,
      highlighted: []
    });
  }

  render() {
    const { board, meta, side, selected, highlighted } = this.state;

    const dummy = {
      username: 'Anonymous'
    };

    let player = dummy;
    let opponent = null;

    if (meta) {
      player = { username: meta.playerName };
      if (meta.opponentName) {
        if (side === meta.playerSide) {
          player = { username: meta.playerName };
          opponent = { username: meta.opponentName };

        } else {
          player = { username: meta.opponentName };
          opponent = { username: meta.playerName };
        }
      }
    }

    return (
      <div className="game page-height mx-auto">
        <div className="w-100 d-block d-md-none p-2">
          <PlayerPalette player={opponent} cancelAction={this.cancelGame} />
        </div>

        <div className="w-100 row">
          <div className="col">

            <div className="board-container my-2" onClick={this.handleClick}>
              <ReactBoard board={board} highlighted={highlighted} selected={selected} side={side} />
            </div>
          </div>

          <div className="col-auto d-none d-md-block">
            <div className="w-100 p-2">
              <PlayerPalette player={opponent} cancelAction={this.cancelGame} />
            </div>
            <div className="w-100 p-2">
              <PlayerPalette player={player} />
            </div>
          </div>
        </div>

        <div className="w-100 d-block d-md-none p-2">
          <PlayerPalette player={player} />
        </div>
      </div>
    );
  }
}

Game.contextType = RouteContext;

function copy(obj) {
  return { ...obj };
}

function pseudoCopy(board) { // eslint-disable-line
  const copy = {};
  for (const coord of coords) {
    copy[coord] = board[coord].player + board[coord].piece;
  }

  return copy;
}

function empty(board, coord) {
  board[coord] = {
    piece: null,
    player: null
  };
}

function blankSquare(board, coord) {
  if (!board[coord].piece) {
    return true;
  } else {
    return false;
  }
}

function movePiece(board, start, end) {

  // Castle - Always king's move!

  if (board[start].piece === 'king') {
    if (start === 15 && end === 13) {
      movePiece(board, 11, 14);
    } else if (start === 15 && end === 17) {
      movePiece(board, 18, 16);
    } else if (start === 85 && end === 83) {
      movePiece(board, 81, 84);
    } else if (start === 85 && end === 87) {
      movePiece(board, 88, 86);
    }
  }

  // en passant

  if (board[start].piece === 'pawn') {
    if ((end - start === 11 || end - start === 9) && !board[end].piece) {
      empty(board, end - 10);
    } else if ((end - start === -11 || end - start === -9) && !board[end].piece) {
      empty(board, end + 10);
    }
  }

  board[end] = board[start];
  empty(board, start);
}

function findMoveSpace(board, turn, start, capturesOnly, gamestate) {
  const piece = board[start].piece;
  const moveSpace = [];

  if (piece === 'pawn') {

    if (board[start].player === 'white') {

      if (!capturesOnly) {
        if (!board[start + 10].piece) {
          moveSpace.push(start + 10);
        }
        if ((start < 30) && blankSquare(board, start + 10) && blankSquare(board, start + 20)) {
          moveSpace.push(start + 20);
        }
      }

      const pawnMoves = [9, 11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (blankSquare(board, newSpot)) {
          continue;
        } else if (board[newSpot].player === turn[0]) {
          continue;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
        }
      }

      // en passant

      const mightBeEnPassants = [-1, 1];
      for (const mightBeEnPassant of mightBeEnPassants) {
        const newSpot = start + mightBeEnPassant;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if ((start > 50 && start < 59) &&
          (board[newSpot].player === 'brown' && board[newSpot].piece === 'pawn') &&
          gamestate.enPassantBoard === (newSpot + 20)) {
          moveSpace.push(newSpot + 10);
        }
      }
    } else if (board[start].player === 'brown') {
      // starting moves
      if (!capturesOnly) {
        if (!board[start - 10].piece) {
          moveSpace.push(start - 10);
        }
        if ((start > 70) && blankSquare(board, start - 10) && blankSquare(board, start - 20)) {
          moveSpace.push(start - 20);
        }
      }
      // attack moves
      const pawnMoves = [-9, -11];
      for (const pawnMove of pawnMoves) {
        const newSpot = start + pawnMove;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if (blankSquare(board, newSpot)) {
          continue;
        } else if (board[newSpot].player === turn[0]) {
          continue;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
        }
      }
      // en passant
      const mightBeEnPassants = [-1, 1];
      for (const mightBeEnPassant of mightBeEnPassants) {
        const newSpot = start + mightBeEnPassant;
        if (!coords.isCoord(newSpot)) {
          continue;
        } else if ((start > 40 && start < 49) &&
          (board[newSpot].player === 'white' && board[newSpot].piece === 'pawn') &&
          gamestate.enPassantWhite === (newSpot - 20)) {
          moveSpace.push(newSpot - 10);
        }
      }
    }
  } else if (piece === 'rook') {
    const rookMoves = [1, -1, 10, -10];
    for (const rookmove of rookMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + rookmove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'knight') {
    const knightMoves = [21, 12, -21, -12, 8, 19, -8, -19];
    for (const knightMove of knightMoves) {
      const newSpot = start + knightMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (blankSquare(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }
  } else if (piece === 'bishop') {
    const bishopMoves = [11, -11, 9, -9];
    for (const bishopMove of bishopMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + bishopMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'queen') {
    const queenMoves = [1, -1, 10, -10, 11, -11, 9, -9];
    for (const queenMove of queenMoves) {
      for (let multiplier = 1; multiplier < 9; multiplier++) {
        const newSpot = start + queenMove * multiplier;
        if (!coords.isCoord(newSpot)) {
          break;
        } else if (blankSquare(board, newSpot)) {
          moveSpace.push(newSpot);
        } else if (board[newSpot].player === turn[0]) {
          break;
        } else if (board[newSpot].player === turn[1]) {
          moveSpace.push(newSpot);
          break;
        }
      }
    }
  } else if (piece === 'king') {
    const kingMoves = [10, -10, 1, -1, 11, -11, 9, -9];

    for (const kingMove of kingMoves) {
      const newSpot = start + kingMove;
      if (!coords.isCoord(newSpot)) {
        continue;
      } else if (blankSquare(board, newSpot)) {
        moveSpace.push(newSpot);
      } else if (board[newSpot].player === turn[0]) {
        continue;
      } else if (board[newSpot].player === turn[1]) {
        moveSpace.push(newSpot);
      }
    }

    // castle

    if (!capturesOnly) {
      const canCastleKeys = turn === 'wb'
        ? ['whiteKingCanCastle', 'whiteQueenCanCastle']
        : ['brownKingCanCastle', 'brownQueenCanCastle'];
      for (const canCastleKey of canCastleKeys) {
        if (gamestate[canCastleKey]) {
          if (canCastleKey === 'whiteKingCanCastle') {
            moveSpace.push(17);
          } else if (canCastleKey === 'whiteQueenCanCastle') {
            moveSpace.push(13);
          } else if (canCastleKey === 'brownKingCanCastle') {
            moveSpace.push(87);
          } else if (canCastleKey === 'brownQueenCanCastle') {
            moveSpace.push(83);
          }
        }
      }
    }
  }

  return moveSpace;
}

function findEnemyMoveSpace(board, turn, gamestate) {
  const enemyMoveSpace = new Set();
  const enemyCoords = [];

  for (const coord of coords) {
    if (blankSquare(board, coord)) {
      continue;
    } else if (board[coord].player === turn[1]) {
      enemyCoords.push(coord);
    }
  }

  for (const enemyCoord of enemyCoords) {
    const eachMoveSpace = findMoveSpace(board, turn[1] + turn[0], enemyCoord, true, gamestate);
    for (const move of eachMoveSpace) {
      enemyMoveSpace.add(move);
    }
  }
  return [...enemyMoveSpace];
}

function possibleToMove(board, gamestate, turn, start, end) {
  const potentialBoard = { ...board };
  movePiece(potentialBoard, start, end);
  const enemyMoveSpace = findEnemyMoveSpace(potentialBoard, turn, gamestate);

  const coords = new Coords();
  let kingCoord;
  for (const coord of coords) {
    if (potentialBoard[coord].player === turn[0] && potentialBoard[coord].piece === 'k') {
      kingCoord = coord;
      break;
    }
  }

  for (let i = 0; i < enemyMoveSpace.length; i++) {
    if (kingCoord === enemyMoveSpace[i]) {
      return false;
    }
  }

  return true;
}

function changeTurn(gamestate) {
  if (gamestate.turn === 'bw') {
    gamestate.turnNum++;
    console.log('Current Turn Number:', gamestate.turnNum); // eslint-disable-line
    gamestate.enPassantWhite = 0;
  } else {
    gamestate.enPassantBrown = 0;
  }
  gamestate.nextTurn = gamestate.turn;
  gamestate.turn = gamestate.turn[1] + gamestate.turn[0];
}
