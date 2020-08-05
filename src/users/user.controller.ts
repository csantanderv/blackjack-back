import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { NewUserDto } from './dto/new-user.dto';
import { RegisterDto } from './dto/register.dto';
import { IGame } from './interfaces/game.interface';
import { IUserGame } from './interfaces/user-game.interface';
import { UserGameDto } from './dto/user-game.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async newUser(@Body() login: RegisterDto): Promise<NewUserDto> {
    return await this.userService.newUser(login);
  }

  @Post('/game')
  async newGame(): Promise<IGame> {
    return await this.userService.newGame();
  }

  @Get('/game')
  async getGames(): Promise<IGame[]> {
    return await this.userService.getGames();
  }

  @Post('/game/update-current')
  async updateCurrent(@Body() current: { id: string }): Promise<IGame> {
    return await this.userService.updateCurrentGame(current.id);
  }

  @Get('/game/current-game')
  async getCurrentGame(): Promise<IGame> {
    return await this.userService.findCurrentGame();
  }

  @Post('/user/save-game')
  async saveGameUser(@Body() userGame: UserGameDto): Promise<IUserGame> {
    return await this.userService.saveGameUser(userGame);
  }
}
