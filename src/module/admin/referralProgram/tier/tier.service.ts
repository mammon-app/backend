import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IServiceResponse } from "../../../../common/interfaces/service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Tier } from "src/schemas/tier.schema";
import {
  DeleteTierByIdDTO,
  CreateTierDTO,
  UpdateTierDTO,
} from "src/common/dto/referralProgram/tier.dto";
import { TierEnum } from "src/common/enum/referralProgram/tier.enum";

@Injectable()
export class TierService {
  constructor(
    @InjectModel(Tier.name) private readonly tierModel: Model<Tier>
  ) {}

  async getTierEnum(): Promise<IServiceResponse> {
    return {
      data: Object.values(TierEnum),
    };
  }

  async createTier(payload: CreateTierDTO): Promise<IServiceResponse> {
    if (!Object.values(TierEnum).includes(payload.name)) {
      throw new BadRequestException("Invalid tier name");
    }
    const tier = await this.tierModel.findOne({ name: payload.name });
    if (tier) throw new BadRequestException("Tier already exists");
    if (payload.minXp <= 0)
      throw new BadRequestException("Tier minimum xp must be above 0");
    if (payload.maxXp <= 0)
      throw new BadRequestException("Tier maximum xp must be above 0");
    if (payload.maxXp < payload.minXp)
      throw new BadRequestException("Tier maximum xp must be above minimum xp");
    const newTier = await new this.tierModel(payload).save();
    return {
      data: { newTier },
    };
  }

  async deleteTier(param: DeleteTierByIdDTO) {
    const task = await this.tierModel.findById(param.tierId, "_id").lean();
    if (!task) throw new NotFoundException("Tier not found");

    await this.tierModel.findByIdAndDelete(param.tierId);
    return;
  }

  async updateTier(
    payload: CreateTierDTO,
    param: UpdateTierDTO
  ): Promise<IServiceResponse> {
    const [task, existingTier] = await Promise.all([
      this.tierModel.findOne({ name: payload.name }),
      this.tierModel.findById(param.tierId).lean(),
    ]);

    if (!existingTier) throw new NotFoundException("Tier not found");
    if (!Object.values(TierEnum).includes(payload.name))
      throw new BadRequestException("Invalid task name");
    if (task && existingTier._id.toString() !== task._id.toString())
      throw new BadRequestException("Tier already exists");
    if (payload.minXp <= 0)
      throw new BadRequestException("Tier minimum xp must be above 0");
    if (payload.maxXp <= 0)
      throw new BadRequestException("Tier maximum xp must be above 0");
    if (payload.maxXp < payload.minXp)
      throw new BadRequestException("Tier maximum xp must be above minimum xp");

    const updatedTier = await this.tierModel.findByIdAndUpdate(
      param.tierId,
      {
        $set: {
          name: payload.name,
          description: payload.description,
          minXp: payload.minXp,
          maxXp: payload.maxXp,
        },
      },
      { new: true }
    );
    return {
      data: { updatedTier },
    };
  }
}
