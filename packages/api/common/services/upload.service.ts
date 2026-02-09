import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET');
    this.endpoint = this.configService.getOrThrow<string>('S3_ENDPOINT');

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('S3_REGION'),
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  /**
   * Upload file to S3 bucket
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'objects',
  ): Promise<string> {
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const extension = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const key = `${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Construct public URL
      const publicUrl = `${this.endpoint}/${this.bucketName}/${key}`;

      this.logger.log(`File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete file from S3 bucket
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const urlParts = fileUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL');
      }
      const key = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      // Don't throw error, just log it (file might already be deleted)
    }
  }

  /**
   * Validate file type (image only)
   */
  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * Validate file size (max 5MB)
   */
  validateFileSize(file: Express.Multer.File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
