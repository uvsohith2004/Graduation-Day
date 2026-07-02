import { Controller, Post, Get, Query, Body, UseGuards, HttpException, HttpStatus, Res } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StorageService } from './storage.service';
import type { Response } from 'express';

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

  @Get('proxy-image')
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new HttpException('url is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpException('Failed to fetch image', HttpStatus.BAD_REQUEST);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      // NestJS Express will automatically handle the CORS if enabled globally, 
      // but to be safe we can explicitly set it for this proxy
      res.setHeader('Access-Control-Allow-Origin', '*'); 
      
      res.send(buffer);
    } catch (error) {
      console.error('Proxy image error:', error);
      throw new HttpException('Failed to proxy image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

