import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    accessToken: string;
    data: { id: string; username: string };
  }> {
    const result = await this.authService.login(loginDto);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.ACCESS_TOKEN_TTL) * 1000,
    });

    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token');

    return this.authService.logout();
  }
}
