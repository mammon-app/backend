import StellarSdk from "@stellar/stellar-sdk";
import StellarBase from "stellar-base";

import {
  HORIZON_MAINNET_URL,
  HORIZON_TESTNET_URL,
  STELLAR_NETWORK,
  STELLAR_PUBLIC_SERVER,
  STELLAR_TESTNET_SERVER,
} from "../../config/env.config";

export class WalletHelper {
  static async execTranst(transaction: any, keypair: any) {
    if (transaction !== "") {
      const server = await new StellarSdk.SorobanRpc.Server(
        STELLAR_NETWORK === "public"
          ? STELLAR_PUBLIC_SERVER
          : STELLAR_TESTNET_SERVER
      );
      try {
        transaction.sign(keypair);
        const sendResponse = await server.sendTransaction(transaction);

        const hsh = sendResponse.hash;

        if (sendResponse.status === "PENDING") {
          let getResponse = await server.getTransaction(sendResponse.hash);

          while (getResponse.status === "NOT_FOUND") {
            getResponse = await server.getTransaction(sendResponse.hash);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          if (getResponse.status === "SUCCESS") {
            if (!getResponse.resultMetaXdr) {
              return { status: true, msg: "" };
            }
            const returnValue = getResponse.returnValue;
            return { status: true, value: returnValue, hash: hsh };
          } else {
            return { status: false, msg: "Transaction failed" };
          }
        } else {
          return { status: false, msg: "Unable to submit transaction" };
        }
      } catch (err) {
        console.log(err);
        return { status: false, msg: err.message };
      }
    }
  }

  static isValidStellarAddress(address: string) {
    return StellarBase.StrKey.isValidEd25519PublicKey(address);
  }

  static async receivePaymentPath(params: any) {
    try {
      const {
        sourceAssetCode,
        sourceAssetIssuer,
        desAssetCode,
        desAssetIssuer,
        amount,
      } = params;

      let url = `${
        STELLAR_NETWORK === "public" ? HORIZON_MAINNET_URL : HORIZON_TESTNET_URL
      }/paths/strict-receive`;

      url += `?source_assets=${
        sourceAssetIssuer === "native"
          ? "native"
          : sourceAssetCode + ":" + sourceAssetIssuer
      }&destination_asset_type=${
        desAssetIssuer === "native"
          ? "native"
          : desAssetCode.length <= 4
          ? "credit_alphanum4"
          : "credit_alphanum12"
      }&destination_amount=${amount}`;

      if (desAssetIssuer !== "native")
        url += `&destination_asset_issuer=${desAssetIssuer}&destination_asset_code=${desAssetCode}`;

      const resp = await fetch(url);
      if (resp.ok) {
        const resps = await resp.json();
        return (resps._embedded || {}).records || [];
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  static async sendPaymentPath(params: any) {
    try {
      const {
        sourceAssetCode,
        sourceAssetIssuer,
        desAssetCode,
        desAssetIssuer,
        amount,
      } = params;

      let url = `${
        STELLAR_NETWORK === "public" ? HORIZON_MAINNET_URL : HORIZON_TESTNET_URL
      }/paths/strict-send`;

      url += `?destination_assets=${
        desAssetIssuer === "native"
          ? "native"
          : desAssetCode + "%3A" + desAssetIssuer
      }&source_asset_type=${
        sourceAssetIssuer === "native"
          ? "native"
          : sourceAssetCode.length <= 4
          ? "credit_alphanum4"
          : "credit_alphanum12"
      }&source_source_amount=${amount}`;

      if (sourceAssetIssuer !== "native")
        url += `&source_asset_issuer=${sourceAssetIssuer}&source_asset_code=${sourceAssetCode}`;

      const resp = await fetch(url);

      if (resp.ok) {
        const resps = await resp.json();
        return (resps._embedded || {}).records || [];
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
