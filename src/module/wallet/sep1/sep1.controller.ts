import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Sep1Service } from './sep1.service';
import { PublicGuard } from 'src/common/guards/public.guard';

/**
 * Controller handling SEP-1 endpoints related to Stellar integration.
 * Uses Swagger annotations for API documentation.
 * Uses PublicGuard to allow public access to these endpoints.
 */
@Controller('sep1')
@ApiTags('stellar') // Swagger tag for categorizing API endpoints
@PublicGuard() // Guard to allow public access to these endpoints
export class Sep1Controller {
  constructor(private readonly sep1Service: Sep1Service) {}

  /**
   * Endpoint to fetch the Stellar TOML file.
   * @returns {Promise<any>} Result of fetching Stellar TOML.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch Stellar Toml' })
  @Get('/fetchStellarToml')
  async fetchStellarToml() {
    const response = await this.sep1Service.fetchStellarToml();
    return response;
  }

  /**
   * Endpoint to get the network passphrase for Stellar.
   * @returns {Promise<any>} Network passphrase.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Network Passphrase' })
  @Get('/getNetworkPassphrase')
  async getNetworkPassphrase() {
    const response = await this.sep1Service.getNetworkPassphrase();
    return response;
  }

  /**
   * Endpoint to get the federation server URL for Stellar.
   * @returns {Promise<any>} Federation server URL.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Federation Server' })
  @Get('/getFederationServer')
  async getFederationServer() {
    const response = await this.sep1Service.getFederationServer();
    return response;
  }

  /**
   * Endpoint to get the SEP-24 transfer server URL for Stellar.
   * @returns {Promise<any>} Transfer server URL.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Transfer Server Sep24' })
  @Get('/getTransferServerSep24')
  async getTransferServerSep24() {
    const response = await this.sep1Service.getTransferServerSep24();
    return response;
  }

  /**
   * Endpoint to get the WebAuth endpoint for Stellar.
   * @returns {Promise<any>} WebAuth endpoint URL.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Get WebAuth Endpoint' })
  @Get('/getWebAuthEndpoint')
  async getWebAuthEndpoint() {
    const response = await this.sep1Service.getWebAuthEndpoint();
    return response;
  }

  /**
   * Endpoint to get the server signing key for Stellar.
   * @returns {Promise<any>} Server signing key.
   */
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Server Signing Key' })
  @Get('/getServerSigningKey')
  async getServerSigningKey() {
    const response = await this.sep1Service.getServerSigningKey();
    return response;
  }
}
