## Quy trình triển khai

1. Chạy các bước kiểm tra API trong [hướng dẫn đóng góp](CONTRIBUTING.md). Quy trình CI/CD được kích hoạt khi push lên `main` hoặc chạy thủ công bằng `workflow_dispatch`; bước triển khai chờ CI hoàn tất.
2. Cấu hình các secret của quy trình: `AWS_OIDC_ROLE_ARN`, `AWS_REGION`, `ECR_REPOSITORY`, `EC2_HOST`, `EC2_USER` và `EC2_KEY`. `ECR_REPOSITORY` được dùng làm URI kho image, không kèm tag. Máy EC2 cần Docker, AWS CLI, jq và quyền truy cập ECR, Secrets Manager cùng nhóm log CloudWatch đã cấu hình.
3. Điền các biến môi trường mà quy trình xuất vào mục `nestjs-prod-secrets` trong Secrets Manager. Xem [tham chiếu biến môi trường](CONTRIBUTING.md#tham-chiếu-biến-môi-trường) để biết nơi sử dụng từng biến. Script SSH dùng `AWS_REGION` của workflow khi lấy secret.
4. Build và kiểm tra image từ thư mục gốc bằng `docker build -t e-commerce-store:latest ./api`. Dockerfile tạo Prisma Client, build API, cài thư viện cho môi trường production, chạy bằng người dùng `nodejs` thông qua dumb-init và khởi động `dist/src/main.js`.
5. Rà soát các điểm thiếu nhất quán bên dưới trước khi phát hành. Quy trình chưa có bước migration; áp dụng migration còn thiếu trong môi trường phát hành được kiểm soát bằng `npx prisma migrate deploy` từ `api/`, với `DATABASE_URL` đúng mục tiêu. Trước tiên, kiểm tra khả năng tương thích schema với cả phiên bản đang chạy và phiên bản dự kiến khôi phục.
6. Kích hoạt quy trình. Quy trình đẩy tag `latest` lên ECR, kết nối SSH, tải image, nạp và kiểm tra các secret mới, sau đó dừng/xóa `e-commerce-store` và chạy container thay thế với `-p $PORT:$PORT`. Việc thay thế gây gián đoạn dịch vụ; chưa cấu hình triển khai luân phiên.
7. Kiểm tra container, endpoint kiểm tra cơ bản, Swagger và các yêu cầu đại diện có xác thực hoặc truy cập cơ sở dữ liệu như mô tả bên dưới. Quy trình chưa có bước kiểm tra sức khỏe sau triển khai.
8. Build frontend riêng với các biến môi trường công khai của frontend: trong `frontend/`, chạy `npm ci`, `npm run build` và `npm run start`. Quy trình hiện tại chỉ triển khai API; chưa cấu hình đích triển khai frontend.

## Kiểm tra sức khỏe và giám sát

- API đang chạy: `GET /api/v1` trả về `Hello World!` từ AppController/AppService. Khi chạy cục bộ với `PORT=3001`, dùng `curl http://localhost:3001/api/v1`. Đây là kiểm tra phản hồi cơ bản của ứng dụng; endpoint chưa kiểm tra riêng mức sẵn sàng của các dịch vụ phụ thuộc.
- Giao diện Swagger: `/api/docs`; tiền tố chung của các đường dẫn API là `/api/v1`.
- Trên EC2, dùng `docker ps --filter name=e-commerce-store` và `docker logs --tail 100 e-commerce-store` để kiểm tra lỗi khởi động. Hàm khởi động ghi `Error starting server` và thoát khi lỗi; Prisma ghi thông báo kết nối cơ sở dữ liệu lúc khởi tạo.
- Quy trình gửi log container đến nhóm CloudWatch Logs `ecommerceapi-app`, luồng `app-log`, tại `AWS_REGION` bằng driver awslogs. Kiểm tra nhóm log và quyền truy cập đã tồn tại.
- Kho mã chưa có controller kiểm tra sức khỏe riêng, Docker HEALTHCHECK, định nghĩa cảnh báo, kênh thông báo, người tiếp nhận sự cố hay lịch trực. Người phụ trách triển khai cần bổ sung các thông tin vận hành này.

## Các vấn đề đã biết và cách kiểm tra

| Hiện tượng / điểm thiếu nhất quán                        | Bằng chứng từ mã nguồn và hướng xử lý                                                                                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trùng cổng khi chạy cục bộ                               | API và Next.js cùng mặc định dùng cổng 3000. Đặt `PORT=3001` cho API và `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` cho frontend.                                                                                 |
| Thiếu biến thiết lập | Sao chép `api/.env.example`, thay giá trị mẫu và kiểm tra kết nối cơ sở dữ liệu cùng khóa Stripe của API. |
| Trình duyệt bị CORS từ chối                              | So sánh origin của trình duyệt với danh sách `ALLOWED_ORIGINS` phân cách bằng dấu phẩy trong `main.ts`. Compose truyền biến `ALLOWED_ORIGINS` đúng tên mà ứng dụng đọc.                                   |
| Cấu hình Compose | Compose ánh xạ cùng cổng PORT ở host và container (mặc định 3001), dùng DATABASE_PASSWORD và đặt restart ở cấp dịch vụ. Kiểm tra cấu hình trước triển khai. |
| Cổng khai báo trong image khác cổng ứng dụng lắng nghe   | Dockerfile khai báo cổng 3001 nhưng ứng dụng mặc định dùng 3000; quy trình ánh xạ PORT tới cùng cổng trong container. Đặt PORT rõ ràng và kiểm tra đúng cổng đó.                                                         |
| Lỗi cơ sở dữ liệu sau phát hành                          | Quy trình chưa có bước migration. Dùng `npx prisma migrate status` trong môi trường phát hành để kiểm tra trước khi quyết định áp dụng migration còn thiếu.                                                              |
| Thay đổi secret/thời hạn refresh token không có tác dụng | Mã tạo token hiện dùng JWT_SECRET với thời hạn cố định 15m/7d; không đọc JWT_REFRESH_SECRET và JWT_REFRESH_EXPIRES_IN.                                                                                                   |
| Build image lỗi ở bước sao chép Prisma                   | Dockerfile sao chép `node_modules/.prisma` và `node_modules/@prisma`; kiểm tra các thư mục được sinh này có tồn tại trong giai đoạn builder.                                                                             |
| Đăng nhập ECR trên EC2 thất bại | Cả job build và script SSH lấy địa chỉ registry từ ECR_REPOSITORY. Kiểm tra region và quyền của máy chủ. |
| Driver CloudWatch khiến container không khởi động        | Kiểm tra region, nhóm log và quyền ghi log của máy chủ.                                                                                                                                                                  |
| Gộp giỏ hàng trả về 404 | AppModule chưa có module giỏ hàng; luồng tạo đơn hiện gửi trực tiếp các dòng hàng, không còn gọi `/cart/merge`. |

## Khôi phục phiên bản trước

Chưa cấu hình khôi phục tự động hoặc tag phát hành bất biến. Trước triển khai, ghi lại ID/digest của image đang chạy, giữ lại image có thể sử dụng và lưu cấu hình thực tế một cách bảo mật. Quy trình ghi đè tag `latest` và xóa container cũ.

Nếu bản phát hành lỗi, người phụ trách triển khai cần chọn image trước đó đã giữ lại và tạo lại `e-commerce-store` với cùng biến môi trường, ánh xạ cổng và tùy chọn log như quy trình. Kiểm tra `/api/v1`, xác thực và các yêu cầu truy cập cơ sở dữ liệu sau khi thay thế. Chạy lại quy trình sẽ triển khai mã nguồn hiện tại/`latest`, không cho phép chọn phiên bản cũ để khôi phục. Việc phục hồi cơ sở dữ liệu hoặc tạo migration sửa lỗi cần được quyết định riêng dựa trên khả năng tương thích schema và bản sao lưu hiện có; kho mã chưa định nghĩa quy trình sao lưu/phục hồi cơ sở dữ liệu.

## Rà soát độ mới của tài liệu

Tính đến ngày 04/11/2026, chưa có tài liệu ứng dụng hiện có nào đạt 90 ngày kể từ lần sửa cuối trong Git: README gốc và README API được cập nhật ngày 11/08/2026 (85 ngày), README frontend ngày 07/09/2026 (58 ngày), Design.md ngày 29/09/2026 (36 ngày). Đợt rà soát này không bao gồm hướng dẫn cho agent và tài liệu skill đi kèm.

Nội dung mẫu cũ được giữ lại vẫn cần rà soát thủ công: README API hướng dẫn dùng lệnh `start:dev` không tồn tại; README frontend hướng dẫn sửa `app/page.tsx` trong khi trang cửa hàng nằm tại `app/(landing)/page.tsx`. Các thay đổi mã nguồn đến ngày 03/10/2026 diễn ra sau lần cập nhật của cả hai README mẫu. Phần ghi chú được tạo trong README và hướng dẫn đóng góp cung cấp chỉ dẫn hiện hành, đồng thời bảo toàn nội dung viết tay.


## Ảnh sản phẩm trong biểu mẫu quản trị

Admin chọn **Thêm sản phẩm** hoặc nút sửa trên dòng sản phẩm. Ảnh là thông tin bắt buộc khi thêm mới; khi sửa có thể giữ ảnh cũ hoặc chọn ảnh thay thế. Các trường và tệp ảnh được gửi chung trong một request multipart đến `POST /api/v1/products` hoặc `PATCH /api/v1/products/:id`. API cũng cung cấp `POST /api/v1/products/:id/image` để thay riêng ảnh khi cần tích hợp khác. Tất cả các thao tác ghi đều yêu cầu quyền ADMIN.

API nhận trường tệp `file`, giới hạn 5 MB, kiểm tra nội dung thực bằng sharp, chỉ nhận JPEG/PNG/WebP tĩnh tối đa 20 triệu điểm ảnh, tự xoay và thu nhỏ trong khung 1600 × 1600 rồi chuyển WebP. Cloudinary public_id là `products/<UUID>`; ảnh phân phối ở định dạng WebP. Khi tải ảnh lỗi, chưa ghi sản phẩm; khi ghi cơ sở dữ liệu lỗi sau upload, API cố gắng xóa ảnh Cloudinary vừa tải lên. Khi sửa mà không chọn ảnh, URL ảnh cũ được giữ lại.

### Thiết lập Cloudinary sau deploy

1. Tạo hoặc chọn product environment trong Cloudinary Console. Lấy cloud name, API key và API secret.
2. Cấu hình backend với `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET`. Với EC2, thêm ba giá trị vào secret `nestjs-prod-secrets`; workflow kiểm tra và truyền chúng vào container. Khi chạy Compose, điền biến tương ứng trong tệp môi trường. API secret chỉ ở backend, không đưa vào mã frontend hay image Docker.
3. Khi build frontend, đặt `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` bằng cloud name của backend. Next Image chỉ cho phép `https://res.cloudinary.com/<cloud-name>/image/upload/**`. Không cần biến public chứa API key hoặc API secret.
4. Kiểm tra thêm sản phẩm có ảnh, sửa kèm ảnh mới, sửa không thay ảnh, tải lại trang và redeploy. API upload có xác thực qua Cloudinary Node.js SDK bằng `upload_stream`, lưu `secure_url` vào Product.imageUrl và dùng `public_id` trả về để dọn ảnh khi ghi DB thất bại. Không cần unsigned upload preset hoặc quyền S3 cho ảnh mới.
5. Các URL ảnh cũ trong DB không bị thay đổi. Nếu vẫn dùng ảnh từ S3/CDN cũ, giữ `PRODUCT_IMAGES_BASE_URL` ở frontend để cho phép origin cũ. Chưa di chuyển hoặc xóa dữ liệu S3; nếu ngừng dịch vụ cũ trước khi di chuyển ảnh thì URL cũ sẽ hỏng.

Ảnh mới lưu trên Cloudinary độc lập với container. Vẫn dùng sharp để xác thực nội dung, giới hạn số điểm ảnh và chuyển WebP trước upload. Nếu upload lỗi thì không ghi sản phẩm; nếu DB lỗi sau upload thì gọi destroy với đúng public_id của ảnh mới. Lỗi dọn ảnh được ghi log, không che lỗi lưu sản phẩm ban đầu. Ảnh cũ khi thay thế chưa được tự động xóa; cần đối chiếu các URL đang được sử dụng trước khi dọn. Chưa có tác vụ dọn ảnh mồ côi khi tiến trình dừng đột ngột.

Cloudinary tính mức sử dụng theo gói; theo dõi dung lượng lưu, biến đổi và phân phối trong Console. Tham khảo [SDK Node.js](https://cloudinary.com/documentation/node_image_and_video_upload) và [các gói dịch vụ](https://cloudinary.com/pricing). Thư viện upload không tự lưu bền vững; Cloudinary là dịch vụ lưu và phân phối ảnh trong tích hợp này.

## Xác nhận và thử lại thanh toán Stripe

- Đơn hàng chốt giá từ Product trong cơ sở dữ liệu, dùng Decimal và giữ tồn kho bằng cập nhật có điều kiện trong transaction. Giá gửi từ client không được dùng. Chỉ hỗ trợ USD trong luồng này; tổng đơn tối thiểu 0.50 USD.
- Một Payment tương ứng một đơn hàng. Thử lại dùng cùng PaymentIntent và khóa idempotency theo Payment ID. Nếu bản ghi chưa lưu được Stripe ID sau hơn 23 giờ, API dừng tạo lại và yêu cầu đối soát để tránh vượt thời gian lưu idempotency của Stripe.
- Client giữ ID đơn trong phiên trình duyệt để thử lại cùng đơn khi yêu cầu tạo PaymentIntent thất bại. Backend chỉ cho thanh toán đơn của người dùng đang đăng nhập, còn PENDING; phản hồi trả tổng tiền từ máy chủ để hiển thị.
- Cấu hình endpoint Stripe `POST https://<api-host>/api/v1/payments/webhook`, nhận sự kiện `payment_intent.succeeded`. Đặt signing secret vào `STRIPE_WEBHOOK_SECRET`; API kiểm tra chữ ký trên raw body. Không dùng access token JWT cho webhook.
- Callback client và webhook dùng chung bước kiểm tra Stripe ID, metadata, số tiền đã nhận và tiền tệ; Payment, Order và Cart được cập nhật trong cùng transaction. Gửi lặp sự kiện hoặc xác nhận lại không đưa đơn về trạng thái trước đó. URL trở về là `/checkout/return`; trang chỉ báo thành công sau xác nhận từ backend.
- Danh sách của người mua dùng `GET /api/v1/payments`; admin dùng `GET /api/v1/payments/admin/all`. Frontend đọc mảng từ trường `data` của phản hồi.
- Đơn đã có bản ghi thanh toán cần người vận hành xử lý khi hủy; API chặn hủy trực tiếp để tránh hoàn tồn kho trong khi Stripe đang thu tiền. Chưa có luồng hoàn tiền, hủy PaymentIntent tự động hoặc tự hết hạn giữ tồn kho. Với lỗi đối soát, kiểm tra Dashboard Stripe và trạng thái DB trước khi can thiệp; không tạo thanh toán mới một cách mù quáng.
- PaymentIntent cũ tạo trước bản sửa có thể thiếu `metadata.paymentId`; cần đối soát riêng thay vì coi đó là thanh toán hợp lệ theo luồng mới.

Tham khảo [PaymentIntents](https://docs.stripe.com/payments/payment-intents), [idempotency](https://docs.stripe.com/api/idempotent_requests) và [kiểm tra webhook](https://docs.stripe.com/events/manage-webhook-endpoints).

<!-- /AUTO-GENERATED -->
