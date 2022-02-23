insert into "users" ("username", "hashedPassword")
values ('Anonymous', '$argon2i$v=19$m=4096,t=3,p=1$fXkHPjxT6IK9v4B24KSg5g$7l5Z1ToiLwwznekaFDcfGFqhESXHskA5nuDvxPXLJ78'),
       ('demo', '$argon2i$v=19$m=4096,t=3,p=1$l9mGKtyofrl4GxF5xuI2KQ$eTxyN2L+0l4OFDxnyY1uoUl+NFPC7mB/jjwVqr7QTJQ')
returning *;
