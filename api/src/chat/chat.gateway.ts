import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';

const COOKIE_NAME = 'happynachbar_token';

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

function parseCookie(header?: string): Record<string, string> {
  if (!header) return {};
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return acc;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      if (key) acc[key] = value;
      return acc;
    }, {});
}

function parseOrigins(raw?: string) {
  return new Set(
    (raw ?? 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly allowedOrigins: Set<string>;

  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {
    this.allowedOrigins = parseOrigins(this.config.get<string>('CORS_ORIGINS'));
  }

  async handleConnection(client: Socket) {
    const origin = client.handshake.headers.origin;
    if (origin && !this.allowedOrigins.has(origin)) {
      client.disconnect(true);
      return;
    }

    const cookies = parseCookie(client.handshake.headers.cookie);
    const token = cookies[COOKIE_NAME];

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket) {}
}
