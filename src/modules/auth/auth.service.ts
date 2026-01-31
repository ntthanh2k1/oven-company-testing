import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../user/repositories/user-repository.interface';
import { TokenService } from './token.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  // Hàm đăng nhập
  async login(loginDto: LoginDto): Promise<{
    message: string;
    accessToken: string;
    data: { id: string; username: string };
  }> {
    const { username, password } = loginDto;
    // Lấy user theo username
    const currentUser = await this.userRepository.getUserBy({ username });

    // Kiểm tra nếu username không tồn tại -> return lỗi
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Decode và so sánh password nhập vào và password của user trong db
    const isPasswordCorrect = await argon2.verify(
      currentUser.password,
      password,
    );

    // Nếu mật khẩu không khớp -> return lỗi
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Password not correct.');
    }

    // Tạo access token
    const accessToken = await this.tokenService.createAccessToken({
      id: currentUser.id,
    });

    return {
      message: 'Login successfully.',
      accessToken,
      data: {
        id: currentUser.id,
        username: currentUser.username,
      },
    };
  }

  // Hàm đăng xuất
  logout(): { message: string } {
    return {
      message: 'Logout successfully.',
    };
  }
}
