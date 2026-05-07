import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    const { password, ...result } = user;
    return result;
  }

  async getTokens(userId: number, username: string, roleIds: number[]) {
    const payload = {
      sub: userId,
      username,
      roles: roleIds,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'secret_key'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_secret_key'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string | null) {
    if (refreshToken) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(refreshToken, salt);
      await this.usersService.updateRefreshToken(userId, hash);
    } else {
      await this.usersService.updateRefreshToken(userId, null);
    }
  }

  async login(user: any) {
    const roleIds = user.roles ? user.roles.map((r: any) => r.id) : [];

    const tokens = await this.getTokens(user.id, user.username, roleIds);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        roles: user.roles
          ? user.roles.map((r: any) => ({
              id: r.id,
              name: r.name,
              permissions: r.permissions
                ? r.permissions.map((p: any) => ({ 
                    action: p.action, 
                    subject: p.subject, 
                    inverted: p.inverted,
                    conditions: p.conditions
                  }))
                : [],
            }))
          : [],
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    try {
      // 1. Xác thực token (còn hạn hay không, đúng chữ ký không)
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_secret_key'),
      });
    } catch (e) {
      throw new ForbiddenException('Refresh Token is invalid or expired');
    }

    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    // Lấy lại roles đầy đủ
    const fullUser = await this.usersService.findByUsername(user.username);
    if (!fullUser) {
      throw new ForbiddenException('User not found');
    }
    const roleIds = fullUser.roles ? fullUser.roles.map((r: any) => r.id) : [];

    const tokens = await this.getTokens(user.id, user.username, roleIds);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token) as any;
  }

  async logout(userId: number) {
    await this.updateRefreshTokenHash(userId, null);
  }

  async changePassword(userId: number, newPassword: string) {
    return this.usersService.update(userId, { password: newPassword });
  }
}
