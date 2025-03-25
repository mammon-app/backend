import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { TierService } from "./tier.service";
import { HttpResponse } from "../../../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { AdminGuard } from "src/common/guards/admin.guard";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";
import {
  CreateTierDTO,
  DeleteTierByIdDTO,
} from "src/common/dto/referralProgram/tier.dto";

@Controller("admin/referralProgram")
@ApiTags("admin")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AdminGuard)
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Get("tier-enum")
  @HttpCode(200)
  @ApiOperation({ summary: "Get all tier enums" })
  async getTierEnum() {
    const response = await this.tierService.getTierEnum();
    return HttpResponse.send("Tier enums retrieved", response);
  }

  @Post("create-tier")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Create tier" })
  async createTier(@Body() body: CreateTierDTO) {
    const response = await this.tierService.createTier(body);
    return HttpResponse.send("Tier created successfully", response);
  }

  @Put("update-tier/:tierId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Update a tier" })
  async updateTask(
    @Body() body: CreateTierDTO,
    @Param() param: DeleteTierByIdDTO
  ) {
    const response = await this.tierService.updateTier(body, param);
    return HttpResponse.send("Tier updated successfully", response);
  }

  @Delete("delete-tier/:tierId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Delete a tier" })
  async deleteTask(@Param() param: DeleteTierByIdDTO) {
    await this.tierService.deleteTier(param);
    return HttpResponse.send("Tier deleted successfully");
  }
}
