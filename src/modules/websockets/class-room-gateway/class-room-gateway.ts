import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import { Repository } from "typeorm";
import ClassBooking from "src/database/entities/class-booking.entity";
import TeacherBooking from "src/database/entities/teacher-booking.entity";

@WebSocketGateway({
    namespace: 'class-room',
})
export class ClassRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        @InjectRepository(TeacherBooking)
        private readonly teacherBookingRepository: Repository<TeacherBooking>,
    ) {}
    logger = new Logger('ClassRoomGateway');
    @WebSocketServer()
    server: Server;
    async handleConnection(client: Socket): Promise<void> {
        // get the booking id from the client
        const bookingId = client.handshake.query.bookingId as string;
        if (!bookingId) {
            this.logger.error('Booking ID is required');
            client.disconnect();
            return;
        }
        // get the booking from the database
        const booking = await this.teacherBookingRepository.findOne({ where: { id: bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
        this.logger.warn(`Client connected: ${client.id}`);
        this.server.emit('session-started_'+booking.id, { bookingId: booking.id });
    }
    handleDisconnect(client: Socket): void {
        this.logger.warn(`Client disconnected: ${client.id}`);
    }
    @SubscribeMessage('join-class')
    async joinClass(client: Socket, data: { bookingId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }

    }
    @SubscribeMessage('leave-class')
    async leaveClass(client: Socket, data: { bookingId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
    }
    @SubscribeMessage('get-class-students')
    async getClassStudents(client: Socket, data: { bookingId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
    }
    @SubscribeMessage('student-joined-class')
    async studentJoinedClass(client: Socket, data: { bookingId: string, studentId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId, studentId: data.studentId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
        console.log('student-joined-class_'+booking.id, { bookingId: booking.id, studentId: data.studentId });
        this.server.emit('student-joined-class_'+booking.id, { bookingId: booking.id, studentId: data.studentId });
    }
}