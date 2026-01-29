import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
    cors: { origin: (origin,callback)=>{
        const configService = new ConfigService();
        const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:4200', 'http://localhost:3000'];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    } , credentials: true },
    transports: ['websocket', 'polling'],
    cookie: true,    
    namespace: 'call'
  })
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    logger = new Logger('CallGateway');
    constructor() {
        this.logger.log('CallGateway constructor');
    }
    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
      // Offer from caller → receiver
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: { sender: string; receiver: string; sdp: any }) {
    this.logger.log(`emit offer to ${'offer_'+data.receiver}`);
    this.server.emit('offer_'+data.receiver, data);
  }

  // Answer from receiver → caller
  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { sender: string; receiver: string; sdp: any }) {
    this.server.emit('answer_'+data.receiver, data);
  }

  // ICE candidate exchange
  @SubscribeMessage('ice-candidate')
  handleCandidate(@MessageBody() data: { sender: string; receiver: string; candidate: any }) {
    this.server.emit('ice-candidate_'+data.receiver, data);
  }
}