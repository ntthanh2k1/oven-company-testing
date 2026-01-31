import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ITokenPayload } from '../interfaces/token-payload.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/user/repositories/user-repository.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Lấy request
      const req = context.switchToHttp().getRequest<Request>();
      // Lấy access_token từ cookie
      const accessToken = req.cookies['access_token'];

      // kiểm tra nếu không có token -> return lỗi
      if (!accessToken) {
        throw new UnauthorizedException('Acess token not provided.');
      }

      // Decode token lấy payload
      const tokenPayload: ITokenPayload = await this.jwtService.verifyAsync(
        accessToken,
        this.configService.get('ACCESS_TOKEN_SECRET'),
      );

      // Lấy user theo id của payload
      const currentUser = await this.userRepository.getUserBy({
        id: tokenPayload.id,
      });

      // Kiểm tra nếu user không tồn tại -> return lỗi
      if (!currentUser) {
        throw new UnauthorizedException('User not found.');
      }

      // Lưu thông tin user vào request
      req['user'] = {
        id: currentUser.id,
        username: currentUser.username,
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid access token.');
      }
    }

    return true;
  }
}
