import React from 'react';
import PostGameContext from '../lib/post-game-context';

export default class PostGame extends React.Component {
  render() {
    const { closePostGame, media } = this.props;
    const { player, opponent, open, resolution } = this.context;
    if (!open) {
      return null;
    }

    const exitText = resolution === 'undecided' ? 'Leave' : 'Exit';

    let postGameClass = 'post-game position-fixed page-height';
    if (media === 'small') {
      postGameClass += ' w-100 d-block d-sm-none';
    } else if (media === 'large') {
      postGameClass += ' w-auto d-none d-sm-block';
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
            <a className="return-to-game-btn" href={window.location.hash} onClick={closePostGame}>Return to Game</a>
          </div>
        </div>

        <div className="row my-3">
          <div className="col justify-content-center">
            <a className="exit-btn" href="#join">{exitText}</a>
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
      <button className="dot gray mx-1" />
      <button className="btn avatar mx-2" style={avatarStyle} />
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
        <img className="trophy mx-2" src="images/trophy.svg" />
        {'You won!!'}
        <img className="trophy mx-2" src="images/trophy.svg" />
      </>
    );
  } else if (resolution === 'lose') {
    text = 'You lost...';
  } else if (resolution === 'draw') {
    text = 'Draw!';
  } else if (resolution === 'undecided') {
    text = (
      <p className="post-game-message p-2">
        Leaving the game will forfeit the match.  Are you sure you want to leave?
      </p>
    );
  }
  return (
    <div className="resolution mt-5">
      {text}
    </div>
  );
}
