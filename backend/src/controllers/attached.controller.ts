// src/attached-message/attached-message.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AttachedMessageService } from '../services/attached.service';

const UPLOAD_DIR = join(__dirname, '..', '..', 'uploads'); // project-root/uploads

@Controller('attachments')
export class AttachedMessageController {
  constructor(private readonly service: AttachedMessageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
        // gunakan nama asli file
        cb(null, file.originalname);
      },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedExt = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.docx', '.xlsx', '.txt'];
        const fileExt = extname(file.originalname).toLowerCase();
        if (!allowedExt.includes(fileExt)) {
          return cb(new BadRequestException('File type not allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('message_id', ParseIntPipe) message_id: number,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // hitung ekstensi tanpa titik
    const ext = (extname(file.originalname) || '').replace('.', '');

    const saved = await this.service.saveMetadata(file.filename, message_id, ext);
    return {
      ok: true,
      file: {
        serverFilename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: ext,
      },
      db: saved,
      url: `/uploads/${file.filename}`, // jika Anda serve statik di /uploads
    };
  }
}
