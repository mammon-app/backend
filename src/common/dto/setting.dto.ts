import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) for managing user preferences regarding
 * product announcements. Determines whether the user wishes to receive
 * notifications about new products or announcements.
 */
export class AllowProductAnnoucementDTO {
  @IsNotEmpty()
  @ApiProperty()
  productAnnoucement: boolean;
}

/**
 * Data Transfer Object (DTO) for managing user preferences regarding
 * account activity notifications. Controls whether the user wants to be
 * notified about activities or changes related to their account.
 */
export class AllowAccountActivityDto {
  @IsNotEmpty()
  @ApiProperty()
  accountActivity: boolean;
}

/**
 * Data Transfer Object (DTO) for managing user preferences regarding
 * messages or chat notifications. Specifies whether the user prefers
 * to receive notifications for new messages or chats.
 */
export class AllowMessagesDto {
  @IsNotEmpty()
  @ApiProperty()
  messages: boolean;
}

/**
 * Data Transfer Object (DTO) for managing user preferences regarding
 * insights and tips notifications. Determines if the user wants to
 * receive notifications containing insights, tips, or recommendations.
 */
export class AllowInsightsTipsDto {
  @IsNotEmpty()
  @ApiProperty()
  insightsTips: boolean;
}

/**
 * Data Transfer Object (DTO) for managing user preferences regarding
 * network fee alerts. Specifies whether the user wants to receive
 * alerts about network fees or charges.
 */
export class AllowNetworkFeeAlertDto {
  @IsNotEmpty()
  @ApiProperty()
  networkFeeAlert: boolean;
}

/**
 * Data Transfer Object (DTO) representing user preferences for
 * screen settings or display preferences. Includes options for
 * customizing how content is displayed or presented on the screen.
 */
export class ScreenPreferenceDto {
  @IsNotEmpty()
  @ApiProperty()
  screenPreference: string;
}
