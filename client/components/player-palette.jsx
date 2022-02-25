import React from 'react';

export default function PlayerPalette(props) {
  if (!props.player) {
    return (
      <div
        className="player-palette d-flex flex-column justify-content-center align-items-center">
        <p className="font-24 palette-pending">Waiting for challenger...</p>
        <button className="cancel-btn" onClick={props.cancelAction}>Cancel</button>
      </div>
    );
  }

  if (props.promote) {
    const whiteChoices = ['wq', 'wb', 'wn', 'wr'];
    const blackeChoices = ['bq', 'bb', 'bn', 'br'];
    const choices = props.player.side === 'white' ? whiteChoices : blackeChoices;
    return (
      <div
        className="player-palette p-3">
        <p className="font-24 palette-promotion">Choose a promotion</p>
        {
          choices.map(choice => {
            return (
              <img
                key={choice}
                id={choice[1]}
                src={`/images/${choice}.svg`}
                className="promotion chess-piece m-1"
                onClick={props.promote} />
            );
          })
        }
      </div>
    );
  }

  const { player, dead, exitAction } = props;
  const deadPieces = dead.map((piece, index) => {
    return <img key={index} src={`/images/${piece}.svg`} className="dead chess-piece m-1" />;
  });
  return (
    <div className="player-palette container">
      <div className="row">
        <div className="col px-0">
          <div className="d-flex align-items-center">
            <img src="images/default-avatar.png" className="palette-avatar" />
            <span className="font-24 palette-username">{player.username}</span>
          </div>

          <div className="d-flex flex-wrap">
            {deadPieces}
          </div>
        </div>

        {exitAction && (
          <div className="col d-flex flex-column justify-content-start align-items-end p-1">
            <img src="/images/exit-button.svg" onClick={exitAction} />
          </div>
        )}
      </div>
    </div>
  );
}
