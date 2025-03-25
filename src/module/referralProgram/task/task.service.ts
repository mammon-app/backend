import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IUser } from "../../../common/interfaces/user.interface";
import { IServiceResponse } from "../../../common/interfaces/service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Task } from "src/schemas/task.schema";
import { UserTask } from "src/schemas/user-task.schema";
import { User } from "src/schemas/user.schema";
import { TaskIdParamDTO } from "src/common/dto/referralProgram/task.dto";
import { TWITTER_HANDLE } from "src/config/env.config";
import { TwitterHelper } from "src/common/helpers/twitter.helper";
import { CompleteTaskDTO } from "src/common/dto/referralProgram/task.dto";
import { PaginateDto } from "src/common/dto/paginate.dto";
import { TaskEnum } from "src/common/enum/referralProgram/task.enum";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(UserTask.name) private readonly userTaskModel: Model<UserTask>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async getTasks(query: PaginateDto): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;

    const tasks = await this.taskModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limitPerPage)
      .lean();
    if (!tasks) throw new NotFoundException("No teir found");
    return {
      data: tasks,
    };
  }

  async completeTask(
    account: IUser,
    body: CompleteTaskDTO,
    param: TaskIdParamDTO
  ): Promise<IServiceResponse> {
    const [user, task, userTask] = await Promise.all([
      this.userModel
        .findById(account._id)
        .select("-password -encryptedPrivateKey"),
      this.taskModel.findById(param.taskId),
      this.userTaskModel
        .findOne({ user: new Types.ObjectId(account._id) })
        .lean(),
    ]);

    if (!user) throw new NotFoundException("User not found");
    if (!userTask.is_completed)
      throw new NotFoundException("Please complete the task to claim point.");
    if (!task) throw new NotFoundException("Task not found");

    // check if the task if twitter task
    // if (task.name === TaskEnum.FollowOfficialTwitterAccount) {
    //   // use twitter helper
    //   const isFollowing = await TwitterHelper.checkIfUserFollowsUser(
    //     body.twitterHandle,
    //     TWITTER_HANDLE
    //   );
    //   if (!isFollowing) {
    //     throw new BadRequestException(
    //       `You are not following ${TWITTER_HANDLE} on Twitter`
    //     );
    //   }

    //   await this.userTaskModel.create({
    //     user: user._id,
    //     task: task._id,
    //     completed: true,
    //   });
    //   user.xp += task.xp;
    //   await user.save();
    //   return;
    // }
    // return that task isn't activated yet
    // throw new BadRequestException("Task isn't activated yet");

    await this.userTaskModel.create({
      user: user._id,
      task: task._id,
      completed: true,
    });
    user.xp += task.xp;
    await user.save();
    return;
  }

  async completeProfileSetupTask(account: IUser): Promise<IServiceResponse> {
    const [user, task, userTask] = await Promise.all([
      this.userModel
        .findById(account._id)
        .select("-password -encryptedPrivateKey"),
      this.taskModel.findOne({
        name: TaskEnum.CompleteProfileSetup,
      }),
      this.userTaskModel
        .findOne({ user: new Types.ObjectId(account._id) })
        .lean(),
    ]);

    if (!user) throw new NotFoundException("User not found");
    if (!userTask.is_completed)
      throw new NotFoundException("Please complete the task to claim point.");
    if (!task) throw new NotFoundException("Task not found");

    this.userTaskModel.create({
      user: user._id,
      task: task._id,
      completed: true,
    });
    user.xp += task.xp;
    await user.save();

    return;
  }

  // async completeTwitterTask(
  //   account: IUser,
  //   body: TwitterTaskDTO
  // ): Promise<IServiceResponse> {
  //   const [user, isFollowing, task] = await Promise.all([
  //     this.userModel
  //       .findById(account._id)
  //       .select("-password -encryptedPrivateKey"),
  //     TwitterHelper.checkIfUserFollowsUser(body.twitter_handle, TWITTER_HANDLE),
  //     this.taskModel.findOne({
  //       name: TaskEnum.FollowOfficialTwitterAccount,
  //     }),
  //   ]);

  //   if (!user) throw new NotFoundException("User not found");
  //   if (!task) throw new NotFoundException("Task not found");

  //   if (!isFollowing)
  //     throw new BadRequestException(
  //       `You are not following ${TWITTER_HANDLE} on Twitter`
  //     );

  //   await this.userTaskModel.create({
  //     user: user._id,
  //     task: task._id,
  //     completed: true,
  //   });
  //   user.xp += task.xp;
  //   await user.save();
  //   return;
  // }
}
