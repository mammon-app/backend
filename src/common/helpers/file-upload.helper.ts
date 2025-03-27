import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

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
}
