const path = require('path');
const webpack = require('webpack');
const livereload = require('livereload');
const livereloadMiddleware = require('connect-livereload');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config');

module.exports = function devMiddleware() {
  const publicPath = path.join(__dirname, 'public');
  const livereloadServer = livereload.createServer();
  livereloadServer.watch(publicPath);
  livereloadServer.server.once('connection', () => {
    setTimeout(() => livereloadServer.sendAllClients(JSON.stringify({
      command: 'reload',
      path: '/'
    })), 100);
  });
  const bundler = webpack(config);
  return [
    livereloadMiddleware(),
    webpackDevMiddleware(bundler),
    webpackHotMiddleware(bundler)
  ];
};
