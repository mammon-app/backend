import { Injectable } from "@nestjs/common";
import { IServiceResponse } from "../../../common/interfaces/service.interface";
import { User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PaginateDto } from "src/common/dto/paginate.dto";

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async getUsers(query: PaginateDto): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;

    const [users, count] = await Promise.all([
      this.userModel
        .find(
          {},
          "-spendableBalance -__v -savingsBalance -encryptedPrivateKey -totalWalletBalance -currency -totalWalletBalance -points -isCaptchaVerified -pinCode -isPassword -password"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limitPerPage)
        .lean(),
      this.userModel.countDocuments({}),
    ]);

    return {
      data: { users, count },
    };
  }

  async getAdmins(query: PaginateDto): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;

    const [admins, count] = await Promise.all([
      this.userModel
        .find(
          {
            role: { $in: ["admin", "owner"] },
          },
          "-spendableBalance -__v -savingsBalance -encryptedPrivateKey -totalWalletBalance -currency -totalWalletBalance -points -isCaptchaVerified -pinCode -isPassword -password"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limitPerPage)
        .lean(),
      this.userModel.countDocuments({ role: { $in: ["admin", "owner"] } }),
    ]);

    return {
      data: { admins, count },
    };
  }
}
