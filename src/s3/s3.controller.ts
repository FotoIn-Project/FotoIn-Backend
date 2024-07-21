import { Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', file.filename);

    try {
      
      const result = await this.s3Service.uploadFile(filePath, file.filename, "test");
      console.log(result);
      fs.unlinkSync(filePath);
      return result;
      
    } catch (error) {
      throw new HttpException(`Error uploading file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

