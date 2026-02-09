import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: { username: string; passwordHash: string }) {
    const user = new this.userModel(data);
    const savedUser = await user.save();

    return {
      id: savedUser._id.toString(),
      username: savedUser.username,
      createdAt: savedUser.createdAt,
    };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, data: { username?: string }) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.username) {
      // Check if username is already taken
      const existingUser = await this.userModel.findOne({
        username: data.username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }

      user.username = data.username;
    }

    await user.save();

    return {
      id: user._id.toString(),
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
