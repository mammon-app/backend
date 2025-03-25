import { Module } from "@nestjs/common";
import { Task, TaskSchema } from "src/schemas/task.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { UserTask, UserTaskSchema } from "src/schemas/user-task.schema";
import { InternalCacheModule } from "../../../internal-cache/internal-cache.module";
import { MongooseModule } from "@nestjs/mongoose";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: UserTask.name,
        schema: UserTaskSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    InternalCacheModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
