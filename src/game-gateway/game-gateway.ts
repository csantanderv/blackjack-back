import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ActionTypes } from './action-types';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayInit {
  connectedClients = [];
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('GameGateway');

  afterInit(server: any) {
    this.logger.log(ActionTypes.Init);
  }

  handleConnection(client: Socket) {
    this.connectedClients = [...this.connectedClients, client.id];
    this.logger.log(
      `Client connected: ${client.id} - ${this.connectedClients.length} connected clients.`,
    );
    //this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
    //client.emit(ActionTypes.Data, this.data);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients = this.connectedClients.filter(
      connectedClient => connectedClient !== client.id,
    );
    this.logger.log(
      `Client disconnected: ${client.id} - ${this.connectedClients.length} connected clients.`,
    );
    //this.server.emit(ActionTypes.ClientConnected, this.connectedClients);
  }

  // export class AppGateway {
  @SubscribeMessage(ActionTypes.Message)
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
