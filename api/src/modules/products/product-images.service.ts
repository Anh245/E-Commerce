import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger(ProductImagesService.name);

  async upload(file: Express.Multer.File | undefined) {
    if (!file || !file.buffer.length || file.size > MAX_PRODUCT_IMAGE_BYTES) {
      throw new BadRequestException('Chọn một ảnh có dung lượng tối đa 5 MB');
    }
    const credentials = this.credentials();
    let body: Buffer;
    try {
      const image = sharp(file.buffer, {
        limitInputPixels: 20_000_000,
        animated: false,
      });
      const metadata = await image.metadata();
      if (
        !['jpeg', 'png', 'webp'].includes(metadata.format ?? '') ||
        (metadata.pages ?? 1) > 1
      ) {
        throw new Error('Unsupported image');
      }
      // Decode and re-encode actual bytes; MIME and filename supplied by the client are not trusted.
      body = await image
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        'Ảnh không hợp lệ; chỉ chấp nhận JPEG, PNG hoặc WebP tĩnh, tối đa 20 triệu điểm ảnh',
      );
    }
    const key = `products/${randomUUID()}`;
    try {
      const uploaded = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              ...credentials,
              public_id: key,
              resource_type: 'image',
              format: 'webp',
              overwrite: false,
              timeout: 60000,
            },
            (error, result) => {
              if (error || !result)
                reject(new Error(error?.message ?? 'Missing upload response'));
              else resolve(result);
            },
          );
          stream.on('error', reject);
          stream.end(body);
        },
      );
      if (!uploaded.secure_url?.startsWith('https://') || !uploaded.public_id) {
        await this.discard(key);
        throw new Error('Invalid Cloudinary response');
      }
      return { imageUrl: uploaded.secure_url, key: uploaded.public_id };
    } catch {
      this.logger.error('Cloudinary product image upload failed');
      throw new ServiceUnavailableException(
        'Không tải được ảnh lên Cloudinary, vui lòng thử lại',
      );
    }
  }

  private credentials() {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud_name || !api_key || !api_secret) {
      throw new ServiceUnavailableException('Chưa cấu hình Cloudinary');
    }
    return { cloud_name, api_key, api_secret, secure: true };
  }

  async discard(key: string) {
    try {
      await cloudinary.uploader.destroy(key, {
        ...this.credentials(),
        resource_type: 'image',
        invalidate: true,
      });
    } catch {
      this.logger.error(`Could not discard unlinked Cloudinary image: ${key}`);
    }
  }
}
