import React from 'react';
import ReactBoard from '../components/board';
import PlayerPalette from '../components/player-palette';
import Banner from '../components/banner';
import LocalPostGame from '../components/local-post-game';
import PostGameContext from '../lib/post-game-context';
import Board from '../lib/board';
import GameState from '../lib/gamestate';
import copy from '../lib/copy';
import isEmptyAt from '../lib/is-empty-at';
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

export default class Local extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postGameOpen: false,
      board: new Board(),
      gamestate: new GameState(),
      phase: 'selecting',
      selected: 0,
      highlighted: [],
      whiteDead: [],
      brownDead: [],
      showCheck: 0,
      showCheckmate: 0,
      showDraw: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.showOptions = this.showOptions.bind(this);
    this.decideMove = this.decideMove.bind(this);
    this.executeMove = this.executeMove.bind(this);
    this.resolveTurn = this.resolveTurn.bind(this);
    this.promotePawn = this.promotePawn.bind(this);
    this.removeBanner = this.removeBanner.bind(this);
    this.openPostGame = this.openPostGame.bind(this);
    this.closePostGame = this.closePostGame.bind(this);
  }

  handleClick(event) {
    const { phase } = this.state;
    const { showOptions, decideMove } = this;
    const coord = parseInt(event.target.closest('.tile').id);
    if (Number.isNaN(coord)) {
      return;
    }
    if (phase === 'promoting' ||
      phase === 'done') {
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
    if (isEmptyAt(board, start)) {
      return;
    }

    if (!isViableStart(board, gamestate, start, gamestate.turn)) {
      return;
    }

    // find all potential moves
    const highlighted = [];
    const moveSpace = findMoveSpace(board, gamestate.turn, start, false, gamestate);
    for (let i = 0; i < moveSpace.length; i++) {
      if (isViableMove(board, gamestate, gamestate.turn, start, moveSpace[i])) {
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
    const { board, gamestate, highlighted, selected, whiteDead, brownDead } = this.state;
    if (!highlighted.includes(end)) {
      this.setState({
        phase: 'selecting',
        selected: 0,
        highlighted: []
      });
      return;
    }

    const nextBoard = copy(board);
    const nextGamestate = copy(gamestate);
    let phase = 'selecting';

    const killed = this.executeMove(nextBoard, nextGamestate, selected, end);
    const nextWhiteDead = whiteDead;
    const nextBrownDead = brownDead;

    // add dead pieces to player palette
    if (killed) {
      if (killed[0] === 'w') {
        nextWhiteDead.push(killed);
      } else {
        nextBrownDead.push(killed);
      }
    }

    if (nextGamestate.promoting) {
      phase = 'promoting';
      window.localStorage.setItem('start', selected.toString());
    }

    this.setState({
      board: nextBoard,
      gamestate: nextGamestate,
      phase,
      selected: 0,
      highlighted: [],
      whiteDead: nextWhiteDead,
      brownDead: nextBrownDead
    });

    if (!nextGamestate.promoting) {
      this.resolveTurn(nextGamestate, selected, end);
    }
  }

  executeMove(board, gamestate, start, end) {
    let killed = null;

    // update draw counter
    if (board[end].piece) {
      gamestate.pawnOrKillCounter = 0;
      killed = board[end].player + board[end].piece;
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

    return killed;
  }

  resolveTurn(nextGamestate, start, end) {
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

    this.setState({
      phase,
      showCheck,
      showCheckmate,
      showDraw
    });
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
      gamestate: nextGamestate
    });

    this.resolveTurn(nextGamestate, start, end);
  }

  removeBanner() {
    this.setState({
      showCheck: 0,
      showCheckmate: 0,
      showDraw: 0
    });
  }

  openPostGame() {
    this.setState({ postGameOpen: true });
  }

  closePostGame() {
    this.setState({ postGameOpen: false });
  }

  render() {
    const { board, gamestate, postGameOpen, selected, highlighted } = this.state;
    const { whiteDead, brownDead, showCheck, showCheckmate, showDraw } = this.state;
    const { handleClick, promotePawn, openPostGame, closePostGame } = this;
    const whitePromote = gamestate.promoting > 80 ? promotePawn : null;
    const brownPromote = gamestate.promoting && gamestate.promoting < 20 ? promotePawn : null;

    const player = { username: 'Player 1', side: 'white' };
    const opponent = { username: 'Player 2', side: 'brown' };
    let resolution = 'undecided';
    if (gamestate.draw) {
      resolution = 'draw';
    } else if (gamestate.checkmate) {
      resolution = 'win';
    }

    const postGameContext = {
      player,
      opponent,
      open: postGameOpen,
      resolution
    };

    return (
      <PostGameContext.Provider value={postGameContext} >
        <div className="game page-height mx-auto">
          <LocalPostGame closePostGame={this.closePostGame} media="small" />

          <div className="w-100 d-block d-sm-none p-2">
            <PlayerPalette player={opponent} promote={brownPromote} dead={brownDead} />
          </div>

          <div className="w-100 row">
            <div className="col">

              <div className="board-container my-1" onClick={handleClick}>
                <Banner message={'Check'} show={showCheck} />
                <Banner message={'Checkmate'} show={showCheckmate} />
                <Banner message={'Draw'} show={showDraw} />
                <ReactBoard board={board} highlighted={highlighted} selected={selected} side="white" />
              </div>
            </div>

            <div className="col-auto d-none d-sm-block">
              <LocalPostGame closePostGame={closePostGame} media="large" />
              <div className="w-100 p-2">
                <PlayerPalette player={opponent} promote={brownPromote} dead={brownDead} />
              </div>
              <div className="w-100 p-2">
                <PlayerPalette player={player} promote={whitePromote} dead={whiteDead} exitAction={openPostGame} />
              </div>
            </div>
          </div>

          <div className="w-100 d-block d-sm-none p-2">
            <PlayerPalette player={player} promote={whitePromote} dead={whiteDead} exitAction={openPostGame} />
          </div>
        </div>
      </PostGameContext.Provider>

    );
  }
}
