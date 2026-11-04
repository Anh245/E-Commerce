import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import { Writable } from 'node:stream';
import sharp from 'sharp';
import {
  ProductImagesService,
  MAX_PRODUCT_IMAGE_BYTES,
} from './product-images.service';

jest.mock('cloudinary', () => ({
  v2: { uploader: { upload_stream: jest.fn(), destroy: jest.fn() } },
}));

describe('ProductImagesService', () => {
  let service: ProductImagesService;
  let options: UploadApiOptions;
  let uploadedBody: Buffer;
  const upload = jest.mocked(cloudinary.uploader.upload_stream);
  const destroy = jest.mocked(cloudinary.uploader.destroy);
  const originalEnv = { ...process.env };
  const file = (buffer: Buffer) =>
    ({
      buffer,
      size: buffer.length,
      mimetype: 'image/png',
      originalname: 'untrusted.png',
    }) as Express.Multer.File;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = 'qa-cloud';
    process.env.CLOUDINARY_API_KEY = 'qa-key';
    process.env.CLOUDINARY_API_SECRET = 'qa-secret';
    upload.mockImplementation((config, callback) => {
      options = config!;
      return new Writable({
        write(chunk: Buffer, _encoding, done) {
          uploadedBody = chunk;
          done();
        },
        final(done) {
          callback?.(undefined, {
            secure_url:
              'https://res.cloudinary.com/qa-cloud/image/upload/v1/products/test.webp',
            public_id: 'products/test',
          });
          done();
        },
      }) as ReturnType<typeof cloudinary.uploader.upload_stream>;
    });
    destroy.mockResolvedValue({ result: 'ok' });
    service = new ProductImagesService();
  });
  afterAll(() => {
    process.env = originalEnv;
  });
  it('decodes an image, uploads WebP to Cloudinary and returns its secure URL and public ID', async () => {
    const buffer = await sharp({
      create: { width: 32, height: 32, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    const result = await service.upload(file(buffer));
    expect(upload).toHaveBeenCalledTimes(1);
    expect(options.resource_type).toBe('image');
    expect(options.cloud_name).toBe('qa-cloud');
    expect(options.public_id?.startsWith('products/')).toBe(true);
    expect((await sharp(uploadedBody).metadata()).format).toBe('webp');
    expect(result.imageUrl).toBe(
      'https://res.cloudinary.com/qa-cloud/image/upload/v1/products/test.webp',
    );
    expect(result.key).toBe('products/test');
  });
  it('rejects fake image contents even with an allowed MIME and extension', async () => {
    await expect(
      service.upload(file(Buffer.from('<script>not an image</script>'))),
    ).rejects.toThrow('Ảnh không hợp lệ');
    expect(upload).not.toHaveBeenCalled();
  });
  it('rejects missing and oversized images', async () => {
    await expect(service.upload(undefined)).rejects.toThrow('5 MB');
    await expect(
      service.upload(file(Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1))),
    ).rejects.toThrow('5 MB');
    expect(upload).not.toHaveBeenCalled();
  });
  it('rejects SVG content even when sharp can decode it', async () => {
    await expect(
      service.upload(
        file(
          Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" /></svg>',
          ),
        ),
      ),
    ).rejects.toThrow('Ảnh không hợp lệ');
  });
  it('fails clearly when storage is unconfigured', async () => {
    delete process.env.CLOUDINARY_API_SECRET;
    await expect(service.upload(file(Buffer.from('test')))).rejects.toThrow(
      'Chưa cấu hình',
    );
    expect(upload).not.toHaveBeenCalled();
  });
  it('cleans up an uploaded image using its exact public ID', async () => {
    await service.discard('products/test');
    expect(destroy).toHaveBeenCalledWith(
      'products/test',
      expect.objectContaining({ api_secret: 'qa-secret', invalidate: true }),
    );
  });
  it('reports upload failure without returning a URL', async () => {
    upload.mockImplementationOnce(() => {
      throw new Error('network failed');
    });
    const buffer = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    await expect(service.upload(file(buffer))).rejects.toThrow(
      'Không tải được ảnh',
    );
  });
  it('does not mask a persistence error if cleanup fails', async () => {
    destroy.mockRejectedValueOnce(new Error('Cloudinary unavailable'));
    await expect(service.discard('products/test')).resolves.toBeUndefined();
  });
});
