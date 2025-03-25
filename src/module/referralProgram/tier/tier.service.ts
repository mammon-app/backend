import { Injectable, NotFoundException } from "@nestjs/common";
import { IServiceResponse } from "../../../common/interfaces/service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Tier } from "src/schemas/tier.schema";
import { PaginateDto } from "src/common/dto/paginate.dto";

@Injectable()
export class TierService {
  constructor(
    @InjectModel(Tier.name) private readonly tierModel: Model<Tier>
  ) {}

  async getTiers(query: PaginateDto): Promise<IServiceResponse> {
    const skip = (query.currentPage - 1) * query.limitPerPage;
    const tiers = await this.tierModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limitPerPage)
      .lean();

    if (!tiers) throw new NotFoundException("No tier found");
    return {
      data: tiers,
    };
  }
}
