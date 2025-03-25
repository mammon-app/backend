import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUser } from "../../common/decorator/get-user.decorator";
import { IUser } from "../../common/interfaces/user.interface";
import { HttpResponse } from "../../common/helpers/response-handler.helper";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreatePasswordDTO,
  ExportPrivateKeyDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
  UpdateProfileImageDto,
} from "../../common/dto/user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "../fileUpload/fileUpload.service";
import { Express } from "express";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";
import { PaginateDto } from "src/common/dto/paginate.dto";
@Controller("user")
@ApiTags("user")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Get("/account/profile")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get user profile",
  })
  async getUserProfile(@GetUser() user: IUser) {
    const response = await this.userService.getUserProfile(user);
    return HttpResponse.send("Profile retrieved", response);
  }

  @Get("/account/referrals")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get user referrals",
  })
  async getUserReferrals(@GetUser() user: IUser, @Query() query: PaginateDto) {
    const response = await this.userService.getUserReferrals(user, query);
    return HttpResponse.send("Referrals retrieved", response);
  }
  @Get("/account/referrals/leaderboard")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get referrals leaderboard",
  })
  async getReferralLeaderBoard(@Query() query: PaginateDto) {
    const response = await this.userService.getReferralLeaderBoard(query);
    return HttpResponse.send("Leaderboard retrieved", response);
  }

  @Put("/account/password")
  @HttpCode(200)
  @ApiOperation({
    summary: "Change password",
  })
  @UseGuards(EmailVerificationGuard)
  async changePassword(
    @Body() body: UpdatePasswordDTO,
    @GetUser() user: IUser
  ) {
    await this.userService.changePassword(body, user);
    return HttpResponse.send("Password changed successfully");
  }

  @Put("/account/profile")
  @HttpCode(200)
  @ApiOperation({
    summary: "Update profile",
  })
  @UseGuards(EmailVerificationGuard)
  async updateProfile(@Body() body: UpdateProfileDTO, @GetUser() user: IUser) {
    await this.userService.updateProfile(body, user);
    return HttpResponse.send("Profile updated successfully");
  }

  @Put("/account/profile-image")
  @HttpCode(200)
  @ApiOperation({
    summary: "Update profile image",
  })
  @UseGuards(EmailVerificationGuard)
  async updateProfileImage(
    @Body() body: UpdateProfileImageDto,
    @GetUser() user: IUser
  ) {
    await this.userService.updateProfileImage(body, user);
    return HttpResponse.send("Profile image updated successfully");
  }

  @Put("/account/create/password")
  @HttpCode(200)
  @ApiOperation({
    summary: "Create a password for your account",
  })
  @UseGuards(EmailVerificationGuard)
  async createPassword(
    @Body() body: CreatePasswordDTO,
    @GetUser() user: IUser
  ) {
    await this.userService.createPassword(user, body);
    return HttpResponse.send("Password created successfully");
  }

  @Post("account/uploadProfileImage")
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(200)
  @ApiOperation({
    summary: "Upload goal image",
  })
  @UseGuards(EmailVerificationGuard)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadGoalImage(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const response = await this.fileUploadService.uploadImage(file);
    return HttpResponse.send("File Uploaded", response);
  }

  @Post("account/exportPrivateKey")
  @HttpCode(200)
  @ApiOperation({
    summary: "Export your private key",
  })
  @UseGuards(EmailVerificationGuard)
  async exportPrivateKey(
    @Body() payload: ExportPrivateKeyDTO,
    @GetUser() user: IUser
  ) {
    const response = await this.userService.exportPrivateKey(payload, user);
    return HttpResponse.send("Successful", response);
  }
}
