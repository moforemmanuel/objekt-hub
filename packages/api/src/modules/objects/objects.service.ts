import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectEntity, ObjectDocument } from './schemas/object.schema';
import { UploadService } from '@/common/services/upload.service';
import { ObjectsGateway } from './objects.gateway';
import { CreateObjectDto } from './dto/create-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectEntity.name)
    private readonly objectModel: Model<ObjectDocument>,
    private readonly uploadService: UploadService,
    private readonly objectsGateway: ObjectsGateway,
  ) {}

  async create(
    createObjectDto: CreateObjectDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    // Validate file
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!this.uploadService.validateImageFile(file)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG, and GIF are allowed',
      );
    }

    if (!this.uploadService.validateFileSize(file, 5)) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    // Upload image
    const imageUrl = await this.uploadService.uploadFile(file, 'objects');

    // Create object
    const newObject = new this.objectModel({
      title: createObjectDto.title,
      description: createObjectDto.description,
      imageUrl,
      createdBy: new Types.ObjectId(userId),
    });

    const savedObject = await newObject.save();

    const result = {
      id: savedObject._id.toString(),
      title: savedObject.title,
      description: savedObject.description,
      imageUrl: savedObject.imageUrl,
      createdBy: savedObject.createdBy.toString(),
      createdAt: savedObject.createdAt,
    };

    // Emit socket event
    this.objectsGateway.emitObjectCreated(result);

    return result;
  }

  async findAll(queryDto: QueryObjectsDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const [items, total] = await Promise.all([
      this.objectModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username')
        .exec(),
      this.objectModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        createdBy: {
          id: (item.createdBy as any)._id.toString(),
          username: (item.createdBy as any).username,
        },
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid object ID');
    }

    const object = await this.objectModel
      .findById(id)
      .populate('createdBy', 'username')
      .exec();

    if (!object) {
      throw new NotFoundException('Object not found');
    }

    return {
      id: object._id.toString(),
      title: object.title,
      description: object.description,
      imageUrl: object.imageUrl,
      createdBy: {
        id: (object.createdBy as any)._id.toString(),
        username: (object.createdBy as any).username,
      },
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
    };
  }

  async delete(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid object ID');
    }

    const object = await this.objectModel.findById(id);

    if (!object) {
      throw new NotFoundException('Object not found');
    }

    // Check ownership
    if (object.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own objects');
    }

    // Delete image from S3
    await this.uploadService.deleteFile(object.imageUrl);

    // Delete from database
    await this.objectModel.findByIdAndDelete(id);

    // Emit socket event
    this.objectsGateway.emitObjectDeleted(object._id.toString());

    return {
      id: object._id.toString(),
      message: 'Object deleted successfully',
    };
  }
}
