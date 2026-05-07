import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: any) {
    return this.authService.changePassword(req.user.id, body.newPassword);
  }

  @Post('refresh')
  async refreshTokens(@Body() body: { userId: number; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug')
  async debugToken(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = this.authService.decodeToken(token);
    const now = Math.floor(Date.now() / 1000);
    return {
      payload: decoded,
      serverTime: now,
      expiresInSeconds: decoded.exp - now,
      totalLifeTimeSeconds: decoded.exp - decoded.iat
    };
  }
}
