import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AdminTaskService } from "./task.service";
import { HttpResponse } from "../../../../common/helpers/response-handler.helper";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateTaskDTO,
  TaskByIdDTO,
} from "src/common/dto/referralProgram/task.dto";
import { AdminGuard } from "src/common/guards/admin.guard";
import { EmailVerificationGuard } from "src/common/guards/emailverification.guard";

@Controller("admin/referralProgram")
@ApiTags("admin")
@ApiSecurity("Api-Key")
@ApiBearerAuth("JWT-auth")
@UseGuards(AdminGuard)
export class AdminTaskController {
  constructor(private readonly taskService: AdminTaskService) {}

  @Get("task-enum")
  @HttpCode(200)
  @ApiOperation({ summary: "Get all task enums" })
  async getTasksEnum() {
    const response = await this.taskService.getTasksEnum();
    return HttpResponse.send("Task enums retrieved", response);
  }

  @Post("create-task")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Create task" })
  async createTask(@Body() body: CreateTaskDTO) {
    const response = await this.taskService.createTask(body);
    return HttpResponse.send("Task created successfully", response);
  }

  @Put("update-task/:taskId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Update a task" })
  async updateTask(
    @Body() body: CreateTaskDTO,
    @Param() param: TaskByIdDTO
  ) {
    const response = await this.taskService.updateTask(body, param);
    return HttpResponse.send("Task updated successfully", response);
  }

  @Delete("delete-task/:taskId")
  @HttpCode(200)
  @UseGuards(EmailVerificationGuard)
  @ApiOperation({ summary: "Delete a task" })
  async deleteTask(@Param() param: TaskByIdDTO) {
    await this.taskService.deleteTask(param);
    return HttpResponse.send("Task deleted successfully");
  }
}
