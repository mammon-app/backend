import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { TierEnum } from "src/common/enum/referralProgram/tier.enum";

export class CreateTierDTO {
  @ApiProperty({ type: String, enum: TierEnum })
  @IsString()
  @IsNotEmpty()
  name: TierEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  minXp: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxXp: number;
}

export class DeleteTierByIdDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tierId: string;
}

export class UpdateTierDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tierId: string;
}
