import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { MongooseModule } from '@nestjs/mongoose';

import config from './config/app';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          'mongodb+srv://csantanderv:J7tB5ZxJ0L0tSFR3@cluster0-dwjk1.mongodb.net/test?retryWrites=true&w=majority',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
