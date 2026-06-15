import { Controller, Post, Body, Get, UseGuards, Request, Res, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.username, body.password);
    const tokens = await this.authService.login(user);

    // Set httpOnly cookies
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: tokens.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: any) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Post('refresh')
  async refreshTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refresh_token;
    const userId = req.body.userId || req.user?.id;
    
    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    // Update httpOnly cookies
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug')
  async debugToken(@Request() req) {
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return { error: 'No token found' };
    }
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
