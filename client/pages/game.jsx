import React from 'react';
import { io } from 'socket.io-client';
import ReactBoard from '../components/board';
import PlayerPalette from '../components/player-palette';
import Board from '../lib/board';
import GameState from '../lib/gamestate';
import parseRoute from '../lib/parse-route';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: new Board(),
      gamestate: new GameState(),
      meta: null,
      side: null,
      socket: io()
    };
    this.cancelGame = this.cancelGame.bind(this);
  }

  componentDidMount() {
    this.state.socket.on('room joined', () => {
      const params = parseRoute(window.location.hash).params;
      const gameId = params.get('gameId');

      fetch(`/api/games/${gameId}`)
        .then(res => res.json())
        .then(result => {
          this.setState({ meta: result });
        });
    });

    const params = parseRoute(window.location.hash).params;
    const gameId = params.get('gameId');
    const side = params.get('side');

    fetch(`/api/games/${gameId}`)
      .then(res => res.json())
      .then(result => {
        const { socket } = this.state;

        this.setState({ meta: result, side });

        socket.emit('join room', this.state.meta.gameId);
      });
  }

  componentWillUnmount() {
    this.state.socket.disconnect();
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

  render() {
    const { board, meta, side } = this.state;

    const dummy = {
      username: 'Anonymous',
      side: 'white'
    };

    let player = dummy;
    let opponent = null;

    if (meta) {
      player = { username: meta.playerName, side: meta.playerSide };
      if (meta.opponentName) {
        opponent = { username: meta.opponentName, side: meta.opponentSide };
      }
    }

    return (
      <div className="game page-height mx-auto">
        <div className="w-100 d-block d-md-none p-2">
          <PlayerPalette player={opponent} cancelAction={this.cancelGame} />
        </div>

        <div className="w-100 row">
          <div className="col">

            <div className="board-container my-2">
              <ReactBoard board={board} side={side} />
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
