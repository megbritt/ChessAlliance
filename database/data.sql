insert into "games" ("message", "playerName", "playerSide", "opponentSide", "resolved")
values ('play me', 'Anonymous', 'brown', 'white', FALSE),
       ('pros only','starkkid753', 'white', 'brown', FALSE)
returning *;
