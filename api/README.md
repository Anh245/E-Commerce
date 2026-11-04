<!-- AUTO-GENERATED -->
## Hướng dẫn riêng cho dự án

Xem [hướng dẫn đóng góp](../docs/CONTRIBUTING.md) để thiết lập môi trường, tra cứu toàn bộ lệnh API và biến môi trường; xem [hướng dẫn vận hành](../docs/RUNBOOK.md) để triển khai. Khi phát triển, dùng `npm run dev`; lệnh `start:dev` trong nội dung mẫu được giữ lại bên dưới không được định nghĩa trong package.json. API mặc định dùng cổng 3000; đặt PORT=3001 khi chạy cùng frontend.

### Tham chiếu đường dẫn API

Được tổng hợp từ các decorator đang sử dụng trong controller và `src/main.ts`. Giao diện Swagger nằm tại `/api/docs`; xem guard của controller và DTO để biết yêu cầu xác thực, vai trò, trường dữ liệu gửi lên và phản hồi.

| Phương thức | Đường dẫn | Mã nguồn |
|---|---|---|
| `POST` | `/api/v1/products/:id/image` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `POST` | `/api/v1/payments/webhook` | [payments-webhook.controller.ts](src/modules/payments/payments-webhook.controller.ts) |
| `GET` | `/api/v1/payments/admin/all` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `GET` | `/api/v1` | [app.controller.ts](src/app.controller.ts) |
| `POST` | `/api/v1/auth/register` | [auth.controller.ts](src/modules/auth/auth.controller.ts) |
| `POST` | `/api/v1/auth/refresh` | [auth.controller.ts](src/modules/auth/auth.controller.ts) |
| `POST` | `/api/v1/auth/login` | [auth.controller.ts](src/modules/auth/auth.controller.ts) |
| `POST` | `/api/v1/auth/logout` | [auth.controller.ts](src/modules/auth/auth.controller.ts) |
| `POST` | `/api/v1/category` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `GET` | `/api/v1/category` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `GET` | `/api/v1/category/:id` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `GET` | `/api/v1/category/slug/:slug` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `PATCH` | `/api/v1/category/:id` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `DELETE` | `/api/v1/category/:id` | [category.controller.ts](src/modules/category/category.controller.ts) |
| `POST` | `/api/v1/orders` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `GET` | `/api/v1/orders/admin/all` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `GET` | `/api/v1/orders` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `GET` | `/api/v1/orders/admin/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `GET` | `/api/v1/orders/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `PATCH` | `/api/v1/orders/admin/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `PATCH` | `/api/v1/orders/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `DELETE` | `/api/v1/orders/admin/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `DELETE` | `/api/v1/orders/:id` | [orders.controller.ts](src/modules/orders/orders.controller.ts) |
| `POST` | `/api/v1/payments/create-intent` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `POST` | `/api/v1/payments/confirm` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `GET` | `/api/v1/payments` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `GET` | `/api/v1/payments/:id` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `GET` | `/api/v1/payments/order/:orderId` | [payments.controller.ts](src/modules/payments/payments.controller.ts) |
| `POST` | `/api/v1/products` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `GET` | `/api/v1/products` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `GET` | `/api/v1/products/:id` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `PATCH` | `/api/v1/products/:id` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `PATCH` | `/api/v1/products/:id/stock` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `DELETE` | `/api/v1/products/:id` | [products.controller.ts](src/modules/products/products.controller.ts) |
| `GET` | `/api/v1/users/me` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `GET` | `/api/v1/users` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `GET` | `/api/v1/users/:id` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `PATCH` | `/api/v1/users/me` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `PATCH` | `/api/v1/users/me/password` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `DELETE` | `/api/v1/users/me` | [users.controller.ts](src/modules/users/users.controller.ts) |
| `DELETE` | `/api/v1/users/:id` | [users.controller.ts](src/modules/users/users.controller.ts) |

Chưa đăng ký controller giỏ hàng; lời gọi `/cart/merge` từ frontend chưa có đường dẫn backend tương ứng.
<!-- /AUTO-GENERATED -->

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
