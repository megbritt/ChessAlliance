import React from 'react';
import Header from './components/header';
import NavigationBar from './components/navigation-bar';
import Home from './pages/home';
import JoinGame from './pages/join-game';
import parseRoute from './lib/parse-route';
import PostForm from './pages/post-form';
import Game from './pages/game';
import RouteContext from '.lib/route-context';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navBarShowing: false,
      route: parseRoute(window.location.hash)
    };
    this.handleNavBar = this.handleNavBar.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({ route: parseRoute(window.location.hash) });
    });
  }

  handleNavBar() {
    if (this.state.navBarShowing) {
      this.setState({ navBarShowing: false });
    } else {
      this.setState({ navBarShowing: true });
    }
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
      default:
        window.location.hash = '#home';
    }
  }

  render() {
    const { navBarShowing } = this.state;
    const { handleNavBar } = this;
    return (
      <RouteContext.Provider value={this.state.route}>
        <>
          <Header navBarShowing={navBarShowing} handleNavBar={handleNavBar} />
          <NavigationBar navBarShowing={navBarShowing} handleNavBar={handleNavBar} />
          {this.renderPage()}
        </>
      </RouteContext.Provider>
    );
  }
}
