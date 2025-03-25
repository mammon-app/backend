import { Sep10Service } from "./../sep10/sep10.service";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Sep1Service } from "../sep1/sep1.service";
import {
  QueryTransfersSep24DTO,
  InitiateTransfersSep24DTO,
} from "src/common/dto/wallet.dto";
import { IUser } from "src/common/interfaces/user.interface";

const SIGNING_KEY = "GCQLPBWOQ5PAJYEEQBE7GDSY7X3LCYKFEBKOCNF3OUA6F74ORK74HVSQ";
const WEB_AUTH_ENDPOINT = "https://anchor.ngnc.online/auth";
const TRANSFER_SERVER_SEP0024 = "https://anchor.ngnc.online/sep24";
@Injectable()
export class Sep24Service {
  constructor(
    private readonly sep10Service: Sep10Service,
  ) {}

  /**
   * Retrieves SEP-24 transfer server information from the Stellar.toml file.
   * @returns {Promise<{ data: { json: any } }>} The JSON data from the transfer server's /info endpoint.
   * @throws {BadRequestException} If the request to the transfer server fails.
   */
  async getSep24Info() {
    // Fetch TRANSFER_SERVER_SEP0024 URL from Stellar.toml using SEP-1 service
    // const { TRANSFER_SERVER_SEP0024 } =
    //   await this.sep1Service.fetchStellarToml();

    // Fetch /info endpoint from the transfer server
    const res = await fetch(`${TRANSFER_SERVER_SEP0024}/info`);
    const json = await res.json();

    // Throw exception if the response is not ok
    if (!res.ok) {
      throw new BadRequestException(json.error);
    }

    // Return the JSON data
    return { data: { json } };
  }

  /**
   * Initiates a SEP-24 interactive transfer.
   * @param {InitiateTransfersSep24DTO} payload - Data transfer object containing transaction details.
   * @param {IUser} account - The user's account information.
   * @returns {Promise<{ data: { json: any, authToken: string } }>} The JSON data from the transfer server's /interactive endpoint and the authentication token.
   * @throws {BadRequestException} If the request to the transfer server fails.
   */
  async initiateTransfer24(payload: InitiateTransfersSep24DTO, account: IUser) {
    // Fetch auth token and TRANSFER_SERVER_SEP0024 URL concurrently
    const [
      authToken,
      // { TRANSFER_SERVER_SEP0024 }
    ] = await Promise.all([
      this.sep10Service.getChallengeTransaction(account),
      // this.sep1Service.fetchStellarToml(),
    ]);

    // Make a POST request to initiate the interactive transfer
    const res = await fetch(
      `${TRANSFER_SERVER_SEP0024}/transactions/${payload.txType}/interactive`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          asset_code: payload.assetCode,
          account: account.stellarPublicKey,
        }),
      }
    );
    const json = await res.json();

    // // Throw exception if the response is not ok
    if (!res.ok) {
      throw new BadRequestException(json.error);
    }

    // Return the JSON data and auth token
    return { data: { json, authToken } };
  }

  /**
   * Queries SEP-24 transfers for a specific asset code.
   * @param {QueryTransfersSep24DTO} payload - Data transfer object containing query details.
   * @param {IUser} account - The user's account information.
   * @returns {Promise<{ data: { json: any } }>} The JSON data from the transfer server's /transactions endpoint.
   * @throws {BadRequestException} If the request to the transfer server fails.
   */
  async queryTransfers24(payload: QueryTransfersSep24DTO, account: IUser) {
    // Fetch auth token and TRANSFER_SERVER_SEP0024 URL concurrently
    const [
      authToken,
      //  { TRANSFER_SERVER_SEP0024 }
    ] = await Promise.all([
      this.sep10Service.getChallengeTransaction(account),
      // this.sep1Service.fetchStellarToml(),
    ]);

    // Make a GET request to query transfers
    const res = await fetch(
      `${TRANSFER_SERVER_SEP0024}/transactions?${new URLSearchParams({
        asset_code: payload.assetCode,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    const json = await res.json();

    // Throw exception if the response is not ok
    if (!res.ok) {
      throw new BadRequestException(json.error);
    }

    // Return the JSON data
    return { data: { json } };
  }
}
