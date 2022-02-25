import React from 'react';
import { io } from 'socket.io-client';
import ReactBoard from '../components/board';
import PlayerPalette from '../components/player-palette';
import Banner from '../components/banner';
import PostGame from '../components/post-game';
import Board from '../lib/board';
import GameState from '../lib/gamestate';
import RouteContext from '../lib/route-context';
import PostGameContext from '../lib/post-game-context';

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

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meta: null,
      side: 'white',
      postGameOpen: false,
      board: new Board(),
      gamestate: new GameState(),
      phase: 'selecting',
      selected: 0,
      highlighted: [],
      whiteDead: [],
      blackDead: [],
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
    this.concludeGame = this.concludeGame.bind(this);
    this.removeBanner = this.removeBanner.bind(this);
    this.openPostGame = this.openPostGame.bind(this);
    this.closePostGame = this.closePostGame.bind(this);
  }

  componentDidMount() {
    const { params } = this.context;
    const gameId = params.get('gameId');
    const side = params.get('side');
    this.socket = io('/', { query: { gameId } });

    this.socket.on('room joined', payload => {
      const { meta, moves } = payload;
      const { board, gamestate, whiteDead, blackDead } = this.state;
      const nextBoard = copy(board);
      const nextGamestate = copy(gamestate);
      const nextWhiteDead = whiteDead;
      const nextBlackDead = blackDead;
      if (this.state.meta) {
        if (this.state.meta.opponentName) {
          return;
        }
      }
      // run through all moves
      if (moves) {
        for (const move of moves) {
          const { start, end, promotion } = move;
          const killed = this.executeMove(nextBoard, nextGamestate, start, end);
          // add dead pieces to player palette
          if (killed) {
            if (killed[0] === 'w') {
              nextWhiteDead.push(killed);
            } else {
              nextBlackDead.push(killed);
            }
          }
          // promote any pawns
          if (promotion) {
            nextBoard[end].piece = promotion;
            nextGamestate.promoting = null;
          }
        }
      }
      // update phase
      let phase = side[0] === nextGamestate.turn[0] ? 'selecting' : 'opponent turn';
      if (nextGamestate.checkmate) {
        phase = 'done';
      }
      if (nextGamestate.draw) {
        phase = 'done';
      }

      this.setState({
        meta,
        side,
        phase,
        board: nextBoard,
        gamestate: nextGamestate,
        whiteDead: nextWhiteDead,
        blackDead: nextBlackDead
      });
    });

    this.socket.on('move made', move => {
      const { board, gamestate, whiteDead, blackDead } = this.state;
      const { start, end, promotion } = move;
      if (!board[start].piece) {
        return;
      }

      const nextBoard = copy(board);
      const nextGamestate = copy(gamestate);
      const killed = this.executeMove(nextBoard, nextGamestate, start, end);
      const nextWhiteDead = whiteDead;
      const nextBlackDead = blackDead;
      // add dead pieces to player palette
      if (killed) {
        if (killed[0] === 'w') {
          nextWhiteDead.push(killed);
        } else {
          nextBlackDead.push(killed);
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
        whiteDead: nextWhiteDead,
        blackDead: nextBlackDead,
        showCheck,
        showCheckmate,
        showDraw
      });

      setTimeout(this.concludeGame, 1000);
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
    const coord = parseInt(event.target.closest('.tile').id);
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
    const { board, gamestate, highlighted, selected, whiteDead, blackDead } = this.state;
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
    let phase = 'opponent turn';

    const killed = this.executeMove(nextBoard, nextGamestate, selected, end);
    const nextWhiteDead = whiteDead;
    const nextBlackDead = blackDead;

    // add dead pieces to player palette
    if (killed) {
      if (killed[0] === 'w') {
        nextWhiteDead.push(killed);
      } else {
        nextBlackDead.push(killed);
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
      blackDead: nextBlackDead
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
      gamestate.enPassantBlack = start;
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
    fetch(`/api/moves/${meta.gameId}`, res)
      .then(result => {
        if (phase === 'done') {
          const { gamestate } = this.state;
          let winner;
          if (gamestate.draw) {
            winner = 'draw';
          } else if (gamestate.checkmate) {
            if (gamestate.turn === 'bw') {
              winner = 'white';
            } else {
              winner = 'black';
            }
          }
          const body = { winner };
          const res = {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          };
          fetch(`/api/games/${meta.gameId}`, res)
            .then(res => res.json())
            .then(result => {
              this.setState({ meta: result });
              setTimeout(this.openPostGame, 2000);
            });
        }
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
      gamestate: nextGamestate,
      phase: 'opponent move'
    });

    this.resolveTurn(nextGamestate, start, end, event.target.id);
  }

  concludeGame() {
    const { phase, meta } = this.state;
    if (phase === 'done') {
      fetch(`/api/games/${meta.gameId}`)
        .then(res => res.json())
        .then(result => {
          this.setState({ meta: result });
          setTimeout(this.openPostGame, 2000);
        });
    }
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
    if (!this.state.meta) {
      return null;
    }
    const { board, meta, side, postGameOpen, selected, highlighted, phase } = this.state;
    const { whiteDead, blackDead, showCheck, showCheckmate, showDraw } = this.state;
    const { handleClick, cancelGame, promotePawn, openPostGame, closePostGame } = this;
    const playerDead = side === 'white' ? whiteDead : blackDead;
    const opponentDead = side === 'white' ? blackDead : whiteDead;
    const promoteFunc = phase === 'promoting' ? promotePawn : null;

    let player = { username: meta.playerName };
    let opponent = null;
    let resolution = null;
    if (meta.opponentName) {
      if (side === meta.playerSide) {
        player = { username: meta.playerName, side };
        opponent = { username: meta.opponentName, side: meta.opponentSide };
      } else {
        player = { username: meta.opponentName, side: meta.opponentSide };
        opponent = { username: meta.playerName, side: meta.playerSide };
      }
    }
    if (meta.winner) {
      if (meta.winner === 'draw') {
        resolution = 'draw';
      } else if (player.side === meta.winner) {
        resolution = 'win';
      } else if (opponent.side === meta.winner) {
        resolution = 'lose';
      }
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
          <PostGame closePostGame={this.closePostGame} media="small" />

          <div className="w-100 d-block d-sm-none p-2">
            <PlayerPalette player={opponent} dead={opponentDead} cancelAction={cancelGame} />
          </div>

          <div className="w-100 row">
            <div className="col">

              <div className="board-container my-1" onClick={handleClick}>
                <Banner message={'Check'} show={showCheck} />
                <Banner message={'Checkmate'} show={showCheckmate} />
                <Banner message={'Draw'} show={showDraw} />
                <ReactBoard board={board} highlighted={highlighted} selected={selected} side={side} />
              </div>
            </div>

            <div className="col-auto d-none d-sm-block">
              <PostGame closePostGame={closePostGame} media="large" />
              <div className="w-100 p-2">
                <PlayerPalette player={opponent} dead={opponentDead} cancelAction={cancelGame} />
              </div>
              <div className="w-100 p-2">
                <PlayerPalette player={player} promote={promoteFunc} dead={playerDead} exitAction={openPostGame} />
              </div>
            </div>
          </div>

          <div className="w-100 d-block d-sm-none p-2">
            <PlayerPalette player={player} promote={promoteFunc} dead={playerDead} exitAction={openPostGame} />
          </div>
        </div>
      </PostGameContext.Provider>

    );
  }
}

Game.contextType = RouteContext;
