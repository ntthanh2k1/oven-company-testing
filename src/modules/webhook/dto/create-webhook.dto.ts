import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
