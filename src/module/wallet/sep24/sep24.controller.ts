import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { HttpResponse } from '../../../common/helpers/response-handler.helper';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { Sep24Service } from './sep24.service';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import {
  InitiateTransfersSep24DTO,
  QueryTransfersSep24DTO,
} from 'src/common/dto/wallet.dto';

/**
 * Controller for handling SEP-24 related API requests.
 */
@Controller('sep24')
@ApiTags('stellar') // Tags the controller for API documentation under 'stellar'.
@ApiSecurity('Api-Key') // Indicates that this controller requires 'Api-Key' security.
@ApiBearerAuth('JWT-auth') // Indicates that this controller uses JWT authentication.
@UseGuards(AuthGuard) // Applies authentication guard to all routes in this controller.
export class Sep24Controller {
  constructor(private readonly sep24Service: Sep24Service) {}

  /**
   * Endpoint to get SEP-24 information.
   * @returns SEP-24 info response.
   */
  @HttpCode(200) // Sets the HTTP status code to 200 for this endpoint.
  @ApiOperation({ summary: 'Get Sep24 Info' }) // Provides a summary for API documentation.
  @Get('/getSep24Info') // Maps GET requests to /api/sep24/getSep24Info to this method.
  async getSep24Info() {
    const response = await this.sep24Service.getSep24Info();
    return HttpResponse.send('', response);
  }

  /**
   * Endpoint to initiate a SEP-24 transfer.
   * @param account - Authenticated user account.
   * @param payload - Data transfer object for initiating the transfer.
   * @returns Response of the initiated transfer.
   */
  @HttpCode(200) // Sets the HTTP status code to 200 for this endpoint.
  @ApiOperation({ summary: 'Initiate Sep24 Transfer' }) // Provides a summary for API documentation.
  @Post('/initiateTransfer24') // Maps POST requests to /api/sep24/initiateTransfer24 to this method.
  async initiateTransfer24(
    @GetUser() account: IUser, // Retrieves the authenticated user from the request.
    @Body() payload: InitiateTransfersSep24DTO, // Binds the request body to the DTO.
  ) {
    const response = await this.sep24Service.initiateTransfer24(
      payload,
      account,
    );
    return HttpResponse.send('', response);
  }

  /**
   * Endpoint to query SEP-24 transfers.
   * @param account - Authenticated user account.
   * @param payload - Data transfer object for querying the transfers.
   * @returns Response of the queried transfers.
   */
  @HttpCode(200) // Sets the HTTP status code to 200 for this endpoint.
  @ApiOperation({ summary: 'Query Sep24 Transfer' }) // Provides a summary for API documentation.
  @Post('/queryTransfers24') // Maps POST requests to /api/sep24/queryTransfers24 to this method.
  async queryTransfers24(
    @GetUser() account: IUser, // Retrieves the authenticated user from the request.
    @Body() payload: QueryTransfersSep24DTO, // Binds the request body to the DTO.
  ) {
    const response = await this.sep24Service.queryTransfers24(payload, account);
    return HttpResponse.send('', response);
  }
}
