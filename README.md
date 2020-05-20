## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Flujo del servicio

```mermaid
sequenceDiagram
    participant P as Player
    participant B as Bank
    participant F as Front
    participant S as Server
    participant D as DeckAPI
    B->>F: newGame()
    F->>S: newGame()
    S->>D: getDeck()
    D-->>S: deck
    S-->>F: infoGame
    F-->>P: bankInfo,playersInfo
    loop Players Dealing
        P->>F: deal(mount)
        F->>S: deal(player,mount)
        S->>S: setDeal(player, mount)
    end
    loop Sending first cards
        B->>F: giveCard(player)
        F->>S: giveCard(player)
        S->>D: getCard()
        D-->>S: card
        S->>S: addCardPlayer(player,card)
        S-->>F: sendCard(card,player,bankInfo)
        F-->>P: sendCard(card,player, bankInfo)
    end
    S->>D: getCard()
    D-->>S: card
    S->>S: setBankCard(card,hidden = false)
    loop Sending Second cards
        B->>F: giveCard(player)
        F->>S: giveCard(player)
        S->>D: getCard()
        D-->>S: card
        S->>S: addCardPlayer(player,card)
        S-->>F: sendCard(card,player, bankInfo)
        F-->>P: sendCard(card,player, bankInfo)
    end
    S->>D: getCard()
    D-->>S: card
    S->>S: setBankCard(firstCard,hidden = true)
    loop Players betting until winner
        alt Player Bet
            P->>F: hitCard(player)
            F->>S: hitCard(player)
            S-->>B: getCard(player)
            B->>F: giveCard(player)
            F->>S: giveCard(player)
            S->>D: getCard()
            D-->>S: card
            S-->>F: sendCard(player, card)
            F-->>P: player->card
        else
            P->>F: stand(player)
            F->>S: stand(player)
            S-->>B: showCard(player)
            loop Bank getting cards until 17 or has a winner
                B->>F: showCart()
                F->>S: showCart()
                S->>S: showCart()
                S->>S: validateWinner()
                S->>D: getCard()
                D-->>S: card
            end
        end
    end
    S->>S: settingWinner()
    S-->>F: notifyWinner(player winner)
    F-->>P: notifyWinner(player winner)
    B->>F: shuffle()
    F->>S: shuffle()
    S->>S: shuffle()
    loop Sending first cards
        S->>D: getCard()
        D-->>S: card
        S-->>F: sendCard(card,player,bankInfo)
        F-->>P: sendCard(card,player, bankInfo)
    end

```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
