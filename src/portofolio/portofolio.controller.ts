import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Body, Req, UsePipes, ValidationPipe, Get, Param, Query } from '@nestjs/common';
import { PortofolioService } from './portofolio.service';
import { CreatePortofolioDto } from './dto/create-portofolio.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('portofolio')
export class PortofolioController {
  constructor(private readonly portfolioService: PortofolioService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 10, {
    storage: diskStorage({
      destination: './uploads/portfolio',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  }))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createPortfolioDto: CreatePortofolioDto,
    @UploadedFiles() photos: Express.Multer.File[],
    @Req() req: Request
  ) {
    const token = createPortfolioDto.token; // Get owner from JWT token
    const photoPaths = photos.map((file) => file.filename);
    return this.portfolioService.create(createPortfolioDto, token, photoPaths);
  }

  @Get()
  async getPortfolioById(@Query('id') id: number, @Query('token') token: string) {
    const result = await this.portfolioService.findOneById(id, token);
    return {
      status: 200,
      message: 'Get data successfully',
      data: result,
    };
  }

  @Get('owner')
  async getPortfoliosByOwner(@Query('token') token: string) {
    const result = await this.portfolioService.findByOwner(token);
    return {
      status: 200,
      count: result.length,
      message: 'Get data successfully',
      data: result,
    };
  }
}
