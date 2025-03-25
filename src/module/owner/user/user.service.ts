import { Injectable, NotFoundException } from "@nestjs/common";
import { IServiceResponse } from "../../../common/interfaces/service.interface";
import { User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserByIdDto } from "src/common/dto/user.dto";

@Injectable()
export class OwnerUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async addOrRemoveAdmin(param: UserByIdDto): Promise<IServiceResponse> {
    const findUser = await this.userModel
      .findById(param.userId, "_id isSuspended isEmailVerified role")
      .lean();
    if (!findUser) throw new NotFoundException("User not found.");
    if (findUser.isSuspended)
      throw new NotFoundException("User account is suspended.");
    if (!findUser.isEmailVerified)
      throw new NotFoundException("User email is not yet verified.");
    if (findUser.role.includes("owner") && findUser.role.includes("admin"))
      throw new NotFoundException("You are already an admin.");
    if (findUser.role.includes("owner") && !findUser.role.includes("admin"))
      await this.userModel
        .findById(findUser._id, {
          $addToSet: {
            role: ["admin"],
          },
        })
        .lean();

    if (findUser.role.includes("admin"))
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $pull: {
              role: "admin",
            },
          },
          { new: true }
        )
        .lean();

    if (!findUser.role.includes("admin"))
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $addToSet: {
              role: "admin",
            },
          },
          { new: true }
        )
        .lean();

    return;
  }

  async suspendOrUnsuspendAccount(
    param: UserByIdDto
  ): Promise<IServiceResponse> {
    const findUser = await this.userModel
      .findById(param.userId, "_id isSuspended isEmailVerified role")
      .lean();
    if (!findUser) throw new NotFoundException("User not found.");
    if (findUser.role.includes("owner"))
      throw new NotFoundException("You cannot suspend owner's account");

    if (findUser.isSuspended)
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $set: {
              isSuspended: false,
            },
          },
          { new: true }
        )
        .lean();

    if (!findUser.isSuspended)
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $set: {
              isSuspended: true,
            },
          },
          { new: true }
        )
        .lean();

    return;
  }

  async verifyEmailOrUnverifyEmailAccount(
    param: UserByIdDto
  ): Promise<IServiceResponse> {
    const findUser = await this.userModel
      .findById(param.userId, "_id isEmailVerified")
      .lean();
    if (!findUser) throw new NotFoundException("User not found.");

    if (findUser.isEmailVerified)
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $set: {
              isEmailVerified: false,
            },
          },
          { new: true }
        )
        .lean();

    if (!findUser.isEmailVerified)
      await this.userModel
        .findByIdAndUpdate(
          findUser._id,
          {
            $set: {
              isEmailVerified: true,
            },
          },
          { new: true }
        )
        .lean();

    return;
  }
}
