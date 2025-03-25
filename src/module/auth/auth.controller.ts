import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpResponse } from "../../common/helpers/response-handler.helper";
import {
  CreateWalletDTO,
  EmailQueryDTO,
  LoginDTO,
  OTPVerificationDTO,
  RegisterDTO,
  ResetPasswordDTO,
  ValidationViaEmailDTO,
} from "../../common/dto/user.dto";
import { GetUser } from "../../common/decorator/get-user.decorator";
import { IUser } from "../../common/interfaces/user.interface";
import { RefreshGuard } from "../../common/guards/refresh.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/auth.guard";
import { GoogleAuthGuard } from "src/common/guards/google.auth.guard";
import { PublicGuard } from "src/common/guards/public.guard";

/**
 * AuthController is responsible for handling authentication-related HTTP requests.
 * It integrates with AuthService and provides endpoints for user registration, login,
 * email validation, password reset, and related operations.
 */
@Controller("auth")
@ApiTags("auth")
@ApiSecurity("Api-Key")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint to check if an email is unique.
   * @param query EmailQueryDTO containing the email to check
   * @returns A success message indicating the email is unique
   */
  @Get("validate-email")
  @ApiOperation({
    summary: "Check if email is unique",
  })
  @HttpCode(200)
  async checkEmail(@Query() query: EmailQueryDTO) {
    await this.authService.checkUniqueEmail(query);
    return HttpResponse.send("Email is unique");
  }

  /**
   * Endpoint to login a user with email and password.
   * @param body LoginDTO containing email and password
   * @returns A success message with user data and tokens
   */
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @HttpCode(200)
  async loginUser(@Body() body: LoginDTO) {
    const response = await this.authService.login(body);
    return HttpResponse.send("Login successful", response);
  }

  /**
   * Endpoint to register a new user account.
   * @param body RegisterDTO containing user registration details
   * @returns A success message with user data
   */
  @Post("register")
  @ApiOperation({ summary: "Register user account" })
  async registerUser(@Body() body: RegisterDTO) {
    const response = await this.authService.register(body);
    return HttpResponse.send("Registration successful", response);
  }

  @Get("google/redirect")
  @PublicGuard()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Register user account or Login" })
  async googleRedirect(@Req() req: any) {
    const user = req.user;
    return HttpResponse.send("Successful", user);
  }

  /**
   * Endpoint to register a new user account.
   * @param body RegisterDTO containing user registration details
   * @returns A success message with user data
   */
  @Post("create/wallet")
  @ApiOperation({ summary: "Create user wallet" })
  @ApiBearerAuth("JWT-auth")
  @UseGuards(AuthGuard)
  async createPinCode(
    @Body() body: CreateWalletDTO,
    @GetUser() account: IUser
  ) {
    const response = await this.authService.createWallet(body, account);
    return HttpResponse.send("Pin code created successful", response);
  }

  /**
   * Endpoint to authorize a refresh token.
   * @param user User object obtained from the request context
   * @returns A success message with new tokens
   */
  @Post("refresh-token")
  @ApiOperation({ summary: "Authorize Refresh Token" })
  @ApiBearerAuth("JWT-auth")
  @UseGuards(RefreshGuard)
  @HttpCode(200)
  async authorizeRefreshToken(@GetUser() user: IUser) {
    const response = await this.authService.authorizeRefreshToken(user);
    return HttpResponse.send("Login successful", response);
  }

  /**
   * Endpoint to request a forgot password OTP.
   * @param body ValidationViaEmailDTO containing the email
   * @returns A success message indicating the OTP has been sent
   */
  @Post("forgot-password")
  @ApiOperation({ summary: "Request forgot password OTP" })
  @HttpCode(200)
  async forgotPassword(@Body() body: ValidationViaEmailDTO) {
    await this.authService.forgotPassword(body);
    return HttpResponse.send("Forgot password OTP sent");
  }

  /**
   * Endpoint to resend the forgot password OTP.
   * @param body ValidationViaEmailDTO containing the email
   * @returns A success message indicating the OTP has been sent
   */
  @Post("resend-forgot-password-otp")
  @HttpCode(200)
  @ApiOperation({ summary: "Resend forgot password OTP" })
  async resendForgotPasswordOTP(@Body() body: ValidationViaEmailDTO) {
    await this.authService.resendForgotPasswordOTP(body);
    return HttpResponse.send("Forgot password OTP sent");
  }

  /**
   * Endpoint to verify an email with an OTP.
   * @param body OTPVerificationDTO containing the OTP and email
   * @returns A success message indicating the email has been verified
   */
  @Post("verify-email")
  @ApiOperation({ summary: "Verify email" })
  @HttpCode(200)
  async verifyEmail(@Body() body: OTPVerificationDTO) {
    await this.authService.verifyEmail(body);
    return HttpResponse.send("Email verified");
  }

  /**
   * Endpoint to request email validation OTP.
   * @param body ValidationViaEmailDTO containing the email
   * @returns A success message indicating the validation OTP has been sent
   */
  @Post("request-email-validation")
  @ApiOperation({ summary: "Request email validation" })
  @HttpCode(200)
  async requestEmailValidation(@Body() body: ValidationViaEmailDTO) {
    await this.authService.requestEmailValidation(body);
    return HttpResponse.send("Email validation is successful");
  }

  /**
   * Endpoint to resend the email verification OTP.
   * @param body ValidationViaEmailDTO containing the email
   * @returns A success message indicating the OTP has been sent
   */
  @Post("resend-verify-email-otp")
  @HttpCode(200)
  @ApiOperation({ summary: "Resend email verification OTP" })
  async resendEmailVerificationOTP(@Body() body: ValidationViaEmailDTO) {
    await this.authService.resendEmailVerificationOTP(body);
    return HttpResponse.send("Email verification OTP sent");
  }

  /**
   * Endpoint to reset the user's password.
   * @param body ResetPasswordDTO containing the new password and verification details
   * @returns A success message indicating the password has been reset
   */
  @Post("reset-password")
  @ApiOperation({ summary: "Reset password" })
  @HttpCode(200)
  async resetPassword(@Body() body: ResetPasswordDTO) {
    await this.authService.resetPassword(body);
    return HttpResponse.send("Password reset successful");
  }
}
