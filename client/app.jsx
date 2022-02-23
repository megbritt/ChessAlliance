import React from 'react';
import Header from './components/header';
import Nav from './components/nav';
import Home from './pages/home';
import JoinGame from './pages/join-game';
import PostForm from './pages/post-form';
import Game from './pages/game';
import parseRoute from './lib/parse-route';
import GlobalContext from './lib/global-context';
import decodeToken from './lib/decode-token';
import SignUp from './pages/sign-up';
import SignIn from './pages/sign-in';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false,
      route: parseRoute(window.location.hash),
      user: null
    };
    this.handleClickNav = this.handleClickNav.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({ route: parseRoute(window.location.hash) });
    });

    const token = window.localStorage.getItem('chess-app-jwt');
    const user = token ? decodeToken(token) : { username: 'Anonymous' };
    this.setState({ user });
  }

  handleClickNav() {
    if (this.state.navOpen) {
      this.setState({ navOpen: false });
    } else {
      this.setState({ navOpen: true });
    }
  }

  handleSignIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('chess-app-jwt', token);
    this.setState({ user });
    window.location.hash = '#home';
  }

  handleSignOut() {
    window.localStorage.removeItem('chess-app-jwt');
    this.setState({ user: { username: 'Anonymous' } });
    this.handleClickNav();
    window.location.hash = '#home';
  }

  renderPage() {
    switch (this.state.route.path) {
      case 'home':
        return <Home />;
      case 'join':
        return <JoinGame />;
      case 'post':
        return <PostForm />;
      case 'game':
        return <Game />;
      case 'sign-up':
        return <SignUp />;
      case 'sign-in':
        return <SignIn />;
      default:
        window.location.hash = '#home';
    }
  }

  render() {
    if (!this.state.user) {
      return null;
    }

    const { navOpen, route, user } = this.state;
    const { handleClickNav, handleSignIn, handleSignOut } = this;
    const contextValue = {
      route,
      user,
      handleClickNav,
      handleSignIn,
      handleSignOut
    };
    return (
      <GlobalContext.Provider value={contextValue}>
        <>
          <Header navOpen={navOpen} handleClickNav={handleClickNav} />
          <Nav navOpen={navOpen} />
          {this.renderPage()}
        </>
      </GlobalContext.Provider>
    );
  }
}
