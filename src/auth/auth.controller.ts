import {
  Controller,
  Get,
  Body,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidUserDto } from './dto/valid-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(AuthGuard())
  @Get()
  async getUser(@Request() req): Promise<any> {
    const user = this.authService.getUserById(req.user.id);
    return user;
  }

  @Post('/login')
  async validateUser(@Body() login: LoginDto): Promise<ValidUserDto> {
    return this.authService.loginUser(login);
  }
}
