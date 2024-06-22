import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CategorySeeder } from './seeds/category-seeder';
import { DataSource } from 'typeorm';
import { existsSync, writeFileSync } from 'fs';
import * as cors from 'cors';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

class CustomIoAdapter extends IoAdapter {
  constructor(app: NestExpressApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const optionsWithCors: ServerOptions = {
      ...options,
      cors: {
        origin: 'http://localhost:5173', // Allow only this origin
        methods: ['GET', 'POST'],
        credentials: true,
      },
    };
    return super.createIOServer(port, optionsWithCors);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure CORS for HTTP routes
  app.use(cors({
    origin: 'http://localhost:5173', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));

  // Use custom WebSocket adapter for CORS
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  const dataSource = app.get(DataSource);

  const seederFlagPath = join(__dirname, '..', 'seeder.flag');

  if (!existsSync(seederFlagPath)) {
    const seeder = new CategorySeeder();
    await seeder.run(dataSource);
    console.log('Categories have been seeded!');

    // Create a flag file to indicate that the seeder has run
    writeFileSync(seederFlagPath, 'Seeder has run');
  } else {
    console.log('Seeder has already run, skipping...');
  }

  // Serve static assets
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  await app.listen(3000);
}

bootstrap();

