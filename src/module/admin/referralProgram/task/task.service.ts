import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IServiceResponse } from "../../../../common/interfaces/service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Task } from "src/schemas/task.schema";
import {
  CreateTaskDTO,
  TaskByIdDTO,
} from "src/common/dto/referralProgram/task.dto";
import { TaskEnum } from "src/common/enum/referralProgram/task.enum";

@Injectable()
export class AdminTaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>
  ) {}

  async getTasksEnum(): Promise<IServiceResponse> {
    return {
      data: Object.values(TaskEnum),
    };
  }

  async deleteTask(param: TaskByIdDTO) {
    const task = await this.taskModel.findById(param.taskId, "_id").lean();
    if (!task) throw new NotFoundException("Task not found");

    await this.taskModel.findByIdAndDelete(param.taskId);
    return;
  }

  async createTask(payload: CreateTaskDTO): Promise<IServiceResponse> {
    if (!Object.values(TaskEnum).includes(payload.name))
      throw new BadRequestException("Invalid task name");

    const task = await this.taskModel.findOne({ name: payload.name });
    if (task) throw new BadRequestException("Task already exists");
    if (payload.xp <= 0)
      throw new BadRequestException("Task XP must be above 0");

    const newTask = await new this.taskModel(payload).save();
    return {
      data: { newTask },
    };
  }

  async updateTask(
    payload: CreateTaskDTO,
    param: TaskByIdDTO
  ): Promise<IServiceResponse> {
    const [task, existingTask] = await Promise.all([
      this.taskModel.findOne({ name: payload.name }),
      this.taskModel.findById(param.taskId).lean(),
    ]);

    if (!existingTask) throw new NotFoundException("Task not found");
    if (!Object.values(TaskEnum).includes(payload.name))
      throw new BadRequestException("Invalid task name");
    if (task) throw new BadRequestException("Task already exists");
    if (payload.xp <= 0)
      throw new BadRequestException("Task XP must be above 0");

    const updatedTask = await this.taskModel.findByIdAndUpdate(
      param.taskId,
      {
        $set: {
          name: payload.name,
          description: payload.description,
          xp: payload.xp,
          url: payload.url,
        },
      },
      { new: true }
    );
    return {
      data: { updatedTask },
    };
  }
}
