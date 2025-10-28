import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApiResponseModel } from '../shared/models/api-response.model';
import Payment from '../../database/entities/payment.entity';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '../shared/enums';

@ApiTags('Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment created successfully',
    type: ApiResponseModel,
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Payment>> {
    const payment = await this.paymentService.createPayment(
      createPaymentDto,
      req.user.id,
    );
    return ApiResponseModel.success(payment, 'Payment created successfully');
  }

  @Get()
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'method', enum: PaymentMethod, required: false })
  @ApiQuery({ name: 'classId', type: 'string', required: false })
  @ApiQuery({ name: 'enrollmentId', type: 'string', required: false })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: ApiResponseModel,
  })
  async getPayments(
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('classId') classId?: string,
    @Query('enrollmentId') enrollmentId?: string,
  ): Promise<ApiResponseModel<Payment[]>> {
    const payments = await this.paymentService.getPayments({
      status,
      method,
      classId,
      enrollmentId,
    });
    return ApiResponseModel.success(
      payments,
      'Payments retrieved successfully',
    );
  }

  @Get('my-payments')
  @ApiResponse({
    status: 200,
    description: 'User payments retrieved successfully',
    type: ApiResponseModel,
  })
  async getMyPayments(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Payment[]>> {
    const payments = await this.paymentService.getUserPayments(req.user.id);
    return ApiResponseModel.success(
      payments,
      'User payments retrieved successfully',
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: ApiResponseModel,
  })
  async getPaymentById(
    @Param('id') id: string,
  ): Promise<ApiResponseModel<Payment>> {
    const payment = await this.paymentService.getPaymentById(id);
    return ApiResponseModel.success(payment, 'Payment retrieved successfully');
  }

  @Post(':id/complete')
  @ApiResponse({
    status: 200,
    description: 'Payment completed successfully',
    type: ApiResponseModel,
  })
  async completePayment(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Payment>> {
    const payment = await this.paymentService.completePayment(id, req.user.id);
    return ApiResponseModel.success(payment, 'Payment completed successfully');
  }

  @Post(':id/refund')
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: ApiResponseModel,
  })
  async refundPayment(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<Payment>> {
    const payment = await this.paymentService.refundPayment(id, req.user.id);
    return ApiResponseModel.success(payment, 'Payment refunded successfully');
  }

  @Get('statistics/summary')
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
    type: ApiResponseModel,
  })
  async getPaymentStatistics(
    @Request() req: { user: { id: string } },
  ): Promise<ApiResponseModel<any>> {
    const statistics = await this.paymentService.getPaymentStatistics(
      req.user.id,
    );
    return ApiResponseModel.success(
      statistics,
      'Payment statistics retrieved successfully',
    );
  }
}
