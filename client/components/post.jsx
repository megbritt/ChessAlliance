import React from 'react';
import ReactBoard from './board';
import Board from '../lib/board';
import GlobalContext from '../lib/global-context';

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    const { meta } = this.props;
    const { user } = this.context;
    const body = {
      opponentName: user.username
    };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    fetch(`/api/games/${meta.gameId}`, req)
      .then(res => res.json())
      .then(result => {
        window.location.hash = `#game?gameId=${result.gameId}&side=${result.opponentSide}`;
      });
  }

  render() {
    const { meta } = this.props;
    const side = meta.playerSide === 'white'
      ? 'black'
      : 'white';
    const board = new Board();
    return (
      <div className="post cursor-pointer p-2" onClick={this.handleSelect}>
        <div className="row">
          <div className="col-4">
            <div className="post-board-container">
              <ReactBoard board={board} highlighted={[]} selected={0} side={side} />
            </div>
          </div>
          <div className="col post-text">
            <p className="font-24 mb-1">{meta.playerName}</p>
            <p className="mb-0">{meta.message}</p>
          </div>
        </div>
      </div>
    );
  }
}

Post.contextType = GlobalContext;
