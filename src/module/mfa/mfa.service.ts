import { BadRequestException, Injectable } from "@nestjs/common";
import { IServiceResponse } from "../../common/interfaces/service.interface";
import { authenticator } from "otplib";
import { MFA } from "src/schemas/mfa.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { IUser } from "src/common/interfaces/user.interface";
import { APP_NAME } from "src/config/env.config";

// Constant defining the issuer name for the OTP authentication URL
const issuer = APP_NAME;

/**
 * MFAService is responsible for handling all operations related to
 * Multi-Factor Authentication (MFA) including generating secrets,
 * setting up MFA, verifying OTPs, and toggling MFA settings for users.
 */
@Injectable()
export class MFAService {
  constructor(@InjectModel(MFA.name) private readonly mfaModel: Model<MFA>) {}

  /**
   * Generates a new MFA secret for the user if not already set up.
   * @param user - The user object.
   * @returns An object containing the MFA secret and OTP authentication URL.
   */
  async generateSecret(user: IUser): Promise<IServiceResponse> {
    // Check if MFA is already set up for the user
    const mfaSetup = await this.mfaModel.findOne({ user: user._id }).lean();
    if (mfaSetup) {
      // If MFA is already set up, return the existing secret and OTP URL
      const otpAuthUrl = authenticator.keyuri(
        user.primaryEmail,
        issuer,
        mfaSetup.secret
      );
      return {
        data: {
          secret: mfaSetup.secret,
          url: otpAuthUrl,
        },
      };
    }

    // Generate a new secret for MFA
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.primaryEmail, issuer, secret);
    // Save the new MFA setup in the database
    await new this.mfaModel({
      user: user._id,
      isEnabled: false,
      isSetup: false,
      secret,
    }).save();
    return {
      data: {
        secret,
        url: otpAuthUrl,
      },
    };
  }

  /**
   * Sets up MFA for the user by verifying the provided OTP code.
   * @param payload - The MFA setup payload containing the OTP code.
   * @param user - The user object.
   * @returns A success message if the setup is completed.
   * @throws BadRequestException if MFA is already set up or if the OTP code is invalid.
   */
  async setupMFA(
    payload: { code: string },
    user: IUser
  ): Promise<IServiceResponse> {
    // Retrieve the current MFA setup for the user
    const mfaSetup = await this.mfaModel.findOne({ user: user._id }).lean();

    // Throw an exception if MFA is already set up
    if (mfaSetup && mfaSetup.isSetup)
      throw new BadRequestException(
        "You have successfully setup MFA, Kindly contact support"
      );

    // Verify the provided OTP code
    const validate = authenticator.verify({
      token: payload.code,
      secret: mfaSetup.secret,
    });
    if (!validate) throw new BadRequestException("Invalid code");

    // Update the MFA setup to mark it as completed and enabled
    await this.mfaModel.findByIdAndUpdate(
      mfaSetup._id,
      {
        $set: {
          isSetup: true,
          isEnabled: true,
        },
      },
      { new: true }
    );
    return;
  }

  /**
   * Verifies the user's OTP code.
   * @param payload - The MFA verification payload containing the OTP code.
   * @param user - The user object.
   * @returns A success message if the OTP is valid.
   * @throws BadRequestException if MFA is not available or if the OTP code is invalid.
   */
  async verifyOTP(
    payload: { code: string },
    user: IUser
  ): Promise<IServiceResponse> {
    // Retrieve the current MFA setup for the user
    const mfaSetup = await this.mfaModel.findOne({ user: user._id }).lean();

    // Throw an exception if MFA is not available or not set up
    if (!mfaSetup || !mfaSetup.isSetup || !mfaSetup.isEnabled)
      throw new BadRequestException("MFA not available on account.");

    // Verify the provided OTP code
    const validate = authenticator.verify({
      token: payload.code,
      secret: mfaSetup.secret,
    });
    if (!validate) throw new BadRequestException("Invalid code");

    return;
  }

  /**
   * Retrieves the current MFA settings for the user.
   * @param user - The user object.
   * @returns An object containing the MFA setup status.
   */
  async getMFASetting(user: IUser): Promise<IServiceResponse> {
    // Retrieve the current MFA setup for the user
    const mfaSetup = await this.mfaModel.findOne({ user: user._id }).lean();

    // If MFA setup is not found, return default settings
    if (!mfaSetup)
      return {
        data: {
          isEnabled: false,
          isSetup: false,
        },
      };

    // Return the current MFA setup status
    return {
      data: {
        isEnabled: mfaSetup.isEnabled,
        isSetup: mfaSetup.isSetup,
      },
    };
  }

  /**
   * Toggles the MFA setup for the user.
   * @param user - The user object.
   * @returns An object containing the updated MFA setup status.
   * @throws BadRequestException if MFA is not available on the account.
   */
  async toggleMFASetup(user: IUser): Promise<IServiceResponse> {
    // Retrieve the current MFA setup for the user
    const mfaSetup = await this.mfaModel.findOne({ user: user._id }).lean();

    // Throw an exception if MFA is not available
    if (!mfaSetup)
      throw new BadRequestException("MFA not available on account.");

    // Toggle the MFA enabled status
    const mfaUpdate = await this.mfaModel.findByIdAndUpdate(
      mfaSetup._id,
      {
        $set: {
          isEnabled: !mfaSetup.isEnabled,
        },
      },
      { new: true }
    );

    // Return the updated MFA setup status
    return {
      data: {
        isEnabled: mfaUpdate.isEnabled,
        isSetup: mfaUpdate.isSetup,
      },
    };
  }
}
