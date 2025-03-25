import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";
import { AdminUserService } from "./user.service";
import { HttpResponse } from "../../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { PaginateDto } from "src/common/dto/paginate.dto";
import { AdminGuard } from "src/common/guards/admin.guard";

@Controller("admin")
@ApiTags("admin")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AdminGuard)
export class AdminUserController {
  constructor(private readonly userService: AdminUserService) {}

  @Get("/users")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get all users",
  })
  async getUsers(@Query() query: PaginateDto) {
    const response = await this.userService.getUsers(query);
    return HttpResponse.send("Users retrieved", response);
  }

  @Get("/admins")
  @HttpCode(200)
  @ApiOperation({
    summary: "Get all admins",
  })
  async getAdmins(@Query() query: PaginateDto) {
    const response = await this.userService.getAdmins(query);
    return HttpResponse.send("Admins retrieved", response);
  }
  
}
