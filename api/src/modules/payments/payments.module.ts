import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';

@Module({
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
