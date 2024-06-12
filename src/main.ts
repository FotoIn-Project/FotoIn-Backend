import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CategorySeeder } from './seeds/category-seeder';
import { DataSource } from 'typeorm';
import { join as joinPath } from 'path';
import { existsSync, writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule , {cors : true});
  const dataSource = app.get(DataSource);

  const seederFlagPath = joinPath(__dirname, '..', 'seeder.flag');
  
  if (!existsSync(seederFlagPath)) {
    // Run seeder if flag file does not exist
    const seeder = new CategorySeeder();
    await seeder.run(dataSource);
    console.log('Categories have been seeded!');

    // Create the flag file to indicate that seeder has run
    writeFileSync(seederFlagPath, 'Seeder has run');
  } else {
    console.log('Seeder has already run, skipping...');
  }

  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  await app.listen(3000);
}
bootstrap();
