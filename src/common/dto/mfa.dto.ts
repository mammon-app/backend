import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MfaGenerateSecretDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class MfaVerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}
