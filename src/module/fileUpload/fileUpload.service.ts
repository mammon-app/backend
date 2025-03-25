import { Injectable, BadRequestException } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import * as multer from 'multer';
import { Express } from 'express';

@Injectable()
export class FileUploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse | any> {
    if (!file) throw new BadRequestException('File is required');

    const fileUpload: UploadApiResponse | UploadApiErrorResponse | any =
      await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream((error, result) => {
          if (error)
            reject(
              new BadRequestException(`File upload failed: ${error.message}`),
            );
          resolve(result);
        });
        streamifier.createReadStream(file.buffer).pipe(upload);
      });

    return { data: { image: fileUpload.secure_url } };
  }
}
