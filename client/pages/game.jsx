import React from 'react';
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
      meta: null
    };
    this.cancelGame = this.cancelGame.bind(this);
  }

  componentDidMount() {
    const gameId = parseRoute(window.location.hash).params.get('gameId');

    fetch(`/api/games/${gameId}`)
      .then(res => res.json())
      .then(result => {
        this.setState({ meta: result });
      });
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
    const { board, meta } = this.state;

    const dummy = {
      username: 'Anonymous',
      side: 'white'
    };

    const player = meta
      ? { username: meta.playerName, side: meta.playerSide }
      : dummy;

    return (
      <div className="game page-height mx-auto">
        <div className="w-100 d-block d-md-none p-2">
          <PlayerPalette player={null} cancelAction={this.cancelGame} />
        </div>

        <div className="w-100 row">
          <div className="col">

            <div className="board-container my-2">
              <ReactBoard board={board} side={player.side} />
            </div>
          </div>

          <div className="col-auto d-none d-md-block">
            <div className="w-100 p-2">
              <PlayerPalette player={null} cancelAction={this.cancelGame} />
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
