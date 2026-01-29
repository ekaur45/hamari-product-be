import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    logger = new Logger('ChatGateway');
    @WebSocketServer()
    server: Server;
    handleConnection(client: Socket): void {
        this.logger.warn(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket): void {
        this.logger.warn(`Client disconnected: ${client.id}`);
    }
    @SubscribeMessage('join-conversation')
    joinConversation(client: Socket, data: { conversationId: string }): void {
        this.logger.warn(`Client joined conversation: ${client.id}`);

        client.join(`conversation_${data.conversationId}`);
    }
    leaveConversation(client: Socket, data: { conversationId: string }): void {
        client.leave(`conversation_${data.conversationId}`);
    }
    sendMessage(conversationId: string, data: { message: string }): void {
        this.logger.warn(`Sending message to conversation: ${conversationId}`);
        this.server.to(`conversation_${conversationId}`).emit(`message_${conversationId}`, data);
    }

    @SubscribeMessage('typing')
    typing(client: Socket, data: { conversationId: string,senderId: string }): void {
        //this.logger.warn(`Client typing: ${client.id}`);
        console.log('typing', data);
        this.server.to(`conversation_${data.conversationId}`).emit(`typing_${data.conversationId}_${data.senderId}`, data);
    }
}