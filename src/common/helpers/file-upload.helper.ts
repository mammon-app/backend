import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { BadRequestException } from '@nestjs/common';

export class FileUploadHelper {
  /**
   * Handles uploading an image to Cloudinary.
   *
   * @param {any} file - The file to be uploaded (typically a Buffer or stream).
   * @returns {Promise<UploadApiResponse | UploadApiErrorResponse>} - The Cloudinary upload response.
   */
  static async imageHandler(
    file: any,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  /**
   * Uploads a file (image) to Cloudinary.
   *
   * @param {any} image - The image file to upload.
   * @returns {Promise<{ url: string }>} - The URL of the uploaded image.
   * @throws {BadRequestException} - Throws a BadRequestException if upload fails.
   */
  static async uploadFile(image: any): Promise<{ url: string }> {
    try {
      // Configure Cloudinary with credentials
      v2.config({
        cloud_name: 'leadvision',
        api_key: '552493135143513',
        api_secret: 'MNILhiYJADszOk5zjVTyKzZGAeQ',
      });
      // Use imageHandler to upload the image
      const upload = await this.imageHandler(image);
      // Return the URL of the uploaded image
      return {
        url: upload.secure_url,
      };
    } catch (e) {
      console.error(e);
      // Throw a BadRequestException if something goes wrong during upload
      throw new BadRequestException('Something went wrong');
    }
  }
}
