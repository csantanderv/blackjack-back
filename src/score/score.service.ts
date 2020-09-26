import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../users/interfaces/user.interface';
import { IGame } from './interfaces/game.interface';
import { IUserGame } from './interfaces/user-game.interface';

@Injectable()
export class ScoreService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Game') private gameModel: Model<IGame>,
    @InjectModel('UserGame') private userGameModel: Model<IUserGame>,
    private readonly jwtService: JwtService,
  ) {}

  async findGameById(id: string): Promise<IGame> {
    const game = await this.gameModel.findOne({ _id: id });
    return game;
  }

  async findCurrentGame(): Promise<IGame> {
    const game = await this.gameModel.findOne({ currentGame: true });
    return game;
  }

  async updateCurrentGame(id: string): Promise<IGame> {
    await this.gameModel.updateMany(
      { currentGame: true },
      { $set: { currentGame: false } },
    );

    const updatedOne = await this.gameModel.updateOne(
      { _id: id },
      { currentGame: true },
    );

    return updatedOne;
  }

  async getGames(): Promise<IGame[]> {
    return await this.gameModel.find();
  }

  async newGame(): Promise<IGame> {
    try {
      await this.gameModel.updateMany(
        { currentGame: true },
        { $set: { currentGame: false } },
      );

      const newGame = new this.gameModel({
        currentGame: true,
        status: 'PLAYING',
      });
      await newGame.save();

      return newGame;
    } catch (error) {
      throw new HttpException(
        'error al registrar el juego',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
