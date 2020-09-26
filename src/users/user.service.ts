import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUser } from './interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { NewUserDto } from './dto/new-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
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
}
