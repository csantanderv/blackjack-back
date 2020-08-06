# Blackjack Multiplayer Game - Backend

![BlackJack](/shuffle-cards.svg)

Multiplayer game based on the blackjack casino game. You can play with 2 different profiles: Bank or Normal Player.

### Installing

```bash
# Install
$ npm install

# Run
$ npm run
```

Then you have to create the .env file with the following:

```bash
# .env
# URL of a mongodb database service
mongoURI=
# Secret Token use for auth
jwtSecret=token
# Token Expiration
jwtExpiration=1d
# API for Deck Cards
cardApi=https://deckofcardsapi.com/api/deck
```

## Built With

- [Framework NestJS - Node.js](https://github.com/nestjs/nest)
- [TypeScript](https://www.typescriptlang.org/)
- [Socket.IO](https://socket.io/)
- [Deck of Cards an API](https://deckofcardsapi.com/)

## Authors

- Carlos Santander - Full Stack Developer.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
