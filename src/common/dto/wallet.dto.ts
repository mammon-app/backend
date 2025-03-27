import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { WithdrawalEnum } from "../enum";

export class FundTestnetWalletDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;
}
export class WalletAssetParamDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currencyType: string;
}
export class GenerateNewWalletKeyPairDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;
}
export class WalletPinDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;
}
export class TransferXLMTokenDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  receiverPublicKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  amount: string;
}
export class GetChallengeTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pinCode: number;
}

export class ChangeTrustLineDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetCode: string;
}
export class CreateCreateAccountTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  memo: string;
}
export class CreatePaymentTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  asset: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;

  @ApiProperty()
  @IsOptional()
  memo: any;
}
export class CreateChangeTrustTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  asset: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit: number;
}
export class CreatePathPaymentStrictSendOrReceiveTransactionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sourceAsset: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sourceAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  destinationAsset: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  destinationAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pin: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  memo: string;
}
export class FetchAssetsDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  assetCode: string;
}
export class PaymentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: "The type of transaction",
    enum: WithdrawalEnum,
    enumName: "WithdrawalEnum",
    example: "crypto or fiat",
  })
  @IsNotEmpty()
  @IsEnum(WithdrawalEnum)
  currencyType: WithdrawalEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: "" })
  @IsOptional()
  accountNumber: string;

  @ApiProperty({ example: "" })
  @IsOptional()
  accountName: string;

  @ApiProperty({ example: "" })
  @IsOptional()
  bankName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  transactionDetails: any;
}

export class GetPathDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sourceAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  desAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  txType: string;
}
export class StrictSendAndReceiveDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sourceAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  desAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  desAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sourceAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  desAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  slippage: number;
}
export class QueryTransfersSep24DTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetCode: string;
}
export enum SearchType {
  STELLAR_PUBLIC_KEY = "stellarPublicKey",
  USERNAME = "username",
  PRIMARY_EMAIL = "primaryEmail",
  COUNTRY = "country",
  MAMMONAPP_ID = "mammonappId",
}

export class FetchUserDetailsWithInputDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  input: string;

  @ApiProperty({
    description: "The field to search by",
    enum: SearchType,
    enumName: "SearchType",
    example: "stellarPublicKey, username, primaryEmail, country or mammonappId",
  })
  @IsNotEmpty()
  @IsEnum(SearchType)
  searchType: SearchType;
}
export class InitiateTransfersSep24DTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @IsNotEmpty()
  @ApiProperty({ example: "deposit or withdraw" })
  @IsString()
  txType: string;
}
export class SwapDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sourceAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  desAssetCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sourceAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  slippage: number;
}
