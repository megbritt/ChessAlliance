import React from 'react';
import { io } from 'socket.io-client';
import ReactBoard from '../components/board';
import PlayerPalette from '../components/player-palette';
import Board from '../lib/board';
import GameState from '../lib/gamestate';
import RouteContext from '../lib/route-context';

import copy from '../lib/copy';
import blankSquare from '../lib/blank-square';
import isViableMove from '../lib/is-viable-move';
import isViableStart from '../lib/is-viable-start';
import movePiece from '../lib/move-piece';
import findMoveSpace from '../lib/find-move-space';
import changeTurn from '../lib/change-turn';
import checkmateScan from '../lib/checkmate-scan';
import checkScan from '../lib/check-scan';
import drawScan from '../lib/draw-scan';
import castleScan from '../lib/castle-scan';
import pawnScan from '../lib/pawn-scan';
import Banner from '../components/banner';

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
      highlighted: [],
      whiteCaptured: [],
      brownCaptured: [],
      showCheck: 0,
      showCheckmate: 0,
      showDraw: 0
    };

    this.cancelGame = this.cancelGame.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.showOptions = this.showOptions.bind(this);
    this.decideMove = this.decideMove.bind(this);
    this.executeMove = this.executeMove.bind(this);
    this.resolveTurn = this.resolveTurn.bind(this);
    this.promotePawn = this.promotePawn.bind(this);
    this.removeBanner = this.removeBanner.bind(this);
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
      const phase = side === 'white' ? 'selecting' : 'opponent turn';
      this.setState({ meta, side, phase });
    });
    this.socket.on('move made', move => {
      const { board, gamestate, whiteCaptured, brownCaptured } = this.state;
      const { start, end, promotion } = move;
      if (!board[start].piece) {
        return;
      }
      const nextBoard = copy(board);
      const nextGamestate = copy(gamestate);
      const captured = this.executeMove(nextBoard, nextGamestate, start, end);
      const nextWhiteCaptured = whiteCaptured;
      const nextBrownCaptured = brownCaptured;

      // add captured pieces to player palette

      if (captured) {
        if (captured[0] === 'w') {
          nextWhiteCaptured.push(captured);
        } else {
          nextBrownCaptured.push(captured);
        }
      }
      let phase = 'selecting';
      // display banners when applicable
      let showCheck = 0;
      let showCheckmate = 0;
      let showDraw = 0;
      if (nextGamestate.check.wb || nextGamestate.check.bw) {
        showCheck = setTimeout(this.removeBanner, 2000);
      }
      if (nextGamestate.checkmate) {
        showCheckmate = setTimeout(this.removeBanner, 2000);
        phase = 'done';
      }
      if (nextGamestate.draw) {
        showDraw = setTimeout(this.removeBanner, 2000);
        phase = 'done';
      }
      // promote any pawns
      if (promotion) {
        nextBoard[end].piece = promotion;
        nextGamestate.promoting = null;
      }
      this.setState({
        board: nextBoard,
        gamestate: nextGamestate,
        phase,
        whiteCaptured: nextWhiteCaptured,
        brownCaptured: nextBrownCaptured,
        showCheck,
        showCheckmate,
        showDraw
      });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  cancelGame() {
    const { gameId } = this.state.meta;

    fetch(`/api/games/${gameId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(result => {
        window.location.hash = '#join';
      });
  }

  handleClick(event) {

    const { phase } = this.state;
    const { showOptions, decideMove } = this;

    const coord = parseInt(event.target.closest('.square').id);
    if (Number.isNaN(coord)) {
      return;
    }

    if (phase === 'opponent turn' || phase === 'promoting' || phase === 'done') {
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

    if (blankSquare(board, start)) {
      return;
    }

    if (!isViableStart(board, gamestate, start, gamestate.turn)) {
      return;
    }

    const highlighted = [];
    const moveSpace = findMoveSpace(board, gamestate.turn, start, false, gamestate);
    for (let i = 0; i < moveSpace.length; i++) {
      if (isViableMove(board, gamestate.turn, start, moveSpace[i])) {
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

    const { board, gamestate, highlighted, selected, whiteCaptured, brownCaptured } = this.state;

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

    let phase = 'opponent turn';
    const captured = this.executeMove(nextBoard, nextGameState, selected, end);
    const nextWhiteCaptured = whiteCaptured;
    const nextBrownCaptured = brownCaptured;

    // add captured pieces to player palette

    if (captured) {
      if (captured[0] === 'w') {
        nextWhiteCaptured.push(captured);
      } else {
        nextBrownCaptured.push(captured);
      }
    }
    if (nextGameState.promoting) {
      phase = 'promoting';
      window.localStorage.setItem('start', selected.toString());
    }
    this.setState({
      board: nextBoard,
      gamestate: nextGameState,
      phase,
      selected: 0,
      highlighted: [],
      whiteCaptured: nextWhiteCaptured,
      brownCaptured: nextBrownCaptured
    });
    if (!nextGameState.promoting) {
      this.resolveTurn(nextGameState, selected, end);
    }
  }

  executeMove(board, gamestate, start, end) {
    let captured = null;
    // update draw counter
    if (board[end].piece) {
      gamestate.pawnOrKillCounter = 0;
      captured = board[end].player + board[end].piece;
    } else if (board[start].piece === 'p') {
      gamestate.pawnOrKillCounter = 0;
    } else {
      gamestate.pawnOrKillCounter++;
    }
    // record en passant
    if (board[start].piece === 'p' && (start > 20 && start < 29) && (end > 40 && end < 49)) {
      gamestate.enPassantWhite = start;
    } else if (board[start].piece === 'p' && (start > 70 && start < 79) && (end > 50 && end < 59)) {
      gamestate.enPassantBrown = start;
    }
    // move piece
    movePiece(board, start, end);
    // apply scans
    pawnScan(board, gamestate);
    checkScan(board, gamestate);
    checkmateScan(board, gamestate);
    drawScan(board, gamestate);
    castleScan(board, gamestate);
    // change turn
    changeTurn(gamestate);
    return captured;
  }

  resolveTurn(nextGamestate, start, end, promotion = null) {
    const { meta } = this.state;
    let phase = 'opponent move';
    // display banners when applicable
    let showCheck = 0;
    let showCheckmate = 0;
    let showDraw = 0;
    if (nextGamestate.check.wb || nextGamestate.check.bw) {
      showCheck = setTimeout(this.removeBanner, 2000);
    }
    if (nextGamestate.checkmate) {
      showCheckmate = setTimeout(this.removeBanner, 2000);
      phase = 'done';
    }
    if (nextGamestate.draw) {
      showDraw = setTimeout(this.removeBanner, 2000);
      phase = 'done';
    }
    this.setState({
      phase,
      showCheck,
      showCheckmate,
      showDraw
    });
    // update other player
    const body = { start, end, promotion };
    const res = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    fetch(`/api/moves/${meta.gameId}`, res);
  }

  promotePawn(event) {
    const { board, gamestate } = this.state;
    const nextBoard = copy(board);
    const nextGamestate = copy(gamestate);
    const end = gamestate.promoting;
    const start = window.localStorage.getItem('start');
    window.localStorage.removeItem('start');
    nextBoard[end].piece = event.target.id;
    nextGamestate.promoting = 0;
    this.setState({
      board: nextBoard,
      gamestate: nextGamestate,
      phase: 'opponent move'
    });
    this.resolveTurn(nextGamestate, start, end, event.target.id);
  }

  removeBanner() {
    this.setState({
      showCheck: 0,
      showCheckmate: 0,
      showDraw: 0
    });
  }

  render() {
    const { board, meta, side, selected, highlighted, phase } = this.state;
    const { whiteCaptured, brownCaptured, showCheck, showCheckmate, showDraw } = this.state;
    const dummy = {
      username: 'Anonymous'
    };
    const playerCaptured = side === 'white' ? whiteCaptured : brownCaptured;
    const opponentCaptured = side === 'white' ? brownCaptured : whiteCaptured;
    const promoteFunc = phase === 'promoting' ? this.promotePawn : null;
    let player = dummy;
    let opponent = null;
    if (meta) {
      player = { username: meta.playerName };
      if (meta.opponentName) {
        if (side === meta.playerSide) {
          player = { username: meta.playerName, side };
          opponent = { username: meta.opponentName, side: meta.opponentSide };
        } else {
          player = { username: meta.opponentName, side: meta.opponentSide };
          opponent = { username: meta.playerName, side };
        }
      }
    }

    return (
      <div className="game page-height mx-auto">
        <div className="w-100 d-block d-sm-none p-2">
          <PlayerPalette player={opponent} captured={opponentCaptured} cancelAction={this.cancelGame} />
        </div>

        <div className="w-100 row">
          <div className="col">

            <div className="board-container my-1" onClick={this.handleClick}>
              <Banner message={'Check'} show={showCheck} />
              <Banner message={'Checkmate'} show={showCheckmate} />
              <Banner message={'Draw'} show={showDraw} />
              <ReactBoard board={board} highlighted={highlighted} selected={selected} side={side} />
            </div>
          </div>

          <div className="col-auto d-none d-sm-block">
            <div className="w-100 p-2">
              <PlayerPalette player={opponent} captured={opponentCaptured} cancelAction={this.cancelGame} />
            </div>
            <div className="w-100 p-2">
              <PlayerPalette player={player} promote={promoteFunc} captured={playerCaptured} />
            </div>
          </div>
        </div>

        <div className="w-100 d-block d-sm-none p-2">
          <PlayerPalette player={player} promote={promoteFunc} captured={playerCaptured} />
        </div>
      </div>
    );
  }
}

Game.contextType = RouteContext;
