<p align="center">
  <h1 align="center">Bài Test Webhook Service</h1>
</p>

## 1. Cài đặt và test project

### 1.1. Verion:

Cài đặt các version liên quan:\
node: 22.16.0\
npm: 10.9.2\
nest: 11.0.7

### 1.2. Cài đặt project trên Docker:

Lợi ích khi chạy project trên Docker so với local là giúp đồng nhất môi trường, phiên bản, các dependencies, thậm chí trên máy local không cài môi trường node vẫn có thể chạy được bình thường vì mọi setup đã được đóng gói trong containner.

#### Bước 1:

Clone code từ Github:

```bash
$ git clone https://github.com/ntthanh2k1/oven-company-testing.git
```

#### Bước 2:

Tạo file ".env" ở root project:

```bash
# .env
PORT=3000

NODE_ENV=development

# DB_HOST đặt là 'db'
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=webhook_db

# ACCESS_TOKEN_SECRET được tạo thành từ:
# Input: 'this-is-my-access-token-secret-key'
# Thuật toán hash: SHA512
# Đường dẫn hash key: https://codebeautify.org/sha512-hash-generator
ACCESS_TOKEN_SECRET=ebec88744d37773f0c8e6609c672681dec1492503ed9fef3a7f9610a070e4dd384b0ea1008ab7a60b1c3a1c945b41e66fd9a06dc5d4557138dd28a8123e38e5a
ACCESS_TOKEN_TTL=86400
```

#### Bước 3:

Chạy lệnh build và run:

```bash
docker compose up --build
```

Sau khi build mà chưa run có thể chạy lại:

```bash
docker compose up
```

### 1.3. Các bước cài đặt project trên local

#### Bước 1:

Tạo 1 server PostgreSQL local:\
username = postgres\
password = 123456

Tạo 1 database trên server đã tạo ở trên:\
database = webhook_db

#### Bước 2:

Clone code từ Github:

```bash
$ git clone https://github.com/ntthanh2k1/oven-company-testing.git
```

#### Bước 3:

Tạo file ".env" ở root project:

```bash
# .env
PORT=3000

NODE_ENV=development

# DB_HOST đặt là 'localhost'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=webhook_db

# ACCESS_TOKEN_SECRET được tạo thành từ:
# Input: 'this-is-my-access-token-secret-key'
# Thuật toán hash: SHA512
# Đường dẫn hash key: https://codebeautify.org/sha512-hash-generator
ACCESS_TOKEN_SECRET=ebec88744d37773f0c8e6609c672681dec1492503ed9fef3a7f9610a070e4dd384b0ea1008ab7a60b1c3a1c945b41e66fd9a06dc5d4557138dd28a8123e38e5a
ACCESS_TOKEN_TTL=86400
```

#### Bước 4:

Cài đặt các packages:

```bash
$ npm install
```

#### Bước 5:

Chạy migration để tạo các table liên quan trên database:

```bash
$ npm run migration:run
```

Không cần tạo file migration nữa vì đã tạo sẵn, trong file có seeding 1 user mẫu để test project:\
username = admin\
password = admin@123

#### Bước 6:

Run project với cơ chế hot reload:

```bash
$ npm run dev
```

### 1.3. Hướng dẫn test project

Truy cập vào swagger document để test project:\
http://localhost:3000/swagger

Danh sách các API:\
Auth module:

- Login: http://localhost:3000/auth/login
- Logout: http://localhost:3000/auth/logout

Webhook module:

- POST: http://localhost:3000/webhooks
- GET: http://localhost:3000/webhooks
- GET count: http://localhost:3000/webhooks/count
- GET by id: http://localhost:3000/webhooks/:id
- Delete: http://localhost:3000/webhooks

Trước khi thao tác trên các API của Webhook module, anh/chị cần phải login trước (nếu không sẽ bắt lỗi 401 - unauthorized):\
API: http://localhost:3000/auth/login\
Body:

```json
{
  "username": "admin",
  "password": "admin@123"
}
```

## 2. Đánh giá và hướng xử lý lỗi

### 2.1 Đánh giá lỗi trên codebase cũ:

#### Critical:

- Chưa có cấu hình rate limit.
- Chưa có cấu hình CORS.
- Chưa có lưu dữ liệu trên database (hiện tại đang lưu theo phương thức in-memory storage).
- Chưa có validate input khi thao tác với API.
- Chưa có authentication và authorization để bảo mật API.

#### High:

- ID của webhook là kiểu random nhưng vẫn có khả năng bị trùng.
- Error Handling không hoạt động đúng như mong đợi và cấu hình còn đơn giản.

#### Medium:

- Cột 'payload' của Webhook đang khai báo kiểu any, người đọc code sẽ mơ hồ không rõ kiểu dữ liệu gì

#### Low:

- Cách tổ chức cấu trúc code chưa rõ ràng.

### 2.2 Cách xử lý lỗi:

#### 2.2.1 Cấu hình rate limit

Giúp duy trì hiệu suất hệ thống, ngăn chặn client spam request trong 1 khoảng thời gian, ngăn chặn tấn công DDoS, brute force

```ts
// src/app.module.ts
@Module({
  imports: [
    // Cấu hình rate limit giới hạn 50 request trong 1 phút
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 50,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### 2.2.2 Cấu hình CORS ( Cross-Origin Resource Sharing)

Giúp hệ thống kiểm soát được website khác domain nào được phép gọi API, hiện tại chỉ làm backend nên cấu hình mặc định là cho phép mọi domain

```ts
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  // Cấu hình Cross-Origin Resource Sharing
  app.enableCors();

  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/swagger`);
  });
}
bootstrap();
```

#### 2.2.3 Lưu dữ liệu trên database

Vì phương thức lưu data in-memory storage chỉ lưu data trên RAM, khi restart hoặc crash app thì dữ liệu sẽ bị mất, vì vậy cần lưu trên database để lưu trữ lại data.

```ts
// src/config/database/db.config.ts
@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor() {}
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);
    const username = process.env.DB_USERNAME;
    const password = String(process.env.DB_PASSWORD);
    const database = process.env.DB_NAME;

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [],
      synchronize: false,
      autoLoadEntities: true,
    };
  }
}
```

```ts
// src/app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
  ],
})
export class AppModule {}
```

2.2.4 Validate input

Giúp cho data sạch, ngăn chặn người dùng input giá trị null hoặc giá trị không hợp lệ làm xuất hiện data không có tác dụng hoặc có thể làm crash app

```ts
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  // Cấu hình Validation
  app.useGlobalPipes(
    new ValidationPipe({
      // Loại bỏ các input không cần thiết
      whitelist: true,
      // Loại bỏ các input không hợp lệ
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/swagger`);
  });
}
bootstrap();
```

Ví dụ về validate input:

```ts
// src/modules/webhook/dto/create-webhook.dto.ts
export class CreateWebhookDto {
  @ApiProperty()
  @IsNotEmpty()
  source: string;

  @ApiProperty()
  @IsNotEmpty()
  event: string;

  @ApiProperty()
  @IsNotEmpty()
  payload: any;
}
```

2.2.5 Cấu hình authentication và authorization

Trong project em sử dụng JWT để xác thực và ủy quyền, chỉ có những user trong hệ thống được cấp quyền thì mới thao tác được với API để tránh tình trạng mọi người đều có thể thao tác spam data rác vào hệ thống hoặc thao tác xóa các data của hệ thống.

Ví dụ cấu hình verify JWT

```ts
// src/modules/auth/guards/auth.guard.ts
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
```

Protect controller:

```ts
// src/modules/webhook/webhook.controller.ts
@Controller('webhooks')
@UseGuards(AuthGuard)
export class WebhookController {}
```

2.2.6 Update lại cách generate ID

Kiểu random ID trong codebase cũ độ dài chuỗi ngắn, chỉ có số, dễ bị trùng key khi tập dữ liệu bắt đầu lớn.\
Có 2 cách tạo key là kiểu number tăng dần hoặc kiểu UUID:

- Kiểu number tăng dần độ dài ngắn, dễ đọc, select rất nhanh, nhưng rất dễ đoán nên dễ bị hacker phá data.
- Kiểu UUID cũng là kiểu random nhưng kích thước lớn hơn, vừa random cả số và chữ nên xác xuất trùng rất thấp, select sẽ chậm hơn kiểu number tăng dần nhưng nhờ độ phức tạp của key nên khó bị hacker phá.

Ví dụ về kiểu UUID:

```ts
@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
```

#### 2.2.7 Update lại error handler

Trong code cũ error handler không hoạt động đúng vì các hàm gọi API muốn vào được error handler phải có tham số next để di chuyển vào handler, những code cũ các hàm API chỉ có req và res, không có next nên cấu hình không hoạt động như mong đợi

Ví dụ cấu hình error handler global:

```ts
// src/config/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      ...(exceptionResponse as object),
      path: request.url,
    });
  }
}
```

```ts
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  // Cấu hình error handler global
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/swagger`);
  });
}
bootstrap();
```

Ví dụ khi bắt lỗi sẽ trả về:

```json
{
  "message": "Invalid access token.",
  "error": "Unauthorized",
  "statusCode": 401,
  "path": "/webhooks"
}
```

#### 2.2.8 Update khai báo kiểu dữ liệu của cột payload trong entity Webhook

Kiểu any là kiểu của typescript, khi tạo trong db phải cần datatype cụ thể, ví dụ mong đợi data của payload là 1 object json nhưng nếu người dùng cho input là boolean thì bị sai cấu trúc.

```ts
@Entity('webhooks')
export class Webhook {
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;
}
```

#### 2.2.9 Tổ chức lại cấu trúc project

Cấu trúc của codebase cũ bị gom mọi thứ trong 1 file, nếu sau này app lớn thì sẽ rất khó đọc, khó bảo trì.\
Hiện tại em update lại cấu trúc theo kiểu module mặc định của NestJS.\
Trong folder "src":\

- config: chứa các cấu hình như database, redis, filter-exception, upload file,...
- modules: chứa các module con, mỗi module có dto, entities, repositories, services, controllers,... Ví dụ module webhook có các tính năng liên quan đến webhook, module auth có các tính năng như login, logout,...
- common: chứa các utils, interfaces dùng chung.
