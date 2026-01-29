import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class WsCookieGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket>();
        const cookieHeader = client.handshake.headers.cookie;
        if (!cookieHeader) return false;

        const cookies = Object.fromEntries(
            cookieHeader
                .split(';')
                .map(c => c.trim().split('='))
                .map(([k, v]) => [k, decodeURIComponent(v)])
        );

        const token = cookies['taleemiyat_token'];
        if (!token) return false;

        try {
            const payload = this.jwtService.decode(token);
            client.data.userId = payload.sub;
            return true;
        } catch {
            return false;
        }
    }
}
