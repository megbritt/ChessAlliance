import React from 'react';
import SideSelectButton from '../components/side-select-button';
import GlobalContext from '../lib/global-context';

export default class PostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      side: 'White',
      message: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSelect(event) {
    if (event.target.classList.contains('white')) {
      this.setState({ side: 'White' });
    } else if (event.target.classList.contains('black')) {
      this.setState({ side: 'Black' });
    }
  }

  handleMessage(event) {
    this.setState({ message: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { user } = this.context;

    const body = {
      playerName: user.username,
      playerSide: this.state.side.toLowerCase(),
      message: this.state.message
    };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    fetch('/api/games', req)
      .then(res => res.json())
      .then(result => {
        window.location.hash = `#game?gameId=${result.gameId}&side=${result.playerSide}`;
      });
  }

  render() {
    const { side, message } = this.state;
    const { handleSelect, handleMessage, handleSubmit } = this;
    return (
      <form className="post-form container page-height" onSubmit={handleSubmit}>
        <div className="row font-24">
          <div className="col d-flex align-items-center">
            Playing
            <SideSelectButton type="White" side={side} handleSelect={handleSelect} />
            <SideSelectButton type="Black" side={side} handleSelect={handleSelect} />
          </div>
        </div>

        <div className="row">
          <div className="col post-message-div">
            <label className="w-100">
              <p className="post-message-title">Message</p>
              <textarea className="post-message" value={message} onChange={handleMessage} />
            </label>
          </div>
        </div>

        <div className="row">
          <div className="col d-flex justify-content-end">
            <div className="post-form-buttons d-flex justify-content-between">
              <a href="#join" className="cancel-btn">Cancel</a>
              <button className="create-post-btn">Create</button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

PostForm.contextType = GlobalContext;
