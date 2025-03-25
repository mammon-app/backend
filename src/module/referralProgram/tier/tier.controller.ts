import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";
import { TierService } from "./tier.service";
import { HttpResponse } from "../../../common/helpers/response-handler.helper";
import { AuthGuard } from "../../../common/guards/auth.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { PaginateDto } from "src/common/dto/paginate.dto";

@Controller("referralProgram")
@ApiTags("Referral Program")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Get("tier")
  @HttpCode(200)
  @ApiOperation({ summary: "Get all tiers" })
  async getTiers(@Query() query: PaginateDto) {
    const response = await this.tierService.getTiers(query);
    return HttpResponse.send("Tiers retrieved", response);
  }
}
