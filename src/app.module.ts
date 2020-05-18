import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/app';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './shared/jwt.strategy';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { GameGateway } from './game-gateway/game-gateway';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongoURI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: {
          expiresIn: configService.get('jwtExpiration'),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, GameGateway],
})
export class AppModule {}
