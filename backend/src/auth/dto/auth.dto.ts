import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@forexmate.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'device-uuid', required: false, description: 'Optional device tracking ID' })
  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(15, { message: 'Full name must not exceed 15 characters' })
  fullName: string;

  @ApiProperty({ example: '9999999999' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  mobile: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  otpCode?: string;
}

export class GoogleLoginDto {
  @ApiProperty({ example: 'google-oauth-access-token' })
  @IsString()
  @IsNotEmpty()
  credential: string;
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ example: 'LOGIN' })
  @IsString()
  @IsNotEmpty()
  purpose: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ example: 'LOGIN' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RequestResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'hex-token-string' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class MobileOtpLoginDto {
  @ApiProperty({ example: '9999999999', description: 'Registered mobile number' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
