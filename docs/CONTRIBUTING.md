## Thiết lập môi trường phát triển

1. Sử dụng Node.js 24.19.0 và npm để đồng nhất với quy trình CI/CD API và Dockerfile. Cài PostgreSQL riêng; Compose chỉ khai báo dịch vụ API.
2. Chạy `npm ci` riêng trong `api/` và `frontend/`. Thư mục gốc không có package hay lệnh dùng chung cho workspace.
3. Tạo `api/.env` với các biến API trong bảng bên dưới. Tệp này được Git bỏ qua; sao chép các giá trị mẫu từ `api/.env.example` rồi thay bằng cấu hình của bạn. Tệp `.env` cung cấp biến cho Prisma CLI và các đoạn mã đọc môi trường ở cấp module thông qua `dotenv/config`. Nest ConfigModule còn khai báo thứ tự đọc `.env.local` trước `.env`.
4. Trong `api/`, chạy `npx prisma generate`, sau đó chạy `npx prisma migrate dev` với cơ sở dữ liệu phát triển cục bộ. Prisma sử dụng `prisma/schema.prisma` và `prisma/migrations`.
5. Tạo `frontend/.env.local` với các biến frontend trong bảng bên dưới.
6. Chạy `npm run dev` trong `api/`; mở terminal thứ hai và chạy `npm run dev` trong `frontend/`. Đặt `PORT=3001` cho API để tránh hai ứng dụng cùng sử dụng cổng 3000. Nếu không cấu hình, API mặc định dùng cổng 3000.
7. Truy cập cửa hàng tại `http://localhost:3000`, API tại `http://localhost:3001/api/v1` và Swagger tại `http://localhost:3001/api/docs`.

## Các lệnh

| Lệnh (chạy trong `api/`) | Lệnh gốc                                                                                               | Mục đích                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `npm run build`          | `nest build`                                                                                           | Biên dịch API NestJS.                                                |
| `npm run format`         | `prettier --write "src/**/*.ts" "test/**/*.ts"`                                                        | Định dạng src/**/\*.ts và test/**/\*.ts bằng Prettier (ghi vào tệp). |
| `npm run start`          | `nest start`                                                                                           | Biên dịch và khởi động API.                                          |
| `npm run dev`            | `nest start --watch`                                                                                   | Khởi động API ở chế độ theo dõi thay đổi.                            |
| `npm run start:debug`    | `nest start --debug --watch`                                                                           | Khởi động với trình gỡ lỗi và theo dõi thay đổi.                     |
| `npm run start:prod`     | `node dist/src/main`                                                                                   | Chạy điểm khởi động đã biên dịch tại dist/src/main.                  |
| `npm run lint`           | `eslint "{src,apps,libs,test}/**/*.ts" --fix`                                                          | Chạy ESLint và tự động sửa lỗi (ghi vào tệp).                        |
| `npm run lint:ci`        | `eslint "{src,apps,libs,test}/**/*.ts"`                                                                | Chạy ESLint, không tự động sửa lỗi.                                  |
| `npm run test`           | `jest`                                                                                                 | Chạy kiểm thử đơn vị bằng Jest.                                      |
| `npm run test:watch`     | `jest --watch`                                                                                         | Chạy Jest ở chế độ theo dõi thay đổi.                                |
| `npm run test:cov`       | `jest --coverage`                                                                                      | Chạy Jest và thu thập độ bao phủ kiểm thử.                           |
| `npm run test:debug`     | `node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand` | Chạy Jest tuần tự, tạm dừng trình gỡ lỗi Node khi khởi động.         |
| `npm run test:e2e`       | `jest --config ./test/jest-e2e.json`                                                                   | Chạy kiểm thử với cấu hình riêng test/jest-e2e.json.                 |

| Lệnh (chạy trong `frontend/`) | Lệnh gốc     | Mục đích                                                           |
| ----------------------------- | ------------ | ------------------------------------------------------------------ |
| `npm run dev`                 | `next dev`   | Khởi động máy chủ phát triển Next.js.                              |
| `npm run build`               | `next build` | Build ứng dụng Next.js cho môi trường production.                  |
| `npm run start`               | `next start` | Phục vụ bản build production (cần build trước).                    |
| `npm run lint`                | `eslint`     | Chạy ESLint với các quy tắc Next.js Core Web Vitals và TypeScript. |

## Tham chiếu biến môi trường

Các biến mẫu nằm trong `api/.env.example`. Bảng này được tổng hợp từ mã đọc biến khi chạy trong `api/src/main.ts`, `api/src/prisma/prisma.service.ts`, `api/src/modules/auth/`, `api/src/modules/payments/payments.service.ts`, `frontend/services/api/axios.config.ts` và `frontend/components/modules/checkout/StripePaymentProvicder.tsx`.

| Biến                                 | Nơi sử dụng      | Bắt buộc                                            | Định dạng / mục đích / ví dụ                                                                                                                                                      |
| ------------------------------------ | ---------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                       | API / Prisma CLI | Có                                                  | URL kết nối PostgreSQL, ví dụ `postgresql://user:password@localhost:5432/ecommerce`; mã hóa URL cho thông tin đăng nhập.                                                          |
| `STRIPE_SECRET_KEY`                  | API              | Có                                                  | Khóa bí mật Stripe; dùng khóa thử nghiệm (`sk_test_...`) khi phát triển cục bộ. Dịch vụ thanh toán được khởi tạo ngay khi ứng dụng khởi động.                                     |
| `CLOUDINARY_CLOUD_NAME` | API | Có khi tải ảnh | Lấy từ Cloudinary Console; chỉ cấu hình ở backend. |
| `CLOUDINARY_API_KEY` | API | Có khi tải ảnh | Lấy từ Cloudinary Console; chỉ cấu hình ở backend. |
| `CLOUDINARY_API_SECRET` | API | Có khi tải ảnh | Lấy từ Cloudinary Console; chỉ cấu hình ở backend. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Frontend (khi build) | Có để hiển thị ảnh Cloudinary | Cùng cloud name với backend; không chứa API key hay secret. |
| `PRODUCT_IMAGES_BASE_URL` | Frontend (khi build) | Không | Chỉ giữ nếu còn URL ảnh S3/CDN cũ cần hiển thị. |
| `STRIPE_WEBHOOK_SECRET` | API | Có để nhận webhook | Secret ký webhook từ Stripe (`whsec_...`), dùng cho `/api/v1/payments/webhook`. |
| `JWT_SECRET`                         | API              | Cần đặt khi chạy ngoài môi trường phát triển cục bộ | Chuỗi bí mật không rỗng, dùng cho cả access token và refresh token. Giá trị dự phòng trong mã là `dev-secret-change-me`.                                                          |
| `JWT_EXPIRES_IN`                     | API              | Không                                               | Thời hạn mặc định của module JWT, ví dụ `15m`; giá trị dự phòng là chuỗi `900`. Mã tạo token đặt trực tiếp `15m` cho access token và `7d` cho refresh token, ghi đè mặc định này. |
| `PORT`                               | API              | Không                                               | Cổng TCP; mặc định `3000`, dùng `3001` khi chạy cùng frontend.                                                                                                                    |
| `ALLOWED_ORIGINS`                    | API              | Không                                               | Danh sách origin được phép, phân cách bằng dấu phẩy. Mặc định: `http://localhost:3000,http://localhost:3001`.                                                                     |
| `API_PUBLIC_URL`                     | API              | Không                                               | URL máy chủ hiển thị trong Swagger; mặc định `http://localhost:3000`, ví dụ cục bộ `http://localhost:3001`.                                                                       |
| `NODE_ENV`                           | API              | Không                                               | Giá trị `development` bật log query/info/warn/error của Prisma; các giá trị khác chỉ ghi lỗi. Docker đặt `production`.                                                            |
| `NEXT_PUBLIC_API_URL`                | Frontend         | Có để kết nối đúng API                              | URL gốc có kèm tiền tố chung, ví dụ `http://localhost:3001/api/v1`; không có giá trị dự phòng trong cấu hình.                                                                     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Frontend         | Có khi thanh toán                                   | Khóa công khai tương ứng với tài khoản và chế độ Stripe của API, ví dụ `pk_test_...`.                                                                                             |

Quy trình CI/CD còn xuất các biến `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT` và `JWT_REFRESH_SECRET`. Mã API đọc chuỗi kết nối đầy đủ từ `DATABASE_URL` và dùng `JWT_SECRET` để xác minh refresh token. Compose còn khai báo `JWT_REFRESH_EXPIRES_IN`; mã xác thực hiện tại không đọc cả hai biến dành riêng cho refresh token. Truyền khóa công khai Stripe vào container API không cấu hình frontend được build riêng.

## Kiểm thử và quy chuẩn mã nguồn

- Kiểm thử đơn vị của API nằm trong các tệp `*.spec.ts`. Jest dùng ts-jest, môi trường Node và ánh xạ import `src/` trong `api/package.json`. Đặt kiểm thử cạnh service/controller liên quan và mô phỏng các phụ thuộc bên ngoài khi kiểm thử đơn vị.
- Chạy `npm run lint:ci`, `npm test -- --runInBand` và `npm run build` trong `api/`. CI chạy lint, `npm test` và `npm audit --audit-level=critical` sau khi cài thư viện và tạo Prisma Client.
- Kiểm thử e2e của API nằm trong `test/*.e2e-spec.ts`; chạy `npm run test:e2e` khi đã cấu hình cơ sở dữ liệu và khóa Stripe. Kiểm thử hiện có import AppModule và khởi tạo các dịch vụ cơ sở dữ liệu/thanh toán. Kiểm thử gọi `/` vì không thực thi phần thiết lập tiền tố chung trong `main.ts`.
- Chạy `npm run lint` và `npm run build` trong `frontend/`. Frontend chưa định nghĩa lệnh kiểm thử. Kiểm tra các luồng cửa hàng/quản trị bị thay đổi trên trình duyệt.
- ESLint của API tích hợp Prettier và bỏ qua `src/generated/**`; `npm run format` và `npm run lint` ghi các chỉnh sửa vào tệp. ESLint của frontend dùng bộ quy tắc Next.js Core Web Vitals và TypeScript. Kho mã chưa có cấu hình hook pre-commit được Git theo dõi.

## Danh sách kiểm tra khi gửi pull request

- Chạy các lệnh lint, build và kiểm thử phù hợp ở trên; ghi lại lỗi hoặc dịch vụ còn thiếu.
- Bổ sung migration khi schema Prisma thay đổi và tạo lại Prisma Client.
- Cập nhật bảng biến môi trường và tham chiếu đường dẫn API khi mã nguồn tương ứng thay đổi.
- Mô tả thay đổi hành vi người dùng nhìn thấy và cách đã kiểm chứng; không đưa khóa thật hay tệp môi trường cục bộ vào bản diff.
- Đọc [hướng dẫn vận hành](RUNBOOK.md) để nắm các giới hạn triển khai trước khi đề xuất thay đổi phát hành.
