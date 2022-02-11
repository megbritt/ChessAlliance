import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

if (import.meta.webpackHot) import.meta.webpackHot.accept();

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
