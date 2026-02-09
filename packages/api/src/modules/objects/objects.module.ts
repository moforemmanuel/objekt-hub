import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectsGateway } from './objects.gateway';
import { ObjectEntity, ObjectSchema } from './schemas/object.schema';
import { UploadService } from '@/common/services/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectEntity.name, schema: ObjectSchema },
    ]),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService, ObjectsGateway, UploadService],
  exports: [ObjectsService],
})
export class ObjectsModule {}
