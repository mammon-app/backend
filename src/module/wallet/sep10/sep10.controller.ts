import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { HttpResponse } from '../../../common/helpers/response-handler.helper';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { Sep10Service } from './sep10.service';

/**
 * Sep10Controller handles the routes related to the SEP-10 authentication flow.
 */
@Controller('sep10')
@ApiTags('stellar') // Groups the controller under the "stellar" tag in the Swagger documentation.
@ApiSecurity('Api-Key') // Ensures the controller's endpoints require an API key for access.
@ApiBearerAuth('JWT-auth') // Indicates that the endpoints use JWT authentication.
@UseGuards(AuthGuard) // Applies the AuthGuard to all routes in this controller for authentication.
export class Sep10Controller {
  constructor(private readonly sep10Service: Sep10Service) {}

  /**
   * Endpoint to get a challenge transaction for SEP-10 authentication.
   * @param account The user's account information.
   * @returns The challenge transaction response.
   */
  @HttpCode(200) // Sets the HTTP status code to 200 for a successful response.
  @ApiOperation({ summary: 'Get Challenge Transaction' }) // Describes the endpoint's operation in Swagger.
  @Post('/getChallengeTransaction')
  async getChallengeTransaction(account: any) {
    const response = await this.sep10Service.getChallengeTransaction(account);
    return HttpResponse.send('', response); // Sends the response using the HttpResponse helper.
  }
}
