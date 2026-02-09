import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Profile retrieved successfully',
        data: {
          id: '507f1f77bcf86cd799439011',
          username: 'johndoe',
          createdAt: '2026-02-09T10:30:00.000Z',
          updatedAt: '2026-02-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ResponseMessage('Profile retrieved successfully')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Profile updated successfully',
        data: {
          id: '507f1f77bcf86cd799439011',
          username: 'johndoe_updated',
          createdAt: '2026-02-09T10:30:00.000Z',
          updatedAt: '2026-02-09T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ResponseMessage('Profile updated successfully')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
