import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NewUserDto } from './dto/new-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id: id });
    return user;
  }

  async newUser(registerDto: RegisterDto): Promise<NewUserDto> {
    try {
      let user = await this.userModel.findOne({ email: registerDto.email });
      //TODO: arreglar el manejo de error para este punto
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
}
