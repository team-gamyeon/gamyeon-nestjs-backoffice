import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  role: string;
}

const extractAdminTokenFromCookie = (
  req: { headers?: { cookie?: string } } | undefined,
): string | null => {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const adminCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));
  if (!adminCookie) return null;

  const [, token] = adminCookie.split('=');
  return token || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractAdminTokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'fallback-secret'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (payload.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('FORBIDDEN');
    }
    return payload;
  }
}
