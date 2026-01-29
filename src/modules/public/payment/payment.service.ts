import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import BookPaymentLog from "src/database/entities/bookpayment-log.entity";
import TeacherBooking from "src/database/entities/teacher-booking.entity";
import { BookingStatus, NotificationType } from "src/modules/shared/enums";
import { NotificationService } from "src/modules/shared/notification/notification.service";
import Stripe from "stripe";
import { Repository } from "typeorm";

@Injectable()
export default class PaymentService {
    constructor(
        @InjectRepository(BookPaymentLog)
        private readonly bookPaymentLogRepository: Repository<BookPaymentLog>,

        @InjectRepository(TeacherBooking)
        private readonly teacherBookingRepository: Repository<TeacherBooking>,

        private readonly notificationService: NotificationService,
    ) { }

    async processCheckoutSession(session: Stripe.Checkout.Session) {
        const sessionId = session.id;
        const bookPaymentLog = await this.bookPaymentLogRepository.findOne({
            where: {
                transactionId: sessionId,
            },
            relations: ['booking','booking.student','booking.student.user','booking.student.user.details','booking.teacher','booking.teacher.user','booking.teacher.user.details','booking.teacherSubject','booking.teacherSubject.subject'],
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
        teacherBooking.status = BookingStatus.CONFIRMED;
        teacherBooking.updatedAt = new Date();
        await this.teacherBookingRepository.save(teacherBooking);
        await this.notificationService.createNotification(bookPaymentLog.booking.student.user, {
            type: NotificationType.BOOKING_CONFIRMED,
            title: 'Booking confirmed',
            message: 'Your booking has been confirmed',
            redirectPath: '/student/schedule',
            redirectParams: { bookingId: bookPaymentLog.bookingId },
            user: bookPaymentLog.booking.student.user,
        });
        await this.notificationService.createNotification(bookPaymentLog.booking.teacher.user, {
            type: NotificationType.BOOKING_CONFIRMED,
            title: 'Booking confirmed',
            message: `<span class="font-bold">${bookPaymentLog.booking.student.user.firstName + ' ' + bookPaymentLog.booking.student.user.lastName}</span> 
            has booked your <span class="font-bold">${bookPaymentLog.booking.teacherSubject.subject.name}</span>
            on <span class="font-bold">${bookPaymentLog.booking.bookingDate.toLocaleDateString()}</span>`,
            redirectPath: '/teacher/schedule',
            redirectParams: { bookingId: bookPaymentLog.bookingId },
            user: bookPaymentLog.booking.teacher.user,
        });

    }
}
