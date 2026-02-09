import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PublicRoute } from '../../../common/decorators/public-route.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';

@ApiTags('Objects')
@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new object with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Object created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Object created successfully',
        data: {
          id: '507f1f77bcf86cd799439011',
          title: 'My Object',
          description: 'A beautiful object',
          imageUrl:
            'https://s3.backblaze.com/bucket/objects/1234567890-abc.jpg',
          createdBy: '507f1f77bcf86cd799439012',
          createdAt: '2026-02-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or missing fields',
    schema: {
      example: {
        status: 400,
        message: 'Invalid file type. Only JPG, PNG, and GIF are allowed',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid JWT token',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ResponseMessage('Object created successfully')
  async create(
    @Body() createObjectDto: CreateObjectDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    return this.objectsService.create(createObjectDto, file, userId);
  }

  @Get()
  @PublicRoute()
  @ApiOperation({ summary: 'Get all objects with pagination and search' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title and description',
  })
  @ApiResponse({
    status: 200,
    description: 'Objects retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Objects retrieved successfully',
        data: [
          {
            id: '507f1f77bcf86cd799439011',
            title: 'My Object',
            description: 'A beautiful object',
            imageUrl:
              'https://s3.backblaze.com/bucket/objects/1234567890-abc.jpg',
            createdBy: {
              id: '507f1f77bcf86cd799439012',
              username: 'johndoe',
            },
            createdAt: '2026-02-09T10:30:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ResponseMessage('Objects retrieved successfully')
  async findAll(@Query() queryDto: QueryObjectsDto) {
    return this.objectsService.findAll(queryDto);
  }

  @Get(':id')
  @PublicRoute()
  @ApiOperation({ summary: 'Get a single object by ID' })
  @ApiResponse({
    status: 200,
    description: 'Object retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Object retrieved successfully',
        data: {
          id: '507f1f77bcf86cd799439011',
          title: 'My Object',
          description: 'A beautiful object',
          imageUrl:
            'https://s3.backblaze.com/bucket/objects/1234567890-abc.jpg',
          createdBy: {
            id: '507f1f77bcf86cd799439012',
            username: 'johndoe',
          },
          createdAt: '2026-02-09T10:30:00.000Z',
          updatedAt: '2026-02-09T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Object not found',
    schema: {
      example: {
        status: 404,
        message: 'Object not found',
        error: 'Not Found',
      },
    },
  })
  @ResponseMessage('Object retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an object (only owner can delete)' })
  @ApiResponse({
    status: 200,
    description: 'Object deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Object deleted successfully',
        data: {
          id: '507f1f77bcf86cd799439011',
          message: 'Object deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own objects',
    schema: {
      example: {
        status: 403,
        message: 'You can only delete your own objects',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Object not found',
    schema: {
      example: {
        status: 404,
        message: 'Object not found',
        error: 'Not Found',
      },
    },
  })
  @ResponseMessage('Object deleted successfully')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.objectsService.delete(id, userId);
  }
}
