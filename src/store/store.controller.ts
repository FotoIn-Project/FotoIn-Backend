// store.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { extname } from 'path';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cameraPhoto', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/stores',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
            );
          },
        }),
      },
    ),
  )
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @UploadedFiles()
    files: {
      cameraPhoto?: Express.Multer.File[];
    },
  ) {
    try {
      if (!files.cameraPhoto || files.cameraPhoto.length === 0) {
        throw new InternalServerErrorException('No file uploaded for cameraPhoto');
      }

      const imageUrls = files.cameraPhoto.map(file => `/uploads/stores/${file.filename}`);
      const cameraPhoto = imageUrls.join(',');

      // Save combined URLs in DTO
      createStoreDto.cameraPhoto = cameraPhoto;

      // Save store to database
      const createdStore = await this.storeService.create(createStoreDto);

      return createdStore;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      const stores = await this.storeService.findAll();
      return stores;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw new InternalServerErrorException('Failed to fetch stores');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.storeService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.storeService.remove(id);
  }
}
