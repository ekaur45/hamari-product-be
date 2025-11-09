import { BookingStatus } from "src/modules/shared/enums";

export class PaymentIntentDto {
    url:string;
    id: string;
    amount: number;
    currency: string;
    status: BookingStatus;
    bookingDate: Date;
    teacherId: string;
    studentId: string;
    teacherSubjectId: string;
    availabilityId: string;
}