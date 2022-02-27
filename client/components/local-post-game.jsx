import React from 'react';
import PostGameContext from '../lib/post-game-context';

export default class LocalPostGame extends React.Component {
  constructor(props) {
    super(props);
    this.handleExit = this.handleExit.bind(this);
  }

  handleExit(event) {
    window.location.hash = '#home';
  }

  render() {
    const { closePostGame, media } = this.props;
    const { player, gamestate, open, resolution } = this.context;
    if (!open) {
      return null;
    }

    const exitText = resolution === 'undecided' ? 'Leave' : 'Exit';
    let postGameClass = 'post-game position-fixed page-height';
    let winner = 'Player 1';
    if (media === 'small') {
      postGameClass += ' w-100 d-block d-sm-none';
    } else if (media === 'large') {
      postGameClass += ' w-auto d-none d-sm-block';
    }
    if (resolution === 'win') {
      if (gamestate.turn[0] === player.side[0]) {
        winner = 'Player 2';
      }
    }

    return (
      <div className={postGameClass}>
        <div className="row">
          <div className="col">
            <Resolution resolution={resolution} winner={winner} />
          </div>
        </div>

        <div className="row justify-content-center my-3">
          <div className="col">
            <button className="return-to-game-btn" onClick={closePostGame}>
              Return to Game
            </button>
          </div>
        </div>

        <div className="row my-3">
          <div className="col justify-content-center">
            <button className="exit-btn" onClick={this.handleExit}>
              {exitText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

LocalPostGame.contextType = PostGameContext;

function Resolution(props) {
  const { winner, resolution } = props;
  let text;
  if (resolution === 'win') {
    text = (
      <>
        {`${winner} wins!!`}
        <img className="trophy mx-2" src="images/trophy.png" />
      </>
    );
  } else if (resolution === 'draw') {
    text = 'Draw!';
  } else if (resolution === 'undecided') {
    text = (
      <p className="post-game-message p-2">
        Are you sure you want to leave?
      </p>
    );
  }
  return (
    <div className="resolution mt-5">
      {text}
    </div>
  );
}
