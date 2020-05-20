import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ActionTypes } from './action-types';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  players = [];
  bank = {};
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('GameGateway');

  afterInit(server: any) {
    this.logger.log(ActionTypes.Init);
  }

  handleConnection(client: Socket) {
    const { profile, id, name } = client.handshake.query;
    if (profile === 'BANK') {
      this.bank = { id: id };
      this.logger.log(
        `Bank connected: ${client.id} - bank ${id} connected players.`,
      );
    } else {
      this.players = [...this.players, client.id];
      this.logger.log(
        `Player connected: ${client.id} - ${this.players.length} connected clients.`,
      );
    }
    this.server.emit(ActionTypes.PlayerConnected, `${name} se conectó`);
    client.emit(ActionTypes.Connected, 'Se encuentra conectado');
  }

  handleDisconnect(client: Socket) {
    const { profile, id, name } = client.handshake.query;
    if (profile === 'BANK') {
      this.bank = {};
      this.logger.log(`Bank disconnected`);
    } else {
      this.players = this.players.filter(
        connectedClient => connectedClient !== client.id,
      );
      this.logger.log(
        `Player disconnected: ${client.id} - ${this.players.length} connected clients.`,
      );
    }
    this.server.emit(ActionTypes.Disconnected, `${name} se ha desconectado`);
  }

  @SubscribeMessage(ActionTypes.Logout)
  handleLogout(client: Socket) {
    this.handleDisconnect(client);
  }
}
