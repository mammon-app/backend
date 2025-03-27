import {
  CMC_PRO_API_KEY,
  HORIZON_MAINNET_URL,
  HORIZON_TESTNET_URL,
  STELLAR_NETWORK,
  STELLAR_TESTNET_SERVER,
} from "./../../../config/env.config";
import {
  FetchAssetsDTO,
  GetPathDTO,
  FetchUserDetailsWithInputDTO,
  WalletAssetParamDTO,
} from "src/common/dto/wallet.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import StellarSdk from "@stellar/stellar-sdk";
import { STELLAR_PUBLIC_SERVER } from "src/config/env.config";
import { IUser } from "src/common/interfaces/user.interface";
import { PUBLIC_ASSETS, TESTNET_ASSETS } from "src/common/assets";
import { WalletHelper } from "src/common/helpers/wallet.helper";
import { User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios from "axios";

/**
 * The `HorizonQueriesService` class provides methods to interact with the Stellar Horizon API
 * for querying assets, fetching asset paths, and retrieving wallet asset information. It is an
 * injectable service that utilizes environment configurations, external APIs, and custom helpers
 * for Stellar-related operations.
 */
@Injectable()
export class HorizonQueriesService {
  private readonly server: any;

  /**
   * Constructs an instance of `HorizonQueriesService` and initializes the Stellar server based on
   * the network configuration.
   */
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    // Initialize the Stellar server based on the network configuration
    this.server = new StellarSdk.SorobanRpc.Server(
      // Use the public or testnet server URL depending on the network configuration
      STELLAR_NETWORK === "public"
        ? STELLAR_PUBLIC_SERVER
        : STELLAR_TESTNET_SERVER
    );
  }

  async getNairaRate(targetCurrency = "NGN") {
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/fiat/map`,
        {
          method: "GET",
          headers: {
            "X-CMC_PRO_API_KEY": `${CMC_PRO_API_KEY}`,
          },
        }
      );

      const data = await response.json();

      const nairaData = data?.data?.find((currency) => currency.symbol === "NGN");
      if (!nairaData) throw new Error("Naira not found in CoinMarketCap data");

      const nairaId = nairaData.id;

      // Fetch the conversion rate of NGN to USD
      const conversionResponse = await fetch(
        `https://pro-api.coinmarketcap.com/v1/tools/price-conversion?amount=1&id=${nairaId}&convert=${targetCurrency}`,
        {
          method: "GET",
          headers: {
            "X-CMC_PRO_API_KEY": `${CMC_PRO_API_KEY}`,
          },
        }
      );

      const conversionData = await conversionResponse.json();

      if (
        conversionData &&
        conversionData.data &&
        conversionData.data.quote &&
        conversionData.data.quote.USD
      ) {
        const priceInSelectedCurreny = conversionData.data.quote.USD.price;

        return priceInSelectedCurreny;
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
    }
  }

  async getConversionRate(tokenList: any[], currencyType: string) {
    const tokens = tokenList.filter(
      (asset) => !asset.asset_code.startsWith("y")
    );
    await this.getNairaRate();
    const symbols = tokens
      .map((token) => {
        if (token.asset_code === "NATIVE") {
          return "XLM";
        } else if (token.asset_code === "NGNC") {
          return "NGN";
        } else {
          return token.asset_code.toUpperCase();
        }
      })
      .join(",");

    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=${currencyType
      .trim()
      .toUpperCase()}`;
    const usdUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`;
    const ngnUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=NGN`;
    const currencyUrl = `https://api.exchangerate-api.com/v4/latest/USD`;

    const headers = {
      "X-CMC_PRO_API_KEY": `${CMC_PRO_API_KEY}`,
    };

    const [response, usdResponse, ngnResponse, currencyRespose] =
      await Promise.all([
        fetch(url, { headers }),
        fetch(usdUrl, { headers }),
        fetch(ngnUrl, { headers }),
        fetch(currencyUrl, { headers }),
      ]);

    const [data, usdData, ngnData, currencyData] = await Promise.all([
      response.json(),
      usdResponse.json(),
      ngnResponse.json(),
      currencyRespose.json(),
    ]);
    tokenList.forEach((token) => {
      let assetCode = token.asset_code;
      if (assetCode.startsWith("y")) {
        assetCode = assetCode.substring(1);
      }

      const symbol =
        assetCode === "NATIVE"
          ? "XLM"
          : assetCode === "NGNC"
          ? "NGN"
          : assetCode.toUpperCase();

      if (data.data && data.data[symbol]) {
        const selectedCurrencyRate =
          data.data[symbol].quote[currencyType.trim().toUpperCase()].price;
        const usdRate = usdData.data[symbol].quote.USD.price;
        const ngnRate = ngnData.data[symbol].quote.NGN.price;

        token.equivalentBalanceInUsd =
          symbol === "NGN" || symbol === "GHS"
            ? token.balance / currencyData.rates[symbol]
            : usdRate * token.balance;
        token.equivalentBalanceInNgn = ngnRate * token.balance;
        token.equivalentBalanceInSelectedCurrency =
          selectedCurrencyRate * token.balance;
      } else {
        token.equivalentBalanceInUsd = 0;
        token.equivalentBalanceInNgn = 0;
        token.equivalentBalanceInSelectedCurrency = 0;
      }
    });

    const [
      allWalletTotalBalanceInSelectedCurrency,
      allWalletTotalBalanceInUsd,
      allWalletTotalBalanceInNgn,
      yieldAssets,
      nonYieldAssets,
    ] = await Promise.all([
      tokenList.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      tokenList.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
      tokenList.reduce(
        (total, token) => total + token.equivalentBalanceInNgn,
        0
      ),
      tokenList.filter((asset) => asset.asset_code.startsWith("y")),
      tokenList.filter((asset) => !asset.asset_code.startsWith("y")),
    ]);
    const [
      yieldWalletTotalBalanceInSelectedCurrency,
      yieldWalletTotalBalanceInUsd,
      yieldWalletTotalBalanceInNgn,
      nonYieldWalletTotalBalanceInSelectedCurrency,
      nonYieldWalletTotalBalanceInUsd,
      nonYieldWalletTotalBalanceInNgn,
    ] = await Promise.all([
      yieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      yieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
      yieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInNgn,
        0
      ),

      nonYieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      nonYieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
      nonYieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInNgn,
        0
      ),
    ]);

    return {
      data: {
        tokenList,
        allWalletTotalBalanceInSelectedCurrency,
        allWalletTotalBalanceInUsd,
        allWalletTotalBalanceInNgn,
        nonYieldWalletTotalBalanceInSelectedCurrency,
        nonYieldWalletTotalBalanceInUsd,
        yieldWalletTotalBalanceInSelectedCurrency,
        yieldWalletTotalBalanceInUsd,
        yieldWalletTotalBalanceInNgn,
        nonYieldWalletTotalBalanceInNgn,
      },
    };
  }

  /**
   * Retrieves all assets associated with a user's wallet from the Stellar Horizon API.
   * @param account The user account for which to fetch assets.
   * @returns An object containing the wallet assets data.
   * @throws BadRequestException if the request to the Horizon API fails.
   */
  async getAllWalletAssets(account: IUser, param: WalletAssetParamDTO) {
    // Construct the URL to fetch wallet assets from the Horizon API based on the network
    param.currencyType = param.currencyType.trim().toLowerCase();
    const url = `${
      STELLAR_NETWORK == "public" ? HORIZON_MAINNET_URL : HORIZON_TESTNET_URL
    }/accounts/${account.stellarPublicKey}`;

    // Fetch wallet assets data from the Horizon API
    const resp = await fetch(url);
    if (!resp.ok) throw new BadRequestException("Failed to get all assets");
    const walletAssets = await resp.json();

    // Process the fetched data and format the response
    const data = walletAssets.balances;
    const resData = [];

    for (let i = 0; i < data.length; i++) {
      const assetCode = data[i].asset_code || "NATIVE";
      const assetIssuer = data[i].asset_issuer || "native";

      let image: any;
      let assetName: any;
      let symbolId: any;
      if (assetIssuer === "native") {
        image = PUBLIC_ASSETS["NATIVE"].image;
        assetName = PUBLIC_ASSETS["NATIVE"].name;
        symbolId = PUBLIC_ASSETS["NATIVE"].symbolId;
      } else {
        image = PUBLIC_ASSETS[assetCode].image;
        assetName = PUBLIC_ASSETS[assetCode].name;
        symbolId = PUBLIC_ASSETS[assetCode].symbolId;
      }

      resData.push({
        asset_code: assetCode,
        asset_name: assetName,
        asset_issuer: assetIssuer,
        symbol_id: symbolId,
        balance: Number(data[i].balance),
        trust_limit: Number(data[i].limit || 0),
        image: image,
      });
    }

    const allAssets = await this.getConversionRate(resData, param.currencyType);

    const yieldAssets = allAssets.data.tokenList.filter((asset) =>
      asset.asset_code.startsWith("y")
    );
    const nonYieldAssets = allAssets.data.tokenList.filter(
      (asset) => !asset.asset_code.startsWith("y")
    );

    const sortedAllWalletAssets = allAssets.data.tokenList.sort((a, b) => {
      if (a.balance !== b.balance) {
        return b.balance - a.balance;
      }

      const aIsBitcoin = a.asset_code.toLowerCase() === "btc";
      const bIsBitcoin = b.asset_code.toLowerCase() === "btc";
      const aIsEthereum = a.asset_code.toLowerCase() === "eth";
      const bIsEthereum = b.asset_code.toLowerCase() === "eth";
      const aIsLumens = a.asset_code.toLowerCase() === "xlm";
      const bIsLumens = b.asset_code.toLowerCase() === "xlm";
      const aIsNaira = a.asset_code.toLowerCase() === "ngnc";
      const bIsNaira = b.asset_code.toLowerCase() === "ngnc";

      if (aIsBitcoin) return -1;
      if (bIsBitcoin) return 1;
      if (aIsEthereum) return aIsBitcoin ? 1 : -1;
      if (bIsEthereum) return bIsBitcoin ? -1 : 1;
      if (aIsLumens) return aIsBitcoin ? -1 : 1;
      if (bIsLumens) return bIsBitcoin ? 1 : -1;
      if (aIsNaira) return aIsBitcoin ? -1 : 1;
      if (bIsNaira) return bIsBitcoin ? 1 : -1;

      return a.asset_name.localeCompare(b.asset_name);
    });

    const sortedYieldAssets = yieldAssets.sort((a, b) => {
      if (a.balance !== b.balance) {
        return b.balance - a.balance;
      }

      const aIsBitcoin = a.asset_code.toLowerCase() === "btc";
      const bIsBitcoin = b.asset_code.toLowerCase() === "btc";
      const aIsEthereum = a.asset_code.toLowerCase() === "eth";
      const bIsEthereum = b.asset_code.toLowerCase() === "eth";
      const aIsLumens = a.asset_code.toLowerCase() === "xlm";
      const bIsLumens = b.asset_code.toLowerCase() === "xlm";
      const aIsNaira = a.asset_code.toLowerCase() === "ngnc";
      const bIsNaira = b.asset_code.toLowerCase() === "ngnc";

      if (aIsBitcoin) return -1;
      if (bIsBitcoin) return 1;
      if (aIsEthereum) return aIsBitcoin ? 1 : -1;
      if (bIsEthereum) return bIsBitcoin ? -1 : 1;
      if (aIsLumens) return aIsBitcoin ? -1 : 1;
      if (bIsLumens) return bIsBitcoin ? 1 : -1;
      if (aIsNaira) return aIsBitcoin ? -1 : 1;
      if (bIsNaira) return bIsBitcoin ? 1 : -1;

      return a.asset_name.localeCompare(b.asset_name);
    });
    const sortedNonYieldAssets = nonYieldAssets.sort((a, b) => {
      if (a.balance !== b.balance) {
        return b.balance - a.balance;
      }

      const aIsBitcoin = a.asset_code.toLowerCase() === "btc";
      const bIsBitcoin = b.asset_code.toLowerCase() === "btc";
      const aIsEthereum = a.asset_code.toLowerCase() === "eth";
      const bIsEthereum = b.asset_code.toLowerCase() === "eth";
      const aIsLumens = a.asset_code.toLowerCase() === "xlm";
      const bIsLumens = b.asset_code.toLowerCase() === "xlm";
      const aIsNaira = a.asset_code.toLowerCase() === "ngnc";
      const bIsNaira = b.asset_code.toLowerCase() === "ngnc";

      if (aIsBitcoin) return -1;
      if (bIsBitcoin) return 1;
      if (aIsEthereum) return aIsBitcoin ? 1 : -1;
      if (bIsEthereum) return bIsBitcoin ? -1 : 1;
      if (aIsLumens) return aIsBitcoin ? -1 : 1;
      if (bIsLumens) return bIsBitcoin ? 1 : -1;
      if (aIsNaira) return aIsBitcoin ? -1 : 1;
      if (bIsNaira) return bIsBitcoin ? 1 : -1;

      return a.asset_name.localeCompare(b.asset_name);
    });

    return {
      data: {
        currencyType: param.currencyType.trim().toUpperCase(),
        allWalletTotalBalanceInSelectedCurrency:
          allAssets.data.allWalletTotalBalanceInSelectedCurrency,
        allWalletTotalBalanceInUsd: allAssets.data.allWalletTotalBalanceInUsd,
        allWalletTotalBalanceInNgn: allAssets.data.allWalletTotalBalanceInNgn,
        yieldWalletTotalBalanceInSelectedCurrency:
          allAssets.data.yieldWalletTotalBalanceInSelectedCurrency,
        yieldWalletTotalBalanceInUsd:
          allAssets.data.yieldWalletTotalBalanceInUsd,
        yieldWalletTotalBalanceInNgn:
          allAssets.data.yieldWalletTotalBalanceInNgn,
        nonYieldWalletTotalBalanceInSelectedCurrency:
          allAssets.data.nonYieldWalletTotalBalanceInSelectedCurrency,
        nonYieldWalletTotalBalanceInUsd:
          allAssets.data.nonYieldWalletTotalBalanceInUsd,
        nonYieldWalletTotalBalanceInNgn:
          allAssets.data.nonYieldWalletTotalBalanceInNgn,
        allWalletAssets: sortedAllWalletAssets,
        yieldWalletAssets: sortedYieldAssets,
        nonYieldWalletAssets: sortedNonYieldAssets,
      },
    };
  }

  async getCurrenciesEquivalent(tokenList: any[], currencyType: string) {
    const symbols = tokenList
      .map((token) => token.symbol_id.toLowerCase())
      .join(",");


    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=${currencyType}`;
    const apiUsdUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`;
    const apiRateUrl = `https://api.coingecko.com/api/v3/exchange_rates`;

    // const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=${currencyType
    //   .trim()
    //   .toUpperCase()}`;
    // const headers = {
    //   "X-CMC_PRO_API_KEY": "bd8bf358-479a-4a34-86db-be50468d2962",
    // };

    // const response1 = await fetch(url, { headers });

    // const data = await response1.json();

    const [response, usdRateResponse, currencyRateResponse] = await Promise.all(
      [fetch(apiUrl), fetch(apiUsdUrl), axios.get(apiRateUrl)]
    );

    const [currencyRates, rates, usdRates] = await Promise.all([
      currencyRateResponse.data.rates,
      response.json(),
      usdRateResponse.json(),
    ]);

    const usdTokenRate = currencyRates.usd.value;
    const ngnTokenRate = currencyRates.ngn.value;
    const ngnVsUsdRate = ngnTokenRate / usdTokenRate;
    const selectedTokenRate = currencyRates[currencyType].value;
    const ngnVsSelectedToken = ngnTokenRate / selectedTokenRate;

    tokenList.forEach((token: any) => {
      const rate =
        rates[token.symbol_id.toLowerCase()]?.[currencyType.toLowerCase()];
      const usdRate = usdRates[token.symbol_id.toLowerCase()]?.usd;

      if (rate || currencyRates) {
        if (token.symbol_id === "ngn-coin") {
          token.rateInSelectedCurrency = ngnVsUsdRate;
          token.rateInUsd = usdRate;
          if (currencyType === "ngn") {
            token.equivalentBalanceInSelectedCurrency = token.balance;
          }
          token.equivalentBalanceInSelectedCurrency =
            token.balance / ngnVsSelectedToken;

          token.equivalentBalanceInUsd = token.balance / ngnVsUsdRate;
        } else {
          token.rateInSelectedCurrency = rate;
          token.rateInUsd = usdRate;
          token.equivalentBalanceInSelectedCurrency = token.balance * rate;
          token.equivalentBalanceInUsd = token.balance * usdRate;
        }
      } else {
        token.equivalentBalanceInSelectedCurrency = 0;
        token.rateInUsd = 0;
        token.rateInSelectedCurrency = 0;
        token.equivalentBalanceInUsd = 0;
      }
    });

    const [
      allWalletTotalBalanceInSelectedCurrency,
      allWalletTotalBalanceInUsd,
      yieldAssets,
      nonYieldAssets,
    ] = await Promise.all([
      tokenList.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      tokenList.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
      tokenList.filter((asset) => asset.asset_code.startsWith("y")),
      tokenList.filter((asset) => !asset.asset_code.startsWith("y")),
    ]);
    const [
      yieldWalletTotalBalanceInSelectedCurrency,
      yieldWalletTotalBalanceInUsd,
      nonYieldWalletTotalBalanceInSelectedCurrency,
      nonYieldWalletTotalBalanceInUsd,
    ] = await Promise.all([
      yieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      yieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
      nonYieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInSelectedCurrency,
        0
      ),
      nonYieldAssets.reduce(
        (total, token) => total + token.equivalentBalanceInUsd,
        0
      ),
    ]);

    return {
      data: {
        tokenList,
        allWalletTotalBalanceInSelectedCurrency,
        allWalletTotalBalanceInUsd,
        nonYieldWalletTotalBalanceInSelectedCurrency,
        nonYieldWalletTotalBalanceInUsd,
        yieldWalletTotalBalanceInSelectedCurrency,
        yieldWalletTotalBalanceInUsd,
      },
    };
  }

  async getAllTrustLines() {
    return { data: { trustLines: PUBLIC_ASSETS } };
  }

  /**
   * Retrieves the payment path between two assets using the Stellar Horizon API.
   * @param payload The payload containing path request details.
   * @returns An object containing the path data.
   */
  async getPath(payload: GetPathDTO) {
    // Determine the asset issuers based on the network configuration
    const sourceAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.sourceAssetCode].issuer
        : TESTNET_ASSETS[payload.sourceAssetCode].issuer;
    const desAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.desAssetCode].issuer
        : TESTNET_ASSETS[payload.desAssetCode].issuer;

    // Determine the type of transaction (send or receive) and fetch the payment path
    const paths =
      payload.txType === "receive"
        ? await WalletHelper.receivePaymentPath({
            sourceAssetCode: payload.sourceAssetCode,
            sourceAssetIssuer,
            desAssetCode: payload.desAssetCode,
            desAssetIssuer,
            amount: payload.amount,
          })
        : await WalletHelper.sendPaymentPath({
            sourceAssetCode: payload.sourceAssetCode,
            sourceAssetIssuer,
            desAssetCode: payload.desAssetCode,
            desAssetIssuer,
            amount: payload.amount,
          });

    return { data: { paths } };
  }

  /**
   * Fetches assets from the Stellar Expert API based on the search criteria.
   * @param payload The payload containing asset search criteria.
   * @returns An object containing the fetched asset records.
   */
  async fetchAssets(payload: FetchAssetsDTO) {
    // Fetch assets from the Stellar Expert API based on the search criteria
    const res = await fetch(
      `https://api.stellar.expert/explorer/${STELLAR_NETWORK}/asset?${new URLSearchParams(
        {
          search: payload.assetCode,
          sort: "rating",
          order: "desc",
          limit: "10",
          cursor: "0",
        }
      )}`
    );
    const json = await res.json();

    // Extract and return the asset records from the API response
    const records = json._embedded?.records;
    return { data: { records } };
  }

  async fetchUserDetailsWithInput(payload: FetchUserDetailsWithInputDTO) {
    const query = {
      [payload.searchType]: payload.input,
    };

    const user = await this.userModel
      .findOne(query, "userProfileUrl username primaryEmail country mammonappId")
      .lean();

    return { data: { user } };
  }
}
