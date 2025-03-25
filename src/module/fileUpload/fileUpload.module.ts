import { Module, Global } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileUploadProvider } from './fileUpload.provider';

@Global()
@Module({
  providers: [FileUploadProvider, FileUploadService],
  exports: [FileUploadProvider, FileUploadService],
})
export class FileUploadModule {}
