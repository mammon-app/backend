import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { HttpResponse } from "../../../common/helpers/response-handler.helper";
import { AuthGuard } from "../../../common/guards/auth.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { GetUser } from "src/common/decorator/get-user.decorator";
import { IUser } from "src/common/interfaces/user.interface";
import {
  CompleteTaskDTO,
  TaskIdParamDTO,
} from "src/common/dto/referralProgram/task.dto";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";
import { PaginateDto } from "src/common/dto/paginate.dto";

@Controller("referralProgram")
@ApiTags("Referral Program")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get("task")
  @HttpCode(200)
  @ApiOperation({ summary: "Get all tasks" })
  async getTiers(@Query() query: PaginateDto) {
    const response = await this.taskService.getTasks(query);
    return HttpResponse.send("Tasks retrieved", response);
  }

  @Post("complete-task/:taskId")
  @HttpCode(200)
  @ApiOperation({ summary: "Complete task" })
  @UseGuards(EmailVerificationGuard)
  async completeTask(
    @GetUser() account: IUser,
    @Body() body: CompleteTaskDTO,
    @Param() param: TaskIdParamDTO
  ) {
    const response = await this.taskService.completeTask(account, body, param);
    return HttpResponse.send("Task completed successfully", response);
  }

  @Post("complete-profile-setup-task")
  @HttpCode(200)
  @ApiOperation({ summary: "Complete profile setup task" })
  @UseGuards(EmailVerificationGuard)
  async completeProfileSetupTask(@GetUser() account: IUser) {
    const response = await this.taskService.completeProfileSetupTask(account);
    return HttpResponse.send("Task completed successfully", response);
  }
  // @Post("complete-twitter-task")
  // @HttpCode(200)
  // @ApiOperation({ summary: "Complete twitter setup task" })
  // @UseGuards(EmailVerificationGuard)
  // async completeTwitterTask(
  //   @GetUser() account: IUser,
  //   @Body() body: TwitterTaskDTO
  // ) {
  //   const response = await this.taskService.completeTwitterTask(account, body);
  //   return HttpResponse.send(" Task completed successfully", response);
  // }
}
