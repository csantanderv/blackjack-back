import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUser } from './interfaces/user.interface';
import { IUserGame } from './interfaces/user-game.interface';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { IGame } from './interfaces/game.interface';
import { NewUserDto } from './dto/new-user.dto';
import { UserGameDto } from './dto/user-game.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Game') private gameModel: Model<IGame>,
    @InjectModel('UserGame') private userGameModel: Model<IUserGame>,
    private readonly jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }

  async findUserById(id: string): Promise<IUser> {
    const user = await this.userModel.findOne({ _id: id });
    return user;
  }

  async findGameById(id: string): Promise<IGame> {
    const game = await this.gameModel.findOne({ _id: id });
    return game;
  }

  async findCurrentGame(): Promise<IGame> {
    const game = await this.gameModel.findOne({ currentGame: true });
    return game;
  }

  async updateCurrentGame(id: string): Promise<IGame> {
    let updatedOne;
    const updated = await this.gameModel.updateMany(
      { currentGame: true },
      { $set: { currentGame: false } },
    );

    updatedOne = await this.gameModel.updateOne(
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
      const updated = await this.gameModel.updateMany(
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

  async newUser(registerDto: RegisterDto): Promise<NewUserDto> {
    try {
      let user = await this.userModel.findOne({ email: registerDto.email });
      if (user) {
        throw new HttpException('el usuario ya existe', HttpStatus.BAD_REQUEST);
      }
      const salt = await bcrypt.genSalt(10);
      user = new this.userModel(registerDto);
      user.password = await bcrypt.hash(registerDto.password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
          profile: user.profile,
        },
      };
      const token = this.jwtService.sign(payload);
      const newUser = new NewUserDto();
      newUser.name = registerDto.name;
      newUser.profile = registerDto.profile;
      newUser.token = token;
      return newUser;
    } catch (err) {
      throw new HttpException(
        'error al registrar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveGameUser(gameUser: UserGameDto): Promise<IUserGame> {
    let user = await this.userModel.findOne({ email: gameUser.email });
    if (!user) {
      throw new HttpException(
        'el usuario no existe',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const game = await this.gameModel.findOne({ currentGame: true });

    let userGame = await this.userGameModel.findOne({
      user: user.id,
      game: game.id,
    });

    /*     if (userGame) {
      userGame.totalAmountLost = gameUser.totalAmountLost;
      userGame.totalAmountWin = gameUser.totalAmountWin;
      userGame.betAmount = gameUser.betAmount;
      userGame.save();
    } else {
      userGame = new this.userGameModel(gameUser);
      userGame.user = user.id;
      userGame.save();
    }
 */
    return userGame;
  }
}
