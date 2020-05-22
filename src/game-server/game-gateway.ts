import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { EventTypes } from './event-types';
import { Server, Socket } from 'socket.io';
import { PlayerDto } from './dto/player.dto';
import { CardsService } from '../cards/cards.service';

@WebSocketGateway({ namespace: 'gameEvents' })
export class GameGateway implements OnGatewayInit {
  constructor(private readonly cardsService: CardsService) {}
  players: any[] = [];
  bank = { id: '', cards: [] };
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
    playerDto.betAmount = 0;
    playerDto.playing = true;
    playerDto.cards = [];
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

    this.server.emit(EventTypes.SetPlayers, this.players);
    this.server.emit(EventTypes.PlayerConnected, playerDto);
    client.emit(EventTypes.Connected, 'Se encuentra conectado');
  }

  handleDisconnect(client: Socket) {
    const { profile, name } = client.handshake.query;
    if (profile === 'BANK') {
      this.bank = { id: '', cards: [] };
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

  @SubscribeMessage(EventTypes.PlayerBet)
  handlePlayerBet(client: Socket, data: any) {
    if (data) {
      this.players.map(player => {
        if (player.idSocket === client.id) {
          player.betAmount = data.betAmount;
        }
      });
      this.server.emit(EventTypes.SetPlayers, this.players);
    }
  }

  @SubscribeMessage(EventTypes.NewGame)
  async handleNewGame(client: Socket) {
    //TODO: Quizás validar que sea el banco solamente.
    //TODO: Validar las cartas que quedan, hay que mandar un evento pa decir que se acabaron las cartas
    //TODO: Falta limpiar las cartas cada vez que se presiona play
    const players = [...this.players];

    if (players.length > 0 && this.bank.id !== '') {
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
      this.bank.cards.push({ card: cardBank.code, hidden: false });
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
      this.bank.cards.push({ card: cardBank.code, hidden: true });

      this.players = players;
      this.server.emit(EventTypes.SetPlayers, this.players);
      client.emit(EventTypes.SetBank, this.bank);
    }
  }
}
