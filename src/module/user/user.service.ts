import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IUser } from "../../common/interfaces/user.interface";
import { IServiceResponse } from "../../common/interfaces/service.interface";
import * as bcrypt from "bcryptjs";
import {
  UpdatePasswordDTO,
  UpdateProfileDTO,
  CreatePasswordDTO,
  ExportPrivateKeyDTO,
} from "src/common/dto/user.dto";
import { UpdateProfileImageDto } from "../../common/dto/user.dto";
import { User } from "src/schemas/user.schema";
import { Referral } from "src/schemas/referral.schema";
import { Task } from "src/schemas/task.schema";
import { UserTask } from "src/schemas/user-task.schema";
import { InjectModel } from "@nestjs/mongoose";
import { TaskEnum } from "src/common/enum/referralProgram/task.enum";
import { Model, Types } from "mongoose";
import {
  WalletDecryption,
  WalletEncryption,
} from "src/common/helpers/encryption-decryption.helper";
import { Type } from "class-transformer";
import { PaginateDto } from "src/common/dto/paginate.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(UserTask.name) private readonly userTaskModel: Model<UserTask>
  ) {}

  async getUserProfile(account: IUser): Promise<IServiceResponse> {
    const user = await this.userModel
      .findById(account._id)
      .select("-password -encryptedPrivateKey")
      .lean();
    return {
      data: user,
    };
  }
  async createPassword(
    account: IUser,
    payload: CreatePasswordDTO
  ): Promise<IServiceResponse> {
    const user = await this.userModel
      .findByIdAndUpdate(account._id, {
        $set: {
          password: bcrypt.hashSync(payload.password, 8),
          isPassword: true,
        },
      })
      .select("-password -encryptedPrivateKey")
      .lean();
    return {
      data: user,
    };
  }

  async getUserReferrals(
    account: IUser,
    query: PaginateDto
  ): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;

    const [referrals, count] = await Promise.all([
      this.referralModel
        .find({ referredBy: account._id }, "-_id referredUser xp")
        .populate("referredUser", "userProfileUrl username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limitPerPage)
        .lean(),
      this.referralModel.countDocuments({
        referredBy: account._id,
      }),
    ]);

    return {
      data: { referrals, count },
    };
  }


  async getReferralLeaderBoard(
    query: PaginateDto
  ): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;
  
    const leaderboard = await this.userModel.aggregate([
      {
        $match: {
          xp: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "referrals",
          localField: "_id",
          foreignField: "referredBy",
          as: "referralData",
        },
      },
      {
        $addFields: {
          totalReferrals: { $size: "$referralData" },
        },
      },
      {
        $project: {
          _id: 0,
          username: 1,
          xp: 1,
          totalReferrals: 1,
        },
      },
      {
        $sort: { xp: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: 10,
      },
    ]);
  
    return {
      data: { leaderboard },
    };
  }
  

  async updateProfile(
    payload: UpdateProfileDTO,
    account: IUser
  ): Promise<IServiceResponse> {
    await this.userModel
      .findByIdAndUpdate(
        account._id,
        {
          $set: {
            username: payload.username || account.username,
            country: payload.country || account.country,
          },
        },
        { new: true }
      )
      .select("-password -encryptedPrivateKey")
      .lean();

    // perform update profile task
    const task = await this.taskModel.findOne({
      name: TaskEnum.CompleteProfileSetup,
    });
    if (!task) throw new NotFoundException("Task not found");
    const taskData = {
      user: account._id,
      task: task._id,
      completed: true,
    };
    await this.userTaskModel.create(taskData);
    const user = await this.userModel
      .findById(account._id)
      .select("-password -encryptedPrivateKey");
    user.xp += task.xp;
    await user.save();

    return;
  }

  async updateProfileImage(
    payload: UpdateProfileImageDto,
    account: IUser
  ): Promise<IServiceResponse> {
    await this.userModel
      .findByIdAndUpdate(
        account._id,
        {
          $set: {
            userProfileUrl: payload.userProfileUrl || account.userProfileUrl,
          },
        },
        { new: true }
      )
      .select("-password -encryptedPrivateKey")
      .lean();
    return;
  }

  async changePassword(
    input: UpdatePasswordDTO,
    account: IUser
  ): Promise<IServiceResponse> {
    if (!bcrypt.compareSync(input.oldPassword, account.password))
      throw new BadRequestException("Invalid old password");

    const updatedPassword = await this.userModel
      .findByIdAndUpdate(
        account._id,
        {
          $set: {
            password: bcrypt.hashSync(input.password, 8),
          },
        },
        { new: true }
      )
      .select("-password -encryptedPrivateKey")
      .lean();
    const hashedPassword = account.password;
    if (account.encryptedPrivateKey) {
      const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
        account.encryptedPrivateKey,
        `${account.primaryEmail}${hashedPassword}${account.pinCode}`
      );

      await this.userModel
        .findByIdAndUpdate(
          account._id,
          {
            $set: {
              password: bcrypt.hashSync(input.password, 8),
              encryptedPrivateKey: WalletEncryption.encryptPrivateKey(
                decryptedPrivateKey,
                `${account.primaryEmail}${updatedPassword.password}${account.pinCode}`
              ),
            },
          },
          { new: true }
        )
        .select("-password -encryptedPrivateKey")
        .lean();

      return;
    }

    return;
  }

  async exportPrivateKey(
    payload: ExportPrivateKeyDTO,
    account: IUser
  ): Promise<IServiceResponse> {
    if (!account.pinCode) {
      throw new BadRequestException("Please create a pin code");
    }
    if (payload.pinCode !== account.pinCode) {
      throw new BadRequestException("Invalid pin code");
    }
    const decryptedPrivateKey = WalletDecryption.decryptPrivateKey(
      account.encryptedPrivateKey,
      `${account.primaryEmail}${account.password}${payload.pinCode}`
    );

    return { data: { privateKey: decryptedPrivateKey } };
  }
}
