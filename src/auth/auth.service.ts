import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { ValidUserDto } from './dto/valid-user.dto';
import { GameUserDto } from './dto/game-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getUserById(id: string): Promise<GameUserDto> {
    const user = await this.userService.findUserById(id);
    const gameUser = new GameUserDto();
    gameUser.email = user.email;
    gameUser.id = user.id;
    gameUser.profile = user.profile;
    gameUser.name = user.name;
    return gameUser;
  }

  async loginUser(loginDto: LoginDto): Promise<ValidUserDto> {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (user === null || user === undefined) {
      throw new NotFoundException();
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = {
      user: {
        id: user.id,
        profile: user.profile,
      },
    };

    const token = this.jwtService.sign(payload);
    const validUser = new ValidUserDto();
    validUser.token = token;
    return validUser;
  }
}
