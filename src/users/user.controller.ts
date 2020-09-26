import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { NewUserDto } from './dto/new-user.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async newUser(@Body() login: RegisterDto): Promise<NewUserDto> {
    return await this.userService.newUser(login);
  }
}
