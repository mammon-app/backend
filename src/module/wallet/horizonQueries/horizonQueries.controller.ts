import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { HttpResponse } from "../../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../../../common/guards/auth.guard";
import {
  FetchAssetsDTO,
  FetchUserDetailsWithInputDTO,
  GetPathDTO,
  WalletAssetParamDTO,
} from "src/common/dto/wallet.dto";
import { HorizonQueriesService } from "./horizonQueries.service";
import { GetUser } from "src/common/decorator/get-user.decorator";
import { IUser } from "src/common/interfaces/user.interface";

/**
 * Controller responsible for handling Horizon queries related to assets and paths.
 * It provides endpoints for fetching assets, retrieving all wallet assets, and getting paths.
 */
@Controller("horizonQueries")
@ApiTags("horizonQueries")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
export class HorizonQueriesController {
  constructor(private readonly horizonQueriesService: HorizonQueriesService) {}

  /**
   * Endpoint to fetch assets based on provided criteria.
   * @param payload The criteria for fetching assets.
   * @returns HttpResponse with the retrieved assets.
   */
  @HttpCode(200)
  @ApiOperation({ summary: "Fetch assets" })
  @Post("/fetchAssets")
  async fetchAssets(@Body() payload: FetchAssetsDTO) {
    const response = await this.horizonQueriesService.fetchAssets(payload);
    return HttpResponse.send("Asset retrieved", response);
  }

  /**
   * Endpoint to retrieve all assets associated with the user's wallet.
   * @param account The user account for which assets are to be retrieved.
   * @returns HttpResponse with all wallet assets.
   */
  @HttpCode(200)
  @ApiOperation({ summary: "Fetch all wallet assets" })
  @Get("/getAllWalletAssets/:currencyType")
  async getAllWalletAssets(
    @GetUser() account: IUser,
    @Param() param: WalletAssetParamDTO
  ) {
    const response = await this.horizonQueriesService.getAllWalletAssets(
      account,
      param
    );
    return HttpResponse.send("All Wallet Assets retrieved", response);
  }

  /**
   * Endpoint to get the path for a transaction based on provided parameters.
   * @param payload The parameters for finding the transaction path.
   * @returns HttpResponse with the retrieved transaction path.
   */
  @HttpCode(200)
  @ApiOperation({ summary: "Get path" })
  @Post("/getPath")
  async getPath(@Body() payload: GetPathDTO) {
    const response = await this.horizonQueriesService.getPath(payload);
    return HttpResponse.send("Path retrieved", response);
  }

  @HttpCode(200)
  @ApiOperation({ summary: "Get all trust lines" })
  @Get("/getAllTrustLines")
  async getAllTrustLines() {
    const response = await this.horizonQueriesService.getAllTrustLines();
    return HttpResponse.send("Trustlines retrieved", response);
  }
  @HttpCode(200)
  @ApiOperation({ summary: "Get user details with part of their info" })
  @Post("/fetchUserDetailsWithInput")
  async fetchUserDetailsWithInput(
    @Body() payload: FetchUserDetailsWithInputDTO
  ) {
    const response = await this.horizonQueriesService.fetchUserDetailsWithInput(
      payload
    );
    return HttpResponse.send("User details retrieved", response);
  }
}
