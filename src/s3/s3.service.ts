import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucketName = 'fotoinlah';
  private endpoint = 'https://is3.cloudhost.id';

  constructor() {
    this.s3 = new S3({
      accessKeyId: 'NUFUG0CJ1CSMMKBS3N92',
      secretAccessKey: 'FJgIi96mf3xQpBmGZuLzQPZS6mKUaNO7blytSB8i',
      endpoint: this.endpoint,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadFile(filePath: string, originalFileName: string, folder: string): Promise<string> {
    const timestamp = Date.now();
    const fileExtension = extname(originalFileName);
    const fileName = `${folder}-${timestamp}${fileExtension}`;
    
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: contentType,
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location; // S3 URL of the uploaded file
    } catch (error) {
      throw new HttpException(`Error uploading file: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
