import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

/**
 * Represents the user's wallet information for storage and retrieval.
 */
export class UserByIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string; // Unique identifier for the user's wallet.
}

/**
 * Represents the user's credentials for logging into the system.
 */
export class LoginDTO {
  @IsEmail()
  @ApiProperty({ example: "a@gmail.com" })
  @Transform(({ value }) => value.toLowerCase())
  email: string; // User's email address for logging in.

  @IsNotEmpty()
  @ApiProperty({ example: "a" })
  password: string; // User's password for logging in.

  @IsOptional()
  @ApiProperty({ example: "string" })
  captcha: string; // captcha for verifying user.

  @IsOptional()
  @ApiPropertyOptional({ example: "" })
  code: string; // Optional two-factor authentication code for additional security.
}

/**
 * Represents an email used for querying specific information in the system.
 */
export class EmailQueryDTO {
  @IsEmail()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string; // Email address used for querying data.
}

/**
 * Represents a pinCode used for storing private key and executing transactions.
 */
export class CreateWalletDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  pinCode: string;
}

/**
 * Represents the information required for a user to register in the system.
 */
export class RegisterDTO {
  @IsEmail()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string; // User's email address for registration.

  @IsNotEmpty()
  @ApiProperty()
  password: string; // User's chosen password for registration.

  @ApiProperty()
  @Transform(({ value }) => value.toUpperCase())
  @IsOptional()
  referralCode: string;
}

/**
 * Represents an email used for validation purposes.
 */
export class ValidationViaEmailDTO {
  @IsEmail()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string; // Email address used for validation.
}

/**
 * Represents a phone number used for validation purposes.
 */
export class ValidationViaPhoneNumberDTO {
  @IsNotEmpty()
  @ApiProperty()
  phone_number: string; // User's phone number used for validation.

  @IsNotEmpty()
  @ApiProperty()
  country_code: string; // Country code associated with the user's phone number used for validation.
}

/**
 * Represents the information required for resetting a user's password.
 */
export class ResetPasswordValidationDTO {
  @IsNotEmpty()
  @ApiProperty()
  otp: string; // One-time password (OTP) used for password reset.

  @IsEmail()
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase())
  email: string; // User's email address for password reset.

  @IsNotEmpty()
  @ApiProperty({ example: "string" })
  password: string; // New password for password reset.
}

/**
 * Represents the information required for verifying an OTP.
 */
export class OTPVerificationDTO {
  @IsNotEmpty()
  @ApiProperty()
  otp: string; // OTP entered by the user for verification.
}

/**
 * Represents the information required for updating a user's password.
 */
export class UpdatePasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  password: string; // New password for updating.

  @IsNotEmpty()
  @ApiProperty()
  oldPassword: string; // Old password for validation.
}

/**
 * Represents the information required for updating a user's profile.
 */
export class UpdateProfileDTO {
  @IsOptional()
  @ApiProperty()
  username: string; // User's username for profile update.

  @IsOptional()
  @ApiProperty()
  country: string; // User's username for profile update.
}

/**
 * Represents the information required for resetting a user's password using OTP.
 */
export class ResetPasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  otp: string; // OTP used for password reset.

  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string; // User's email address for password reset.

  @IsNotEmpty()
  @ApiProperty()
  password: string; // New password for password reset.
}

/**
 * Represents the information required for updating a user's profile image.
 */
export class UpdateProfileImageDto {
  @IsNotEmpty()
  @ApiProperty()
  userProfileUrl: string; // New profile image URL for updating.
}
/**
 * Represents the information required for creating a user's  password.
 */
export class CreatePasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  password: string;
}
/**
 * Represents the information required for exporting private key.
 */
export class ExportPrivateKeyDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  pinCode: string;
}
