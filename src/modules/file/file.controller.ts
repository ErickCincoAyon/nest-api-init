import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class FileController {
  
  constructor(
    private readonly fileService: FileService
  ) {}
    
  @Get('assets/:imageName')
  async getFile( @Param('imageName') imageName: string, @Res() res: Response ) {

    return await this.fileService.getFile( imageName, res );
  }

}
