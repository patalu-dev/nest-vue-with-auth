import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(user: any) {
    // Extract role IDs to store in JWT (keep token small)
    const roleIds = user.roles ? user.roles.map((r: any) => r.id) : [];

    // Collect all unique permissions from all roles for frontend use
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const perm of role.permissions) {
            // Bao gồm tất cả quyền, cả quyền cho phép và quyền cấm
          }
        }
      }
    }

    const payload = {
      username: user.username,
      sub: user.id,
      roles: roleIds,
    };

    return {
      access_token: this.jwtService.sign(payload),
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

  async changePassword(userId: number, newPassword: string) {
    return this.usersService.update(userId, { password: newPassword });
  }
}
