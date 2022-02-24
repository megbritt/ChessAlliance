import React from 'react';
import PostGameContext from '../lib/post-game-context';

export default class PostGame extends React.Component {
  constructor(props) {
    super(props);
    this.handleExit = this.handleExit.bind(this);
  }

  handleExit(event) {
    event.preventDefault();
    const { socket, meta, opponent, resolution } = this.context;
    const { gameId } = meta;
    if (resolution !== 'undecided') {
      window.location.hash = '#join';
      return;
    }

    const body = { winner: opponent.side };
    const req = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    fetch(`/api/games/${gameId}`, req)
      .then(result => {
        socket.emit('forfeit');
        window.location.hash = '#join';
      });
  }

  render() {
    const { closePostGame, media } = this.props;
    const { player, opponent, open, resolution } = this.context;
    if (!open) {
      return null;
    }

    const exitText = resolution === 'undecided' ? 'Leave' : 'Exit';

    let postGameClass = 'post-game page-height';
    if (media === 'small') {
      postGameClass += ' small w-100 d-block d-sm-none';
    } else if (media === 'large') {
      postGameClass += ' large w-375 d-none d-sm-block';
    }

    return (
      <div className={postGameClass}>
        <div className="row">
          <div className="d-flex align-items-center my-2">
            <Player player={player} win={resolution === 'win'} />
          </div>
          <div className="d-flex align-items-center my-2">
            <Player player={opponent} win={resolution === 'lose'} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Resolution resolution={resolution} />
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

PostGame.contextType = PostGameContext;

function Player(props) {
  let { player, win } = props;
  if (!player) {
    player = { username: 'Anonymous' };
  }
  const avatarStyle = {
    backgroundImage: 'url(images/default-avatar.png)'
  };
  const trophy = <img className="trophy mx-2" src="images/trophy.svg" />;
  return (
    <>
      <div className="dot gray mx-1" />
      <div className="avatar mx-2" style={avatarStyle} />
      <span className="font-24">{player.username}</span>
      {win && trophy}
    </>
  );
}

function Resolution(props) {
  const { resolution } = props;
  let text;
  if (resolution === 'win') {
    text = (
      <>
        <img className="trophy" src="images/trophy.png" />
        {'You Won!'}
      </>
    );
  } else if (resolution === 'lose') {
    text = 'Opponent Won';
  } else if (resolution === 'draw') {
    text = 'Draw';
  }

  return (
    <div className="resolution mt-5">
      {text}
    </div>
  );
}
