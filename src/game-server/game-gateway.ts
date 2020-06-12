import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { EventTypes } from './event-types';
import { Server, Socket } from 'socket.io';
import { PlayerDto } from './dto/player.dto';
import { CardsService } from '../cards/cards.service';
import { CardValue, GameRules } from '../cards/constants/game-constants';

@WebSocketGateway({
  transports: ['websocket'],
  pingTimeout: 60000,
})
export class GameGateway implements OnGatewayInit {
  constructor(private readonly cardsService: CardsService) {}
  players: any[] = [];
  bank: PlayerDto = null;
  cardDeck = { deck_id: '' };
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('GameGateway');

  afterInit(server: any) {
    this.logger.log(EventTypes.Init);
  }

  handleConnection(client: Socket) {
    const { profile, id, name } = client.handshake.query;

    const playerDto = new PlayerDto();
    playerDto.id = id;
    playerDto.name = name;
    playerDto.profile = profile;
    playerDto.playing = false;
    playerDto.totalAmountLost = 0;
    playerDto.totalAmountWin = 0;
    playerDto.betAmount = 0;
    playerDto.playing = true;
    playerDto.cards = [];
    playerDto.hiting = false;
    playerDto.standing = false;
    playerDto.currentResult = 'PLAYING';
    playerDto.idSocket = client.id;

    if (profile === 'BANK') {
      this.bank = playerDto;
      this.logger.log(
        `Bank connected: ${client.id} - bank ${id} connected players.`,
      );
    } else {
      this.players = [...this.players, playerDto];
      this.logger.log(
        `Player connected: ${client.id} - ${this.players.length} connected clients.`,
      );
    }

    this.server.emit(EventTypes.SetBank, this.bank);
    this.server.emit(EventTypes.SetPlayers, this.players);
    this.server.emit(EventTypes.PlayerConnected, playerDto);
    client.emit(EventTypes.Connected, 'Se encuentra conectado');
  }

  handleDisconnect(client: Socket) {
    const { profile, name } = client.handshake.query;
    if (profile === 'BANK') {
      this.bank = null; //{ id: '', cards: [], currentResult: 'PLAYING' };
      this.logger.log(`Bank disconnected`);
    } else {
      this.players = this.players.filter(
        player => player.idSocket !== client.id,
      );
      this.server.emit(EventTypes.SetPlayers, this.players);
      this.logger.log(
        `Player disconnected: ${client.id} - ${this.players.length} connected clients.`,
      );
    }
    this.server.emit(EventTypes.Disconnected, `${name} se ha desconectado`);
  }

  @SubscribeMessage(EventTypes.Logout)
  handleLogout(client: Socket) {
    this.handleDisconnect(client);
  }

  @SubscribeMessage(EventTypes.GiveCard)
  async handleGiveCard(client: Socket, data: any) {
    if (data) {
      const players = [...this.players];
      const { bank } = this;

      const card = await this.cardsService.getCard(this.cardDeck.deck_id);
      this.logger.log(`Carta obtenida player:` + card.code);
      players.map(player => {
        if (player.id === data.id) {
          player.hiting = false;
          player.cards.push({ card: card.code, hidden: false });
        }
      });

      players.map(p => {
        p.currentResult = this.checkPlayerResult(p).currentResult;
        if (p.currentResult === 'LOSER') {
          p.totalAmountLost = p.totalAmountLost + p.betAmount;
          bank.totalAmountWin = bank.totalAmountWin + p.betAmount;
        }
        if (p.currentResult === 'WINNER') {
          p.totalAmountWin = p.totalAmountWin + p.betAmount;
          bank.totalAmountLost = bank.totalAmountLost + p.betAmount;
        }
      });

      this.players = players;
      this.bank = bank;
      this.server.emit(EventTypes.SetBank, this.bank);
      this.server.emit(EventTypes.SetPlayers, this.players);
    }
  }

  @SubscribeMessage(EventTypes.PlayerHit)
  handlePlayerHit(client: Socket, data: any) {
    if (data) {
      const players = [...this.players];
      players.map(player => {
        if (player.idSocket === client.id) {
          player.hiting = true;
          player.standing = false;
        }
      });
      this.players = players;
      this.server.emit(EventTypes.SetPlayers, this.players);
    }
  }

  @SubscribeMessage(EventTypes.BankHit)
  async handleBankHit(client: Socket, data: any) {
    const players = [...this.players];
    const { bank } = this;
    let showCard = false;
    bank.cards.map(card => {
      if (card.hidden) {
        card.hidden = false;
        showCard = true;
      }
    });

    if (!showCard) {
      const newCard = await this.cardsService.getCard(this.cardDeck.deck_id);
      this.logger.log(`Carta obtenida bank:` + newCard.code);
      bank.cards.push({ card: newCard.code, hidden: false });
    }
    const checkBank = this.checkPlayerResult(bank);
    bank.currentResult = checkBank.currentResult;

    if (
      checkBank.currentResult === 'PLAYING' &&
      checkBank.total >= GameRules.LimitBank
    ) {
      let totalWinner = 0;
      let totalLoser = 0;
      players.forEach(p => {
        const checkPlayer = this.checkPlayerResult(p);
        if (checkPlayer.currentResult === 'PLAYING') {
          if (checkPlayer.total > checkBank.total) {
            p.currentResult = 'WINNER';
            p.totalAmountWin = p.totalAmountWin + p.betAmount;
            bank.totalAmountLost = bank.totalAmountLost + p.betAmount;
            totalWinner++;
          } else {
            p.currentResult = 'LOSER';
            p.totalAmountLost = p.totalAmountLost + p.betAmount;
            bank.totalAmountWin = bank.totalAmountWin + p.betAmount;
            totalLoser++;
          }
        }
      });

      if (totalWinner > totalLoser) {
        bank.currentResult = 'LOSER';
      } else {
        bank.currentResult = 'WINNER';
      }
    }

    if (checkBank.currentResult === 'WINNER') {
      players.forEach(p => {
        const checkPlayer = this.checkPlayerResult(p);
        if (checkPlayer.currentResult === 'PLAYING') {
          p.currentResult = 'LOSER';
          p.totalAmountLost = p.totalAmountLost + p.betAmount;
          bank.totalAmountWin = bank.totalAmountWin + p.betAmount;
        }
      });
    }

    if (checkBank.currentResult === 'LOSER') {
      players.forEach(p => {
        const checkPlayer = this.checkPlayerResult(p);
        if (checkPlayer.currentResult === 'PLAYING') {
          p.currentResult = 'WINNER';
          p.totalAmountWin = p.totalAmountWin + p.betAmount;
          bank.totalAmountLost = bank.totalAmountLost + p.betAmount;
        }
      });
    }

    this.players = players;
    this.bank = bank;
    this.server.emit(EventTypes.SetBank, this.bank);
    this.server.emit(EventTypes.SetPlayers, this.players);
  }

  @SubscribeMessage(EventTypes.PlayerStand)
  handlePlayerStand(client: Socket, data: any) {
    if (data) {
      const players = [...this.players];
      players.map(player => {
        if (player.idSocket === client.id) {
          player.standing = true;
          player.hiting = false;
        }
      });
      this.players = players;
      this.server.emit(EventTypes.SetPlayers, this.players);
    }
  }

  @SubscribeMessage(EventTypes.PlayerBet)
  handlePlayerBet(client: Socket, data: any) {
    if (data) {
      const players = [...this.players];
      players.map(player => {
        if (player.idSocket === client.id) {
          player.betAmount = data.betAmount;
        }
      });
      this.players = players;
      this.server.emit(EventTypes.SetPlayers, this.players);
    }
  }

  @SubscribeMessage(EventTypes.ResetGame)
  handleResetGame(client: Socket, data: any) {
    const players = [...this.players];
    const { bank } = this;
    players.map(player => {
      player.playing = false;
      player.cards = [];
      player.hiting = false;
      player.standing = false;
      player.betAmount = 0;
      player.currentResult = 'PLAYING';
    });

    if (bank) {
      bank.playing = false;
      bank.cards = [];
      bank.hiting = false;
      bank.standing = false;
      bank.betAmount = 0;
      bank.currentResult = 'PLAYING';
    }

    this.players = players;
    this.bank = bank;
    this.server.emit(EventTypes.SetBank, this.bank);
    this.server.emit(EventTypes.SetPlayers, this.players);
    this.server.emit(EventTypes.GameFinished);
  }

  @SubscribeMessage(EventTypes.NewGame)
  async handleNewGame(client: Socket) {
    //TODO: Validar las cartas que quedan, hay que mandar un evento pa decir que se acabaron las cartas
    //TODO: Cuando algún jugador gane o pierda al repartir las cartas, hay que gestionar qué mierda hacer
    const players = [...this.players];
    const { bank } = this;

    if (players.length > 0 && this.bank) {
      if (this.cardDeck.deck_id === '') {
        const cardDeck = await this.cardsService.getCardDeck();
        this.cardDeck = cardDeck;
      }
      const totalCards = players.length * 2 + 2; // las dos cartas para cada jugador + 2 cartas del banco
      const cardsGame = await this.cardsService.getCardsNewGame(
        this.cardDeck.deck_id,
        totalCards,
      );

      for (let index = 0; index < cardsGame.cards.length / 2 - 1; index++) {
        const card = cardsGame.cards[index];
        players[index].cards.push({ card: card.code, hidden: false });
      }
      let cardBank = cardsGame.cards[cardsGame.cards.length / 2 - 1];
      bank.cards.push({ card: cardBank.code, hidden: false });

      for (
        let index = cardsGame.cards.length / 2;
        index < cardsGame.cards.length - 1;
        index++
      ) {
        const card = cardsGame.cards[index];
        players[index - cardsGame.cards.length / 2].cards.push({
          card: card.code,
          hidden: false,
        });
      }
      cardBank = cardsGame.cards[cardsGame.cards.length - 1];
      bank.cards.push({ card: cardBank.code, hidden: true });

      players.forEach(p => {
        p.currentResult = this.checkPlayerResult(p).currentResult;
        if (p.currentResult === 'LOSER') {
          p.totalAmountLost = p.totalAmountLost + p.betAmount;
        }
        if (p.currentResult === 'WINNER') {
          p.totalAmountWin = p.totalAmountWin + p.betAmount;
        }
      });

      this.players = players;
      this.bank = bank;

      this.server.emit(EventTypes.SetPlayers, this.players);
      this.server.emit(EventTypes.SetBank, this.bank);
      this.server.emit(EventTypes.GameStarted);
      client.emit(EventTypes.SetBank, this.bank);
    }
  }

  checkPlayerResult(
    player: PlayerDto,
  ): { total: number; currentResult: string } {
    const { cards } = player;

    let total: number = 0;
    cards.forEach(card => {
      total = total + CardValue[card.card];
      if (CardValue[card.card] === 11) {
        total = total - 10; //+ (total + CardValue[card.card] > 21 ? 1 : CardValue[card.card]);
      }
    });
    let result = '';
    if (total === 21) {
      result = 'WINNER';
    }
    if (total < 21) {
      result = 'PLAYING';
    } else {
      result = 'LOSER';
    }

    return { total: total, currentResult: result };
  }
}
