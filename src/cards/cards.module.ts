import { Module, HttpModule } from '@nestjs/common';
import { CardsService } from './cards.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { CardsController } from './cards.controller';

@Module({
  imports: [
    ConfigService,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('httpConfig'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CardsService],
  controllers: [CardsController],
})
export class CardsModule {}
