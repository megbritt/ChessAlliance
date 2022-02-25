require('dotenv/config');
const express = require('express');
const pg = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');
const ClientError = require('./client-error');

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
  const { gameId } = socket.handshake.query;

  if (gameId) {
    socket.join(gameId);

    socket.on('forfeit', () => {
      const sql = `
      select *
        from "games"
      where "gameId" = $1
      `;
      const params = [gameId];
      db.query(sql, params)
        .then(result => {
          if (result.rows.length === 0) {
            throw new ClientError(404, 'no such gameId exists');
          }
          const meta = result.rows[0];
          socket.broadcast.to(gameId).emit('forfeit', meta);
        })
        .catch(err => console.error(err));
    });

    const sql = `
    select *
      from "games"
    where "gameId" = $1
    `;
    const params = [gameId];
    db.query(sql, params)
      .then(result => {
        const meta = result.rows[0];
        io.to('lobby').emit('game joined', meta);

        const payload = {};
        payload.meta = meta;
        if (!meta.opponentName) {
          io.to(gameId).emit('room joined', payload);
        } else {
          const sql = `
          select *
            from "moves"
          where "gameId" = $1
          order by "moveId"
          `;
          const params = [gameId];
          db.query(sql, params)
            .then(result => {
              payload.moves = result.rows;
              io.to(gameId).emit('room joined', payload);
            })
            .catch(err => console.error(err));
        }
      })
      .catch(err => {
        console.error(err);
        socket.disconnect();
      });
  }

  socket.on('join lobby', () => {
    socket.join('lobby');
  });

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
        throw new ClientError(404, 'no such gameId exists');
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.get('/api/moves/:gameId', (req, res, next) => {
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);
  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  select *
    from "moves"
   where "gameId" = $1
  order by "moveId"
  `;
  const params = [gameId];
  db.query(sql, params)
    .then(result => res.json(result.rows))
    .catch(err => next(err));
});

app.post('/api/games', (req, res, next) => {
  const { playerName, playerSide, message } = req.body;
  if (!playerName || !playerSide || (!message && message !== '')) {
    throw new ClientError(400, 'missing required field');
  }
  const opponentSide = playerSide === 'white' ? 'black' : 'white';
  const sql = `
  insert into "games" ("message", "playerName", "playerSide", "opponentSide")
  values ($1, $2, $3, $4)
  returning *
  `;
  const params = [message, playerName, playerSide, opponentSide];
  db.query(sql, params)
    .then(result => {
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.post('/api/games/:gameId', (req, res, next) => {
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
  update "games"
     set "opponentName" = $2
   where "gameId" = $1
  returning *
  `;
  const params = [gameId, opponentName];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(404, 'no such gameId exists');
      }
      res.json(result.rows[0]);
    })
    .catch(err => next(err));
});

app.post('/api/moves/:gameId', (req, res, next) => {
  const { start, end, promotion } = req.body;
  if (!start || !end) {
    throw new ClientError(400, 'missing required field');
  }
  if (Number.isNaN(start)) {
    throw new ClientError(400, `${start} is not a valid starting coordinate`);
  } else if (Number.isNaN(end)) {
    throw new ClientError(400, `${end} is not a valid starting coordinate`);
  }
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);
  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  insert into "moves" ("gameId", "start", "end", "promotion")
  values ($1, $2, $3, $4)
  returning *
  `;
  const params = [gameId, start, end, promotion];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(500, 'an unexpected error occurred');
      }
      const move = result.rows[0];
      io.to(gameId).emit('move made', move);
      res.json(move);
    })
    .catch(err => next(err));
});

app.put('/api/games/:gameId', (req, res, next) => {
  const { winner } = req.body;
  const resolutions = ['white', 'black', 'draw'];
  if (!winner) {
    throw new ClientError(400, 'missing required field');
  }
  if (!resolutions.includes(winner)) {
    throw new ClientError(400, `${winner} is not a valid resolution`);
  }
  const gameId = req.params.gameId;
  const gameIdInt = parseInt(gameId);
  if (!Number.isInteger(gameIdInt)) {
    throw new ClientError(400, `${gameId} is not a valid gameId`);
  }

  const sql = `
  update "games"
     set "winner" = $2
   where "gameId" = $1
  returning *
  `;
  const params = [gameId, winner];
  db.query(sql, params)
    .then(result => {
      if (result.rows.length === 0) {
        throw new ClientError(404, 'no such gameId exists');
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

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Socket.IO server running at http://localhost:${process.env.PORT}/`);
});
