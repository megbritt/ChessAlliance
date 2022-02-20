import React from 'react';
import AddPostButton from '../components/add-post-button';
import Post from '../components/post';
import { io } from 'socket.io-client';

export default class JoinGame extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      posts: []
    };

    this.loadGames = this.loadGames.bind(this);
  }

  componentDidMount() {

    this.socket = io();

    const { socket } = this;

    socket.on('game joined', removed => {
      const posts = this.state.posts.filter(post => post.gameId !== removed.gameId);

      this.setState({ posts });
    });

    socket.on('disconnect', reason => {
      if (reason === 'io server disconnect') {
        console.error({ error: 'An unexpected error occured.' });
      }
    });

    socket.emit('join lobby');

    this.loadGames();

  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  loadGames() {
    fetch('api/games')
      .then(res => res.json())
      .then(result => this.setState({ posts: result }));
  }

  render() {

    const posts = this.state.posts.map(post => <Post key={post.gameId} meta={post} />);

    return (

      <div className="join-page container page-height w-100">
        <div className="row">
          <div className="col d-flex justify-content-center">
            <AddPostButton />
          </div>
        </div>

        <div className="row">
          <div className="col">
            {posts}
          </div>
        </div>
      </div>
    );
  }
}
