require('dotenv/config');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');

const app = express();

if (process.env.NODE_ENV === 'development') {
  const devMiddleware = require('./dev-middleware');
  app.use(devMiddleware());
}

app.use(staticMiddleware);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n\nserver listening on port ${process.env.PORT}\n\n`);
});
