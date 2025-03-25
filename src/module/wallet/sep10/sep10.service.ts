import { HOME_DOMAIN, HOME_DOMAIN_SHORT } from "./../../../config/env.config";
import {
  Keypair,
  Memo,
  MemoType,
  Operation,
  Transaction,
  Utils,
} from "stellar-sdk";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Sep1Service } from "../sep1/sep1.service";
import { WalletDecryption } from "src/common/helpers/encryption-decryption.helper";

@Injectable()
export class Sep10Service {
  constructor(private readonly sep1Service: Sep1Service) {}
  async getChallengeTransaction(account: any) {
    const domainWithoutProtocol = HOME_DOMAIN_SHORT.replace(/^https?:\/\//, "");
    const webAUthDomainWithoutProtocol = HOME_DOMAIN.replace(
      /^https?:\/\//,
      ""
    );
    // const { WEB_AUTH_ENDPOINT, TRANSFER_SERVER_SEP0024, SIGNING_KEY } =
    //   await this.sep1Service.fetchStellarToml();

    const SIGNING_KEY =
      "GCQLPBWOQ5PAJYEEQBE7GDSY7X3LCYKFEBKOCNF3OUA6F74ORK74HVSQ";
    const WEB_AUTH_ENDPOINT = "https://anchor.ngnc.online/auth";
    const TRANSFER_SERVER_SEP0024 = "https://anchor.ngnc.online/sep24";
    if (!(WEB_AUTH_ENDPOINT || TRANSFER_SERVER_SEP0024) || !SIGNING_KEY) {
      throw new BadRequestException(
        "Could not get challenge transaction (server missing toml entry or entries)"
      );
    }
    const hashedPassword = account.password;

    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    const webAuthEndpoint = WEB_AUTH_ENDPOINT || TRANSFER_SERVER_SEP0024;
    const res = await fetch(
      `${webAuthEndpoint}?${new URLSearchParams({
        account: account.stellarPublicKey,
      })}`
    );

    if (!res.ok)
      throw new BadRequestException("Failed to fetch challenge transaction");

    const json = await res.json();

    await this.validateChallengeTransaction({
      transactionXDR: json.transaction,
      serverSigningKey: SIGNING_KEY,
      network: json.network_passphrase,
      clientPublicKey: account.stellarPublicKey,
      homeDomain: domainWithoutProtocol,
      webAuthDomain: webAUthDomainWithoutProtocol,
    });

    const { token } = await this.submitChallengeTransaction({
      transactionXDR: json.transaction,
      webAuthEndpoint: WEB_AUTH_ENDPOINT,
      network: json.network_passphrase,
      signingKey: decryptedPrivateKey,
    });

    return token;
  }

  private async validateChallengeTransaction({
    transactionXDR,
    serverSigningKey,
    network,
    clientPublicKey,
    homeDomain,
    webAuthDomain,
  }) {
    let results: {
      matchedHomeDomain: any;
      clientAccountID: any;
      tx?: Transaction<Memo<MemoType>, Operation[]>;
      memo?: string;
    };

    try {
      results = Utils.readChallengeTx(
        transactionXDR,
        serverSigningKey,
        network,
        homeDomain,
        webAuthDomain
      );
    } catch (error) {
      console.error("Error in readChallengeTx:", error);
      const transaction = new Transaction(transactionXDR, network);
      transaction.operations.forEach((op) => {
        if (op.type === "manageData") {
          console.log("Operation key:", op.name);
          console.log("Operation value:", op.value?.toString());
        }
      });
      throw new BadRequestException(
        `Invalid challenge: unable to deserialize challengeTx transaction string. Error: ${error.message}`
      );
    }

    const validHomeDomain = results.matchedHomeDomain === homeDomain;
    if (!validHomeDomain) {
      throw new BadRequestException(
        `Invalid homeDomains: the transaction's operation key name (${results.matchedHomeDomain}) does not match the expected home domain (${homeDomain})`
      );
    }

    const validClientAccountID = results.clientAccountID === clientPublicKey;
    if (validClientAccountID) return;

    throw new BadRequestException(
      "clientAccountID does not match challenge transaction"
    );
  }

  private async submitChallengeTransaction({
    transactionXDR,
    webAuthEndpoint,
    network,
    signingKey,
  }) {
    if (!webAuthEndpoint)
      throw new BadRequestException(
        "Could not authenticate with server (missing toml entry)"
      );

    const keypair = Keypair.fromSecret(signingKey);

    const transaction = new Transaction(transactionXDR, network);
    transaction.sign(keypair);

    const signedTransactionXDR = transaction.toEnvelope().toXDR("base64");
    const res = await fetch(webAuthEndpoint, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: signedTransactionXDR }),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new BadRequestException(json.error);
    }
    return { token: json.token };
  }
}
