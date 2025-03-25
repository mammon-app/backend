import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { TaskEnum } from "src/common/enum/referralProgram/task.enum";

export class CreateTaskDTO {
  @ApiProperty({ type: String, enum: TaskEnum })
  @IsString()
  @IsNotEmpty()
  name: TaskEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  xp: number;

  @ApiProperty({
    description: "The URL of the resource",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CompleteTaskDTO {
  @ApiProperty()
  @IsOptional()
  twitterHandle?: string;
}
export class TaskIdParamDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskId: string;
}

export class TwitterTaskDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Transform((params) => params.value.toLowerCase())
  twitter_handle: string;
}
export class TaskByIdDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskId: string;
}
