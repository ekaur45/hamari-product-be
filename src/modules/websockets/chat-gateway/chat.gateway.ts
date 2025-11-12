import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
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
}