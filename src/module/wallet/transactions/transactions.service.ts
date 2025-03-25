import { PaginateDto } from "./../../../common/dto/paginate.dto";
import {
  ChangeTrustLineDTO,
  PaymentDTO,
  StrictSendAndReceiveDTO,
  SwapDTO,
} from "src/common/dto/wallet.dto";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { IUser } from "src/common/interfaces/user.interface";
import StellarSdk from "@stellar/stellar-sdk";
import {
  APP_NAME,
  EMAIL_USERNAME,
  FEE,
  HORIZON_MAINNET_URL,
  STELLAR_NETWORK,
  STELLAR_PUBLIC_SERVER,
  STELLAR_TESTNET_SERVER,
  TIMEOUT,
} from "src/config/env.config";
import { WalletDecryption } from "src/common/helpers/encryption-decryption.helper";
import { WalletHelper } from "src/common/helpers/wallet.helper";
import { PUBLIC_ASSETS, TESTNET_ASSETS } from "src/common/assets";
import { Networks, Server } from "stellar-sdk";
import { WithdrawalEnum } from "src/common/enum";
import { ClientProxy } from "@nestjs/microservices";
import {
  DEV_RABBITMQ_NOTIFICATION,
  NODE_ENV,
  PRODUCTION_RABBITMQ_NOTIFICATION,
} from "src/config/env.config";

@Injectable()
export class TransactionsService {
  private readonly server: any;

  /**
   * Constructs a new instance of the TransactionsService.
   */
  constructor(
    @Inject(
      NODE_ENV === "development"
        ? DEV_RABBITMQ_NOTIFICATION
        : PRODUCTION_RABBITMQ_NOTIFICATION
    )
    private readonly clientNotification: ClientProxy
  ) {
    // Initialize the server based on the network configuration.
    // Connect to the public Stellar network server if the network is public,
    // otherwise connect to the testnet server.
    this.server = new StellarSdk.SorobanRpc.Server(
      STELLAR_NETWORK === "public"
        ? STELLAR_PUBLIC_SERVER
        : STELLAR_TESTNET_SERVER
    );
  }

  

  /**
   * Changes the trustline for a given asset on the user's Stellar account.
   * @param payload - The ChangeTrustLineDTO object containing asset code and other details.
   * @param account - The IUser object representing the user's account information.
   * @returns An object containing the transaction XDR, network passphrase, and signed transaction.
   * @throws BadRequestException - Throws an exception if the trustline change operation fails.
   */
  async changeTrustline(payload: ChangeTrustLineDTO, account: IUser) {
    // Create the asset object using the provided asset code and the corresponding issuer.
    const asset = new StellarSdk.Asset(
      payload.assetCode,
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.assetCode].issuer
        : TESTNET_ASSETS[payload.assetCode].issuer
    );


    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );


    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );



    // Construct a transaction to change the trustline for the specified asset.
    const transaction = await new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: Number(FEE), // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the change trust operation to the transaction.
        StellarSdk.Operation.changeTrust({
          asset: asset,
          source: account.stellarPublicKey,
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.



    // Sign the transaction using the user's decrypted private key.
    const signedTransaction = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );

    if (!signedTransaction.status) {
      throw new BadRequestException(signedTransaction.msg);
    }
    // Return the transaction details, network passphrase, and signed transaction.
    return {
      data: {
        transaction: transaction.toXDR(),
        network_passphrase:
          STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
        signedTransaction,
      },
    };
  }

  /**
   * Removes a trustline for a given asset on the user's Stellar account.
   * @param payload - The ChangeTrustLineDTO object containing asset code and other details.
   * @param account - The IUser object representing the user's account information.
   * @returns An object containing the transaction XDR, network passphrase, and signed transaction.
   * @throws BadRequestException - Throws an exception if the trustline removal operation fails.
   */
  async removeTrustline(payload: ChangeTrustLineDTO, account: IUser) {
    // Create the asset object using the provided asset code and the corresponding issuer.
    const asset = new StellarSdk.Asset(
      payload.assetCode,
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.assetCode].issuer
        : TESTNET_ASSETS[payload.assetCode].issuer
    );

    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );

    // Construct a transaction to remove the trustline for the specified asset.
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: Number(FEE), // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the change trust operation to the transaction with a limit of '0' to remove the trustline.
        StellarSdk.Operation.changeTrust({
          asset: asset,
          source: account.stellarPublicKey,
          limit: "0",
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.

    // Sign the transaction using the user's decrypted private key.
    const signedTransaction = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );
    if (!signedTransaction.status)
      throw new BadRequestException(signedTransaction.msg);

    // Return the transaction details, network passphrase, and signed transaction.
    return {
      data: {
        transaction: transaction.toXDR(),
        network_passphrase:
          STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
        signedTransaction,
      },
    };
  }

  /**
   * Initiates a payment transaction on the Stellar network.
   * @param payload - The PaymentDTO object containing payment details.
   * @param account - The IUser object representing the user's account information.
   * @returns An object containing the transaction hash.
   * @throws BadRequestException - Throws an exception if the destination address is invalid.
   */
  async payment(payload: PaymentDTO, account: IUser) {
    // Ensure the asset code is in uppercase.
    payload.assetCode = payload.assetCode.toUpperCase();

    // Validate the destination Stellar address.
    if (payload.address === account.stellarPublicKey)
      throw new BadRequestException(
        "Sender and receiver address cannot be the same."
      );
    if (!WalletHelper.isValidStellarAddress(payload.address))
      throw new BadRequestException("Invalid address");

    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    // Determine the asset to be used for the payment.
    const asset =
      payload.assetCode !== "NATIVE"
        ? new StellarSdk.Asset(
            payload.assetCode,
            STELLAR_NETWORK === "public"
              ? PUBLIC_ASSETS[payload.assetCode].issuer
              : TESTNET_ASSETS[payload.assetCode].issuer
          )
        : StellarSdk.Asset.native(); // Use the native asset if assetCode is 'NATIVE'.

    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );

    // Construct a payment transaction.
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: FEE, // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the payment operation to the transaction.
        StellarSdk.Operation.payment({
          asset: asset,
          destination: payload.address, // Set the destination address for the payment.
          amount: payload.amount.toString(), // Set the payment amount.
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.
    // Sign the transaction using the user's decrypted private key.
    const resp = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );

    if (!resp.status) throw new BadRequestException(resp.msg);
    const timestamp = Date.now();
    const date = new Date(timestamp);

    const formattedDate = date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    this.clientNotification.emit("send:withdrawal:email", {
      to: account.primaryEmail,
      subject: `New Withdrawal Confirmation`,
      appName: APP_NAME,
      username: account.username,
      amount: payload.amount,
      currency: payload.assetCode,
      userAddress: account.stellarPublicKey,
      receiverAddress: payload.address,
      txHash: resp.hash,
      txDate: formattedDate,
    });

    if (payload.currencyType === WithdrawalEnum.FIAT) {
      this.clientNotification.emit("send:fait:withdrawal:email", {
        to: EMAIL_USERNAME,
        subject: `New Withdrawal Request`,
        appName: APP_NAME,
        username: account.username,
        email: account.primaryEmail,
        amount: payload.amount,
        currency: payload.assetCode,
        userAddress: account.stellarPublicKey,
        receiverAddress: payload.address,
        txHash: resp.hash,
        accountNumber: payload.accountNumber,
        accountName: payload.accountName,
        bankName: payload.bankName,
        txDate: formattedDate,
      });
    }
    // Return the transaction hash.
    return { data: { hash: resp.hash } };
  }

  async swap(payload: SwapDTO, account: IUser) {
    // Ensure the slippage value is a number.
    payload.slippage *= 1;

    // Determine the source asset issuer based on the network configuration.
    const sourceAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.sourceAssetCode].issuer
        : TESTNET_ASSETS[payload.sourceAssetCode].issuer;

    // Determine the destination asset issuer based on the network configuration.
    const desAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.desAssetCode].issuer
        : TESTNET_ASSETS[payload.desAssetCode].issuer;

    // Find the payment path from the source asset to the destination asset.
    const paths = await WalletHelper.sendPaymentPath({
      sourceAssetCode: payload.sourceAssetCode,
      sourceAssetIssuer,
      desAssetCode: payload.desAssetCode,
      desAssetIssuer,
      amount: payload.sourceAmount,
    });

    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    // Calculate the destination amount based on the provided amount or the paths.
    const desAmount =
      payload.sourceAmount ||
      paths.filter(
        (pth: any) =>
          pth.destination_asset_type === desAssetIssuer ||
          payload.desAssetCode.startsWith(pth.destination_asset_code)
      )[0].payload.desAmount;

    // Create the source asset object.
    const sourceAsset =
      payload.sourceAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.sourceAssetCode, sourceAssetIssuer)
        : StellarSdk.Asset.native();

    // Create the destination asset object.
    const desAsset =
      payload.desAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.desAssetCode, desAssetIssuer)
        : StellarSdk.Asset.native();

    // Calculate the minimum destination amount considering the slippage.
    const destMin = (
      ((100 - payload.slippage) * parseFloat(desAmount)) /
      100
    ).toFixed(7);

    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );

    // Construct the strict send payment transaction.
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: FEE, // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the path payment strict send operation to the transaction.
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset, // Set the source asset.
          sendAmount: payload.sourceAmount.toString(), // Set the source amount.
          destination: account.stellarPublicKey, // Set the destination address.
          destAsset: desAsset, // Set the destination asset.
          destMin: "0.0000001", // Set the minimum destination amount.
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.
    // Sign the transaction using the user's decrypted private key.
    const resp = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );
    if (!resp.status) throw new BadRequestException(resp.msg);

    // Return the transaction hash.
    return { data: { hash: resp.hash } };
  }

  async strictSend(payload: StrictSendAndReceiveDTO, account: IUser) {
    // Ensure the slippage value is a number.
    payload.slippage *= 1;

    // Validate the destination Stellar address.
    if (!WalletHelper.isValidStellarAddress(payload.desAddress))
      throw new BadRequestException("Invalid Address");

    // Determine the source asset issuer based on the network configuration.
    const sourceAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.sourceAssetCode].issuer
        : TESTNET_ASSETS[payload.sourceAssetCode].issuer;

    // Determine the destination asset issuer based on the network configuration.
    const desAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.desAssetCode].issuer
        : TESTNET_ASSETS[payload.desAssetCode].issuer;

    // Find the payment path from the source asset to the destination asset.
    const paths = await WalletHelper.sendPaymentPath({
      sourceAssetCode: payload.sourceAssetCode,
      sourceAssetIssuer,
      desAssetCode: payload.desAssetCode,
      desAssetIssuer,
      amount: payload.sourceAmount,
    });

    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    // Calculate the destination amount based on the provided amount or the paths.
    const desAmount =
      payload.desAmount ||
      paths.filter(
        (pth: any) =>
          pth.destination_asset_type === desAssetIssuer ||
          payload.desAssetCode.startsWith(pth.destination_asset_code)
      )[0].payload.desAmount;

    // Create the source asset object.
    const sourceAsset =
      payload.sourceAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.sourceAssetCode, sourceAssetIssuer)
        : StellarSdk.Asset.native();

    // Create the destination asset object.
    const desAsset =
      payload.desAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.desAssetCode, desAssetIssuer)
        : StellarSdk.Asset.native();

    // Calculate the minimum destination amount considering the slippage.
    const destMin = (
      ((100 - payload.slippage) * parseFloat(desAmount)) /
      100
    ).toFixed(7);

    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );

    // Construct the strict send payment transaction.
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: FEE, // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the path payment strict send operation to the transaction.
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset, // Set the source asset.
          sendAmount: payload.sourceAmount.toString(), // Set the source amount.
          destination: payload.desAddress, // Set the destination address.
          destAsset: desAsset, // Set the destination asset.
          destMin: "0.0000001", // Set the minimum destination amount.
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.
    // Sign the transaction using the user's decrypted private key.

    const resp = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );
    if (!resp.status) throw new BadRequestException(resp.msg);

    // Return the transaction hash.
    return { data: { hash: resp.hash } };
  }

  /**
   * Executes a strict receive payment on the Stellar network.
   * @param payload - The StrictSendAndReceiveDTO object containing transaction details.
   * @param account - The IUser object representing the user's account information.
   * @returns An object containing the transaction response.
   * @throws BadRequestException - Throws an exception if the destination address is invalid.
   */
  async strictReceive(payload: StrictSendAndReceiveDTO, account: IUser) {
    // Ensure the slippage value is a number.
    payload.slippage *= 1;

    // Validate the destination Stellar address.
    if (!WalletHelper.isValidStellarAddress(payload.desAddress))
      throw new BadRequestException("Invalid Address");

    // Determine the source asset issuer based on the network configuration.
    const sourceAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.sourceAssetCode].issuer
        : TESTNET_ASSETS[payload.sourceAssetCode].issuer;

    // Determine the destination asset issuer based on the network configuration.
    const desAssetIssuer =
      STELLAR_NETWORK === "public"
        ? PUBLIC_ASSETS[payload.desAssetCode].issuer
        : TESTNET_ASSETS[payload.desAssetCode].issuer;

    // Extract the hashed password from the account object.
    const hashedPassword = account.password;

    // Decrypt the user's private key using their encrypted private key,
    // primary email, hashed password, and pin code.
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${hashedPassword}${account.pinCode}`
    );

    // Find the payment path from the source asset to the destination asset.
    const paths = await WalletHelper.receivePaymentPath({
      sourceAssetCode: payload.sourceAssetCode,
      sourceAssetIssuer,
      desAssetCode: payload.desAssetCode,
      desAssetIssuer,
      amount: payload.desAmount,
    });

    // Calculate the source amount based on the provided amount or the paths.
    const sourceAmount =
      payload.sourceAmount ||
      paths.filter(
        (pth: any) =>
          pth.source_asset_type === sourceAssetIssuer ||
          payload.sourceAssetCode.startsWith(pth.source_asset_code)
      )[0].payload.sourceAmount;

    // Create the source asset object.
    const sourceAsset =
      payload.sourceAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.sourceAssetCode, sourceAssetIssuer)
        : StellarSdk.Asset.native();

    // Create the destination asset object.
    const desAsset =
      payload.desAssetCode !== "NATIVE"
        ? new StellarSdk.Asset(payload.desAssetCode, desAssetIssuer)
        : StellarSdk.Asset.native();

    // Calculate the maximum amount to send considering the slippage.
    const sendMax = (
      (100 * parseFloat(sourceAmount)) /
      (100 - payload.slippage)
    ).toFixed(7);

    // Fetch the source account details from the Stellar network using the user's public key.
    const sourceAccount = await this.server.getAccount(
      account.stellarPublicKey
    );

    // Construct the strict receive payment transaction.
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: FEE, // Set the transaction fee.
      // Set the network passphrase based on the network configuration.
      networkPassphrase:
        STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET,
    })
      .addOperation(
        // Add the path payment strict receive operation to the transaction.
        StellarSdk.Operation.pathPaymentStrictReceive({
          sendAsset: sourceAsset, // Set the source asset.
          sendMax: "0.0000001", // Set the maximum amount to send.
          destination: payload.desAddress, // Set the destination address.
          destAsset: desAsset, // Set the destination asset.
          destAmount: payload.desAmount.toString(), // Set the destination amount.
        })
      )
      .setTimeout(TIMEOUT) // Set the transaction timeout.
      .build(); // Build the transaction.

    // Sign the transaction using the user's decrypted private key.
    const resp = await WalletHelper.execTranst(
      transaction,
      StellarSdk.Keypair.fromSecret(decryptedPrivateKey)
    );
    if (!resp.status) throw new BadRequestException(resp.msg);

    // Return the transaction response.
    return { data: { hash: resp.hash } };
  }

  /**
   * Retrieves transactions for a given user account from the Stellar network.
   *
   * @param {IUser} account - The user account object containing the Stellar public key.
   * @returns {Promise<{data: {transactions: any[]}}>} - A promise that resolves to an object containing transaction data.
   * @throws {BadRequestException} - If the transaction fetch request fails.
   */
  async getTransactions(account: IUser) {
    try {
      // Fetch transactions for the given Stellar account from the Horizon server
      const response = await fetch(
        `${HORIZON_MAINNET_URL}/accounts/${account.stellarPublicKey}/transactions`
      );

      // Check if the response is successful, otherwise throw an exception
      if (!response.ok) {
        throw new BadRequestException("Failed to fetch transactions");
      }

      // Parse the JSON response to get transaction data
      const data = await response.json();
      const transactions = data._embedded.records;

      // Initialize the Stellar SDK server
      const server = new Server(HORIZON_MAINNET_URL);
      const allOperations = [];

      // Iterate through each transaction to fetch its operations
      for (const tx of transactions) {
        const operationsResponse = await server
          .operations()
          .forTransaction(tx.id)
          .call();
        const operations = operationsResponse.records;

        // Collect all operations into a single array
        operations.forEach(() => {
          allOperations.push(...operations);
        });
      }

      // Return the collected operations as transaction data
      return { data: { transactions: allOperations } };
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }
}
