import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

import { PaymentService } from './payment.service';
import { ApiResponseModel } from '../shared/models/api-response.model';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import User from 'src/database/entities/user.entity';

@ApiTags('Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
    type: ApiResponseModel<PaymentIntentDto>,
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req: { user: User },
  ): Promise<ApiResponseModel<PaymentIntentDto>> {
    const paymentIntent = await this.paymentService.createPaymentIntent(createPaymentIntentDto, req.user);
    return ApiResponseModel.success(paymentIntent, 'Payment intent created successfully');
  }
}
