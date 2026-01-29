import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsCookieGuard } from "../shared/guards/ws-auth.guard";
import { UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";


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
    namespace: 'main'
})
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    constructor(private jwtService: JwtService) {
        this.jwtService = jwtService;
    }

    private userSockets = new Map<string, Set<Socket>>();

    handleConnection(client: Socket): void {
        const onlineUsers: { [userId: string]: boolean } = {};
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.size > 0) onlineUsers[userId] = true;
        }
        if(client.handshake.headers.cookie) {
            let token: string | null = null;
            client.handshake.headers.cookie.split(';').forEach(cookie => {
                const [key, value] = cookie.split('=');
                if(key === 'taleemiyat_token') {
                    token = value;
                }
            });
            if(token) {
                const payload = this.jwtService.decode(token);
                client.data.userId = payload.id;
            }
        }
        this.handleOnlineStatus(client, { userId: client.data.userId });
        this.server.emit(`online-status_${client.data.userId}`, { userId: client.data.userId, isOnline: true });
        this.server.emit('all-online-users', onlineUsers);
    }

    handleDisconnect(client: Socket): void {
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(client)) {
                sockets.delete(client);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                    const onlineUsers: { [userId: string]: boolean } = {};
                    for (const [userId, sockets] of this.userSockets.entries()) {
                        if (sockets.size > 0) onlineUsers[userId] = false;
                    }
                    this.server.emit('all-online-users', onlineUsers);
                    this.server.emit(`offline-status_${userId}`, { userId, isOnline: false });
                }
                break;
            }
        }
    }

    @SubscribeMessage('online-status')
    handleOnlineStatus(client: Socket, data: { userId: string }): void {
        if (!this.userSockets.has(data.userId)) {
            this.userSockets.set(data.userId, new Set());
        }
        this.userSockets.get(data.userId)?.add(client);
        const onlineUsers: { [userId: string]: boolean } = {};
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.size > 0) onlineUsers[userId] = true;
        }
        this.server.emit('all-online-users', onlineUsers);
        this.server.emit(`online-status_${data.userId}`, { userId: data.userId, isOnline: true });
    }
}
