import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { MFAService } from "./mfa.service";
import { GetUser } from "../../common/decorator/get-user.decorator";
import { HttpResponse } from "../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../../common/guards/auth.guard";
import { MfaVerifyOtpDto } from "../../common/dto/mfa.dto";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";

/**
 * MFAController handles all HTTP requests related to Multi-Factor Authentication (MFA)
 * for user accounts. It provides endpoints to generate secrets, set up MFA, verify OTPs,
 * retrieve settings, and toggle MFA setup. The controller uses NestJS decorators for routing,
 * security, and API documentation.
 */
@Controller("user")
@ApiTags("user-mfa") // Tags this controller for API documentation
@ApiBearerAuth("JWT-auth") // Indicates that this controller requires JWT authentication
@ApiSecurity("Api-Key") // Indicates that this controller requires API key security
@UseGuards(AuthGuard) // Applies the AuthGuard to all endpoints in this controller
@UseGuards(EmailVerificationGuard)
export class MFAController {
  constructor(private readonly mfaService: MFAService) {}

  /**
   * Endpoint to generate a new MFA secret for a user.
   * @param user - The user object obtained from the GetUser decorator.
   * @returns A success message and the generated MFA secret.
   */
  @HttpCode(200)
  @ApiOperation({ summary: "Generate User MFA Secret" }) // API documentation summary
  @Post("account/mfa/generate-secret")
  async generateUserSecret(@GetUser() user) {
    const response = await this.mfaService.generateSecret(user);
    return HttpResponse.send(
      "User MFA Secret generated successfully",
      response
    );
  }

  /**
   * Endpoint to set up MFA for a user.
   * @param payload - The MFA setup payload containing OTP and other necessary data.
   * @param user - The user object obtained from the GetUser decorator.
   * @returns A success message.
   */
  @Post("account/mfa/setup")
  @HttpCode(200)
  @ApiOperation({ summary: "Setup User MFA" }) // API documentation summary
  async setupUserMFA(@Body() payload: MfaVerifyOtpDto, @GetUser() user) {
    await this.mfaService.setupMFA(payload, user);
    return HttpResponse.send("User MFA Setup successfully");
  }

  /**
   * Endpoint to verify a user's MFA OTP.
   * @param payload - The MFA verification payload containing OTP and other necessary data.
   * @param user - The user object obtained from the GetUser decorator.
   * @returns A success message.
   */
  @Post("account/mfa/verify-otp")
  @HttpCode(200)
  @ApiOperation({ summary: "Verify User MFA OTP" }) // API documentation summary
  async verifyUserOTP(@Body() payload: MfaVerifyOtpDto, @GetUser() user) {
    await this.mfaService.verifyOTP(payload, user);
    return HttpResponse.send("User OTP Verification");
  }

  /**
   * Endpoint to retrieve the current MFA settings for a user.
   * @param user - The user object obtained from the GetUser decorator.
   * @returns A success message and the user's MFA settings.
   */
  @Get("account/mfa/get-setting")
  @HttpCode(200)
  @ApiOperation({ summary: "Get User MFA Setting" }) // API documentation summary
  async getUserMFASetting(@GetUser() user) {
    const response = await this.mfaService.getMFASetting(user);
    return HttpResponse.send("User MFA Setup retrieved", response);
  }

  /**
   * Endpoint to toggle the MFA setup for a user.
   * @param user - The user object obtained from the GetUser decorator.
   * @returns A success message indicating the MFA setup has been updated.
   */
  @Put("account/mfa/toggle-setup")
  @HttpCode(200)
  @ApiOperation({ summary: "Toggle User MFA Setup" }) // API documentation summary
  async toggleUserMFASetup(@GetUser() user) {
    await this.mfaService.toggleMFASetup(user);
    return HttpResponse.send("User MFA Setup updated");
  }
}
