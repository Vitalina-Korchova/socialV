import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ImageService {
  async saveImage(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = '.webp';
    const filename = uuid() + ext;
    const uploadPath = path.join(process.cwd(), 'uploads', folder);

    const filepath = path.join(uploadPath, filename);
    await sharp(file.buffer).webp({ quality: 80 }).toFile(filepath);
    return `${folder}/${filename}`;
  }

  async removeImage(filePath: string) {
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
