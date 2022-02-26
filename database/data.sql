insert into "games" ("message", "playerName", "playerSide", "opponentSide")
values ('Enter to join daily chess tournament', 'Starkid753', 'brown', 'white'),
       ('pros only', 'Anonymous', 'white', 'brown')
returning *;

insert into "users" ("username", "hashedPassword")
values ('testing', '$argon2i$v=19$m=4096,t=3,p=1$fXkHPjxT6IK9v4B24KSg5g$7l5Z1ToiLwwznekaFDcfGFqhESXHskA5nuDvxPXLJ78')
returning *;
