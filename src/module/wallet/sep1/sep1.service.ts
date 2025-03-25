import { Injectable } from "@nestjs/common";
import { HOME_DOMAIN_SHORT } from "src/config/env.config";
import { StellarTomlResolver } from "stellar-sdk";

// Extracting domain without protocol for TOML resolution
const domainWithoutProtocol = HOME_DOMAIN_SHORT.replace(/^https?:\/\//, "");

@Injectable()
export class Sep1Service {
  /**
   * Fetches the Stellar TOML file for the configured domain.
   * @returns Promise resolving to the parsed Stellar TOML data.
   */
  async fetchStellarToml() {
    const stellarToml = await StellarTomlResolver.resolve(
      domainWithoutProtocol
    );
    return stellarToml;
  }

  /**
   * Retrieves the Stellar network passphrase from the resolved TOML file.
   * @returns Promise resolving to the network passphrase string.
   */
  async getNetworkPassphrase() {
    const { NETWORK_PASSPHRASE } = await this.fetchStellarToml();
    return NETWORK_PASSPHRASE;
  }

  /**
   * Retrieves the Federation server URL from the resolved TOML file.
   * @returns Promise resolving to the Federation server URL.
   */
  async getFederationServer() {
    const { FEDERATION_SERVER } = await this.fetchStellarToml();
    return FEDERATION_SERVER;
  }

  /**
   * Retrieves the SEP-24 Transfer server URL from the resolved TOML file.
   * @returns Promise resolving to the SEP-24 Transfer server URL.
   */
  async getTransferServerSep24() {
    const { TRANSFER_SERVER_SEP0024 } = await this.fetchStellarToml();
    return TRANSFER_SERVER_SEP0024;
  }

  /**
   * Retrieves the WebAuth endpoint URL from the resolved TOML file.
   * @returns Promise resolving to the WebAuth endpoint URL.
   */
  async getWebAuthEndpoint() {
    const { WEB_AUTH_ENDPOINT } = await this.fetchStellarToml();
    return WEB_AUTH_ENDPOINT;
  }

  /**
   * Retrieves the server signing key from the resolved TOML file.
   * @returns Promise resolving to the server signing key.
   */
  async getServerSigningKey() {
    const { SIGNING_KEY } = await this.fetchStellarToml();
    return SIGNING_KEY;
  }
}
