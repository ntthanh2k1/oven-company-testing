import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  // Hàm tạo access token
  async createAccessToken(tokenPayload: ITokenPayload): Promise<string> {
    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: Number(process.env.ACCESS_TOKEN_TTL),
    });

    return token;
  }
}
