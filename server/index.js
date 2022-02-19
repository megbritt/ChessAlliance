require('dotenv/config');
const express = require('express');
const pg = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');
const ClientError = require('./client-error');
const pg = require('pg');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
});


app.use(express.json());

app.use(staticMiddleware);

app.get('/api/games', (req, res, next) => {
  const sql = `
  select *
    from "games"
  where "opponentName" is null
  `;

  db.query(sql)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.get('/api/games/:gameId', (req, res, next) => {
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);

  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  select *
    from "games"
   where "gameId" = $1
  `;
  const params = [gameId];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(404, 'gameId does not exist');
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.post('/api/games', (req, res, next) => {
  const { playerName, playerSide, message } = req.body;
  if (!playerName || !playerSide || (!message && message !== '')) {
    throw new ClientError(400, 'missing required field');
  }

  const sql = `
  insert into "games" ("playerName", "playerSide", "message")
  values ($1, $2, $3)
  returning *
  `;

  const params = [playerName, playerSide, message];

  db.query(sql, params)
    .then(result => {
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.put('/api/games/:gameId', (req, res, next) => {
  const { opponentName } = req.body;
  if (!opponentName) {
    throw new ClientError(400, 'missing required field');
  }
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);
  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  insert into "games" ("opponentName")
  values ($2)
   where "gameId" = $1
  returning *
  `;
  const params = [gameId, opponentName];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(404, 'gameId does not exist');
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.delete('/api/games/:gameId', (req, res, next) => {
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);

  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  delete from "games"
        where "gameId" = $1
  returning *
  `;

  const params = [gameId];

  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(404, 'no such gameId exists');
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Express server listening on port ${process.env.PORT}`);
});
