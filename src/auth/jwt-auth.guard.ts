import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import type { JwtPayload } from './jwt.strategy';

const extractAdminToken = (req: { headers?: { cookie?: string; authorization?: string } } | undefined) => {
  const authHeader = req?.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const adminCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));
  if (!adminCookie) return null;

  const [, token] = adminCookie.split('=');
  return token || null;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T, _info: unknown, context: ExecutionContext): T {
    const req = context.switchToHttp().getRequest();
    const token = extractAdminToken(req);
    const allowMockAdmin = (process.env.ALLOW_MOCK_ADMIN ?? 'false') === 'true';

    if (allowMockAdmin && token === 'mock_jwt_token') {
      return {
        sub: 'super_admin',
        role: 'SUPER_ADMIN',
      } as T;
    }

    if (err || !user) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      });
    }
    return user;
  }
}
