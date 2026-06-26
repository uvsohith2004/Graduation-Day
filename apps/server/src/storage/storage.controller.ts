import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StorageService } from './storage.service';

@Controller('api/mutations')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('get-upload-url')
  @UseGuards(AuthGuard)
  async getUploadUrl(@Body('fileType') fileType: string, @Body('fileSize') fileSize: number) {
    if (!fileType || !fileSize) {
      throw new HttpException('fileType and fileSize are required', HttpStatus.BAD_REQUEST);
    }
    
    if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
      throw new HttpException('Only JPG and PNG images are allowed', HttpStatus.BAD_REQUEST);
    }
    
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (fileSize > MAX_SIZE) {
      throw new HttpException('File size must be less than 3MB', HttpStatus.BAD_REQUEST);
    }

    return this.storageService.getPresignedUploadUrl(fileType, fileSize);
  }
}
