const path = require('path');
const webpack = require('webpack');

const clientPath = path.join(__dirname, 'client');
const serverPublicPath = path.join(__dirname, 'server', 'public');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    clientPath,
    isDevelopment && 'webpack-hot-middleware/client?timeout=1000'
  ].filter(Boolean),
  output: {
    path: serverPublicPath
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: clientPath,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-transform-react-jsx'
            ]
          }
        }
      }
    ]
  },
  stats: 'summary',
  devtool: 'source-map',
  plugins: [
    isDevelopment && new webpack.NoEmitOnErrorsPlugin(),
    isDevelopment && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean)
};
