import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import BookPaymentLog from "src/database/entities/bookpayment-log.entity";
import TeacherBooking from "src/database/entities/teacher-booking.entity";
import { BookingStatus } from "src/modules/shared/enums";
import Stripe from "stripe";
import { Repository } from "typeorm";

@Injectable()
export default class PaymentService {
    constructor(
        @InjectRepository(BookPaymentLog)
        private readonly bookPaymentLogRepository: Repository<BookPaymentLog>,

        @InjectRepository(TeacherBooking)
        private readonly teacherBookingRepository: Repository<TeacherBooking>,
    ) { }

    async processCheckoutSession(session: Stripe.Checkout.Session) {
        const sessionId = session.id;
        const bookPaymentLog = await this.bookPaymentLogRepository.findOne({
            where: {
                transactionId: sessionId,
            },
        });
        if (!bookPaymentLog) {
            throw new BadRequestException('Book payment log not found');
        }
        bookPaymentLog.status = 'paid';
        bookPaymentLog.processedAt = new Date();
        await this.bookPaymentLogRepository.save(bookPaymentLog);
        const teacherBooking = await this.teacherBookingRepository.findOne({
            where: {
                id: bookPaymentLog.bookingId,
            },
        });
        if (!teacherBooking) {
            throw new BadRequestException('Teacher booking not found');
        }
        teacherBooking.status = BookingStatus.COMPLETED;
        teacherBooking.updatedAt = new Date();
        await this.teacherBookingRepository.save(teacherBooking);
    }
}
