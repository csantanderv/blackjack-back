import { Module } from '@nestjs/common';
import { GameGateway } from './game-gateway';
import { ConfigService } from '@nestjs/config';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [ConfigService, CardsModule],
  providers: [GameGateway],
})
export class GameServerModule {}
