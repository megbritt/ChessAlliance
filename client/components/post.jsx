import React from 'react';
import ReactBoard from './board';
import Board from '../lib/board';

export default class Post extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta
    };

    this.handleSelect = this.handleSelect.bind(this);

  }

  handleSelect() {
    const { meta } = this.state;

    const body = {
      opponentName: 'Anonymous'
    };

    const req = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    fetch(`/api/games/${meta.gameId}`, req)
      .then(res => res.json())
      .then(result => console.log(result));
  }

  render() {
    const { meta } = this.props;
    const side = meta.playerSide === 'white'
      ? 'brown'
      : 'white';

    const board = new Board();
    return (
      <div className="post p-2" onClick={this.handleSelect}>
        <div className="row">
          <div className="col-4">
            <div className="post-board-container">
              <ReactBoard board={board} side={side} />
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
