import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseMessage, PublicRoute } from '@/common/decorators';

@ApiTags('Authentication')
@Controller('auth')
@PublicRoute()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        status: 201,
        message: 'User registered successfully',
        data: {
          message: 'User registered successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists',
    schema: {
      example: {
        status: 409,
        message: 'Username already exists',
        errors: 'ConflictException',
      },
    },
  })
  @ResponseMessage('User registered successfully')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        status: 200,
        message: 'Login successful',
        data: {
          user: {
            id: '507f1f77bcf86cd799439011',
            username: 'johndoe',
            createdAt: '2026-02-09T10:30:00.000Z',
          },
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJpYXQiOjE2MzkwNDI2MDAsImV4cCI6MTYzOTY0NzQwMH0.abc123...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        status: 401,
        message: 'Invalid credentials',
        errors: 'UnauthorizedException',
        timestamp: '2026-02-09T10:30:00.000Z',
        path: '/api/auth/login',
      },
    },
  })
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
