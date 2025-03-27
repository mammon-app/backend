import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
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
  ChangeTrustLineDTO,
  PaymentDTO,
  StrictSendAndReceiveDTO,
  SwapDTO,
} from "src/common/dto/wallet.dto";
import { GetUser } from "src/common/decorator/get-user.decorator";
import { IUser } from "src/common/interfaces/user.interface";
import { TransactionsService } from "./transactions.service";
import { PaginateDto } from "src/common/dto/paginate.dto";

// Define a controller with no base path
@Controller("account")
// Specify API tags for Swagger documentation
@ApiTags("wallet")
// Define API security scheme for Swagger
@ApiSecurity("Api-Key")
// Define bearer authentication for Swagger
@ApiBearerAuth("JWT-auth")
// Use authentication guard for all endpoints in this controller
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Define a POST endpoint for adding a trustline
  @HttpCode(200)
  @ApiOperation({ summary: "Add trustline" })
  @Post("/transaction/changeTrustline")
  async createTrustline(
    @Body() payload: ChangeTrustLineDTO, // Get payload from request body
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call service to handle trustline creation
    const response = await this.transactionsService.changeTrustline(
      payload,
      account
    );
    // Return HTTP response
    return HttpResponse.send("Successful", response);
  }

  // Define a POST endpoint for removing a trustline
  @HttpCode(200)
  @ApiOperation({ summary: "Remove trustline" })
  @Post("/transaction/removeTrustline")
  async removeTrustline(
    @Body() payload: ChangeTrustLineDTO, // Get payload from request body
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call service to handle trustline removal
    const response = await this.transactionsService.removeTrustline(
      payload,
      account
    );
    // Return HTTP response
    return HttpResponse.send("Successful", response);
  }

  // Define a POST endpoint for making a payment
  @HttpCode(200)
  @ApiOperation({ summary: "Make payment" })
  @Post("/transaction/payment")
  async payment(@Body() payload: PaymentDTO, @GetUser() account: IUser) {
    // Call service to handle payment
    const response = await this.transactionsService.payment(payload, account);
    // Return HTTP response
    return HttpResponse.send("Transaction successful", response);
  }

  // Define a POST endpoint for strict send operation
  @HttpCode(200)
  @ApiOperation({ summary: "Strict Send" })
  @Post("/transaction/strictSend")
  async strictSend(
    @Body() payload: StrictSendAndReceiveDTO, // Get payload from request body
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call service to handle strict send operation
    const response = await this.transactionsService.strictSend(
      payload,
      account
    );
    // Return HTTP response
    return HttpResponse.send("Transaction successful", response);
  }

  @HttpCode(200)
  @ApiOperation({ summary: "Swap" })
  @Post("/transaction/swap")
  async swap(
    @Body() payload: SwapDTO, // Get payload from request body
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call service to handle strict send operation
    const response = await this.transactionsService.swap(
      payload,
      account
    );
    // Return HTTP response
    return HttpResponse.send("Swap successful", response);
  }

  // Define a POST endpoint for strict receive operation
  @HttpCode(200)
  @ApiOperation({ summary: "Receive Send" })
  @Post("/transaction/strictReceive")
  async strictReceive(
    @Body() payload: StrictSendAndReceiveDTO, // Get payload from request body
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call service to handle strict receive operation
    const response = await this.transactionsService.strictReceive(
      payload,
      account
    );
    // Return HTTP response
    return HttpResponse.send("Transaction successful", response);
  }

  /**
   * Handles the HTTP GET request to retrieve the transaction history for an authenticated user.
   *
   * @param {IUser} account - The authenticated user extracted from the request.
   * @returns {Promise<HttpResponse>} - A promise that resolves to an HTTP response containing the transaction data.
   */
  @HttpCode(200)
  @ApiOperation({ summary: "Get transaction history" })
  @Get("/transaction/getTransactions")
  async getTransactions(
    @GetUser() account: IUser // Get authenticated user from request
  ) {
    // Call the service to handle the transaction retrieval operation
    const response = await this.transactionsService.getTransactions(account);
    // Return the HTTP response with the transaction data
    return HttpResponse.send("Transactions retrieved", response);
  }

  /**
   * Retrieves a paginated list of fiat transactions for the authenticated user.
   *
   * @param query - The pagination and filtering parameters for the request.
   * @param account - The authenticated user's account details.
   * @returns A response containing the paginated list of fiat transactions.
   *
   * @remarks
   * This method interacts with the `transactionsService` to fetch fiat transactions
   * based on the provided query parameters and the user's account information.
   * The response is wrapped in a standardized HTTP response format.
   */
  @Get("/transaction/fiatTransactions")
  @HttpCode(200)
  @ApiOperation({ summary: "Get all fiat transactions" })
  async getFiatTransactions(@Query() query: PaginateDto, @GetUser() account: IUser) {
    const response = await this.transactionsService.getFiatTransactions(query, account);
    return HttpResponse.send("Fiat transactions retrieved", response);
  }
}
