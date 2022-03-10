# Chess Alliance

A full stack chess application for game enthusiasts who want to play a game of chess with friends.

## Technologies

- React.js
- Webpack
- Bootstrap 5
- Node.js
- Socket.IO
- Express
- Argon2
- JSON Web Tokens
- HTML5
- CSS3
- Heroku

## Live Deployment Link

Try the application at https://chess-alliance.herokuapp.com/

## Features

- User can start a multiplayer chess game.
- User can view games menu list they wish to join.
- User can join a game.
- User can take their turn.
- User can win.
- User can forfeit.
- User can sign up.
- User can log in.
- User can play in local mode.

## Preview

![Animation](https://user-images.githubusercontent.com/6316645/157753440-0eb24a3f-e2b0-46cb-9fa3-84e743370d61.gif)

## Development

### System Requirements

- Node.js 10 or higher
- NPM 6 or higher

### Getting Started

1. Clone the repository.

    ```shell
    git clone https://github.com/meganbmartinez/ChessAlliance.git
    cd ChessAlliance
    ```

2. Install all dependencies with NPM.

    ```shell
    npm install
    ```

3. Create a new `.env` file for the application.

    ```shell
    cp .env.example .env
    ```

4. Change the `TOKEN_SECRET` and `DATABASE_URL` to secure, appropriate values in the `.env` file.

5. Run command `sudo service postgresql status` to see if postgresql is running.

6. If postgresql is not running, run the commant `sudo service postgresql start`

7. Run command `createdb chessAlliance` to initialize the database.

8. Run command `npm run db:import` to import the schema.

9. Start the project. Once started, you can view the application by opening http://localhost:3000 is your browser.

    ```shell
    npm run dev
    ```

## Future Development
- User can propose a rematch.
- User can view match history.
