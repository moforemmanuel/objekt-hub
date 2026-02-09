import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      username: registerDto.username,
      passwordHash,
    });

    // Generate token
    const token = this.generateToken(user.id, user.username);

    return {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id, user.username);

    return {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  private generateToken(userId: string, username: string): string {
    const payload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }
}
