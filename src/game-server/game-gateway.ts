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

@WebSocketGateway()
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  players = [];
  bank = {};
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
    const { profile, id, name } = client.handshake.query;
    if (profile === 'BANK') {
      this.bank = {};
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
}
