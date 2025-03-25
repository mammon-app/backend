import {
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { OwnerUserService } from "./user.service";
import { HttpResponse } from "../../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { OwnerGuard } from "src/common/guards/owner.guard";
import { UserByIdDto } from "src/common/dto/user.dto";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";

@Controller("owner")
@ApiTags("owner")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(OwnerGuard)
export class OwnerUserController {
  constructor(private readonly userService: OwnerUserService) {}

  @Put("addOrRemoveAdmin/:userId")
  @HttpCode(200)
  @ApiOperation({
    summary: "Add or remove an admin",
  })
  async addOrRemoveAdmin(@Param() param: UserByIdDto) {
    const response = await this.userService.addOrRemoveAdmin(param);
    return HttpResponse.send("Successful", response);
  }

  @Put("suspendOrUnsuspendAccount/:userId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({
    summary: "Suspend or unsuspend an account",
  })
  async suspendOrUnsuspendAccount(@Param() param: UserByIdDto) {
    const response = await this.userService.suspendOrUnsuspendAccount(param);
    return HttpResponse.send("Successful", response);
  }

  @Put("verifyEmailOrUnverifyEmailAccount/:userId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({
    summary: "Suspend or unsuspend an account",
  })
  async verifyEmailOrUnverifyEmailAccount(@Param() param: UserByIdDto) {
    const response = await this.userService.verifyEmailOrUnverifyEmailAccount(param);
    return HttpResponse.send("Successful", response);
  }
}
