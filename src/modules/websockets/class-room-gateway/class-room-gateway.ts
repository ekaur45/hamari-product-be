import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import { Repository } from "typeorm";
import ClassBooking from "src/database/entities/class-booking.entity";
import TeacherBooking from "src/database/entities/teacher-booking.entity";

@WebSocketGateway({
    namespace: 'class-room',
})
export class ClassRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    rooms: { [roomId: string]: string[] } = {};
    constructor(
        @InjectRepository(TeacherBooking)
        private readonly teacherBookingRepository: Repository<TeacherBooking>,
    ) { }
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
        this.server.emit('session-started_' + booking.id, { bookingId: booking.id });
    }
    handleDisconnect(client: Socket): void {
        this.logger.warn(`Client disconnected: ${client.id}`);
    }
    @SubscribeMessage('join-class')
    async joinClass(client: Socket, data: { bookingId: string, userId: string }): Promise<void> {
        this.logger.warn(`Client joined class: ${client.id}`);
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
        this.logger.warn(`User is already in the room: ${client.id}`);
        const { userId } = data;
        const roomId = "class_" + booking.id;
        client.join(roomId);

        if (!this.rooms[roomId]) this.rooms[roomId] = [];
        if (this.rooms[roomId].includes(userId)) {
            // remove the user from the room
            this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== userId);
        };
        this.rooms[roomId].push(userId);

        // Notify other users in the room
        client.to(roomId).emit('join-class_' + booking.id, { userId });
        //client.to(roomId).emit('userJoined', { userId });

    }
    @SubscribeMessage('leave-class')
    async leaveClass(client: Socket, data: { bookingId: string, userId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
        const { userId } = data;
        const roomId = "class_" + booking.id;
        client.leave(roomId);

        if (!this.rooms[roomId]) this.rooms[roomId] = [];
        if (this.rooms[roomId].includes(userId)) {
            // remove the user from the room
            this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== userId);
        };
        this.rooms[roomId].push(userId);

        // Notify other users in the room
        client.to(roomId).emit('leave-class_' + booking.id, { userId });
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
        this.server.emit('student-joined-class_' + booking.id + '_' + data.studentId, { bookingId: booking.id, studentId: data.studentId });
    }
    @SubscribeMessage('teacher-joined-class')
    async teacherJoinedClass(client: Socket, data: { bookingId: string, teacherId: string }): Promise<void> {
        const booking = await this.teacherBookingRepository.findOne({ where: { id: data.bookingId, teacherId: data.teacherId } });
        if (!booking) {
            this.logger.error('Booking not found');
            client.disconnect();
            return;
        }
        this.server.emit('teacher-joined-class_' + booking.id + '_' + data.teacherId, { bookingId: booking.id, teacherId: data.teacherId });
    }


    @SubscribeMessage('join')
    handleJoinRoom(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() client: Socket) {        
        const { roomId, userId } = data;
        client.join(roomId);

        if (!this.rooms[roomId]) this.rooms[roomId] = [];
        if (this.rooms[roomId].includes(userId)) {
            // remove the user from the room
            this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== userId);
            return;
        };
        this.rooms[roomId].push(userId);

        // Notify other users in the room
        client.to(roomId).emit('userJoined', { userId });
    }

    @SubscribeMessage('leave')
    handleLeaveRoom(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() client: Socket) {
        const { roomId, userId } = data;
        client.leave(roomId);

        if (!this.rooms[roomId]) this.rooms[roomId] = [];
        this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== userId);

        // Notify other users in the room
        client.to(roomId).emit('userLeft', { userId });
    }

    @SubscribeMessage('signal')
    handleSignal(@MessageBody() data: { bookingId: string, userId: string; signal: any }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('signal', { signal: data.signal, userId: data.userId });
    }

    @SubscribeMessage('mute')
    handleMute(@MessageBody() data: { bookingId: string, userId: string; isMuted: boolean }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('mute', { userId: data.userId, isMuted: data.isMuted });
    }

    @SubscribeMessage('unmute')
    handleUnmute(@MessageBody() data: { bookingId: string, userId: string; isMuted: boolean }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('unmute', { userId: data.userId, isMuted: data.isMuted });
    }
    @SubscribeMessage('mute-video')
    handleVideoOn(@MessageBody() data: { bookingId: string, userId: string; isVideoOn: boolean }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('mute-video', { userId: data.userId, isVideoOn: data.isVideoOn });
    }
    @SubscribeMessage('unmute-video')
    handleVideoOff(@MessageBody() data: { bookingId: string, userId: string; isVideoOn: boolean }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('unmute-video', { userId: data.userId, isVideoOn: data.isVideoOn });
    }

    @SubscribeMessage('end-call')
    handleEndCall(@MessageBody() data: { bookingId: string, userId: string }, @ConnectedSocket() client: Socket) {
        const roomId = "class_" + data.bookingId;
        client.to(roomId).emit('call-ended', { userId: data.userId });
    }
}