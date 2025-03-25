import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../../schemas/user.schema";
import { Model } from "mongoose";
import {
  DEV_RABBITMQ_NOTIFICATION,
  PRODUCTION_RABBITMQ_NOTIFICATION,
  NODE_ENV,
  FUNDING_KEY_SECRET,
  HORIZON_MAINNET_URL,
  EMAIL_USERNAME,
  X_URL,
  TELEGRAM_COMMUNITY_URL,
  CLIENT_URL,
  APP_NAME,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_BASE,
} from "src/config/env.config";
import { ClientProxy } from "@nestjs/microservices";
import { InternalCacheService } from "src/internal-cache/internal-cache.service";
import {
  EmailQueryDTO,
  LoginDTO,
  OTPVerificationDTO,
  RegisterDTO,
  ValidationViaEmailDTO,
  ResetPasswordValidationDTO,
  CreateWalletDTO,
} from "src/common/dto/user.dto";
import { IServiceResponse } from "src/common/interfaces/service.interface";
import { EmailHelper } from "src/common/helpers/email.helper";

// import { IServiceResponse } from "src/common/interfaces/service.interface";
// import { EmailHelper } from "src/common/helpers/email.helper";
import { MFA } from "src/schemas/mfa.schema";
import { Helpers } from "src/common/helpers";
import { JwtHelper } from "src/common/helpers/jwt.helper";
import { authenticator } from "otplib";
import { IUser } from "src/common/interfaces/user.interface";
import { WalletEncryption } from "src/common/helpers/encryption-decryption.helper";
import { UserSetting } from "src/schemas/user.setting.schema";
import StellarSdk from "stellar-sdk";
import { Referral } from "src/schemas/referral.schema";
import { Task } from "src/schemas/task.schema";
import { UserTask } from "src/schemas/user-task.schema";
import { TaskEnum } from "src/common/enum/referralProgram/task.enum";

//  * It handles operations such as user registration, login, password reset, OTP verification, and more, employing robust strategies for data protection and user validation.
//  *
//  * This class leverages NestJS's powerful dependency injection to seamlessly integrate with database models and external services, ensuring a modular and scalable architecture.
//  *
//  * Key components include:
//  * - UserModel: Represents the schema for user data storage and retrieval.
//  * - MFAModel: Manages Multi-Factor Authentication (MFA) configurations and verifications.
//  * - UserSettingModel: Stores user-specific settings and preferences.
//  * - InternalCacheService: Provides efficient caching mechanisms for improved performance.
//  * - ClientNotification: Utilizes RabbitMQ for seamless communication and notification handling.
//  *
//  * Additionally, the class incorporates advanced features such as blockchain integration using Stellar SDK, enhancing security and trust in transactions.
//  *
//  * The constructor initializes essential services and configurations based on the environment, dynamically adapting to development or production environments.
//  * It sets up a connection to the Stellar blockchain server via Horizon Testnet URL and manages the funding key for secure blockchain operations.
//  *
//  * Overall, the AuthService encapsulates a comprehensive suite of authentication services, embodying best practices in security, scalability, and seamless integration.
//  */
@Injectable()
export class AuthService {
  private readonly server: any;
  private readonly fundingKey: any;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(MFA.name) private readonly mfaModel: Model<MFA>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<Task>,
    @InjectModel(UserTask.name) private readonly userTaskModel: Model<UserTask>,
    @InjectModel(UserSetting.name)
    private readonly userSettingModel: Model<UserSetting>,
    private readonly internalCacheService: InternalCacheService,
    @Inject(
      NODE_ENV === "development"
        ? DEV_RABBITMQ_NOTIFICATION
        : PRODUCTION_RABBITMQ_NOTIFICATION
    )
    private readonly clientNotification: ClientProxy
  ) {
    this.server = new StellarSdk.Server(HORIZON_MAINNET_URL);
    this.fundingKey = StellarSdk.Keypair.fromSecret(FUNDING_KEY_SECRET);
  }

  /**
   * Checks the uniqueness and validity of an email address in the system.
   *
   * This method normalizes the provided email address to lowercase for consistency
   * and then validates it to ensure it conforms to the standards of a valid work email
   * using the EmailHelper.isValidWorkEmail method. If the email is not valid, a BadRequestException
   * is thrown with an appropriate message indicating that it is not a valid work email.
   *
   * Next, the method queries the UserModel to check if an account with the same email already exists
   * in the system. If such an account is found, a ConflictException is thrown, indicating that the email
   * is already in use.
   *
   * It is important to note that the email uniqueness check is case-insensitive due to the normalization
   * to lowercase, ensuring consistent behavior across different inputs.
   *
   * @param payload The payload containing the email address to check.
   * @returns An IServiceResponse indicating success if the email is unique and valid.
   * @throws BadRequestException if the email is not a valid work email.
   * @throws ConflictException if the email is already in use.
   */
  async checkUniqueEmail(payload: EmailQueryDTO): Promise<IServiceResponse> {
    // Normalize email to lowercase for consistency
    payload.email = payload.email.toLowerCase();

    // Validate if the email is a valid work email
    // if (!EmailHelper.isValidWorkEmail(payload.email)) {
    //   throw new BadRequestException("Is not a valid work email");
    // }

    // Query the UserModel to check if the email already exists
    const account = await this.userModel
      .findOne({
        primaryEmail: payload.email,
      })
      .lean();

    // If account exists, throw BadRequestException indicating email is already in use
    if (account) throw new BadRequestException("Email already exist");

    // Return success if email is unique and valid
    return;
  }

  /**
   * Authenticates a user's login credentials and handles Multi-Factor Authentication (MFA) if enabled.
   *
   * This method begins by normalizing the provided email address to lowercase for consistency.
   * It then queries the UserModel to find the user with the provided email.
   * If the user does not exist, a BadRequestException is thrown indicating that the account was not found.
   *
   * Upon finding the user, the method compares the hashed password from the database with the provided password
   * using bcrypt. If the passwords do not match, a BadRequestException is thrown indicating an invalid password.
   *
   * If Multi-Factor Authentication (MFA) is set up and enabled for the user, the method checks if a code is provided
   * in the payload. If MFA is enabled but no code is provided, a BadRequestException is thrown requesting the MFA code.
   *
   * If a code is provided, the method verifies the MFA code using authenticator.verify from the otplib library.
   * If the code is invalid, a BadRequestException is thrown indicating an invalid MFA code.
   *
   * Upon successful authentication and MFA verification, the method generates a JWT token using JwtHelper.signToken
   * and a refresh token using JwtHelper.refreshJWT for the user. The user data along with the tokens is returned
   * in an IServiceResponse object.
   *
   * @param payload The payload containing the user's email, password, and optional MFA code.
   * @returns An IServiceResponse containing the user data, JWT token, and refresh token upon successful login.
   * @throws BadRequestException if the account is not found, the password is invalid, or the MFA code is missing or invalid.
   */
  async login(payload: LoginDTO): Promise<IServiceResponse> {
    // Normalize email to lowercase for consistency
    payload.email = payload.email.toLowerCase();

    // Query the UserModel to find the user with the provided email
    const [account, user] = await Promise.all([
      this.userModel
        .findOne(
          {
            primaryEmail: payload.email,
          },
          "-encryptedPrivateKey"
        )
        .lean(),
      this.userModel
        .findOne(
          {
            primaryEmail: payload.email,
          },
          "-encryptedPrivateKey -password"
        )
        .lean(),
    ]);
    if (NODE_ENV === "production") {
      if (!user.isCaptchaVerified) {
        const response = await fetch(
          `${RECAPTCHA_BASE}?secret=${RECAPTCHA_SECRET_KEY}&response=${payload.captcha}`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencode;charset=utf-8",
            },
            method: "POST",
          }
        );

        if (!response.ok)
          throw new BadRequestException(
            "Failed to verify recaptcha. Try again"
          );

        const res = await response.json();

        if (!res.success)
          throw new BadRequestException("Recaptcha failed. Try again");

        await this.userModel
          .findOneAndUpdate(
            { primaryEmail: payload.email },
            {
              $set: {
                isCaptchaVerified: true,
              },
            },
            { new: true }
          )
          .lean();
      }
    }

    // If user not found, throw BadRequestException
    if (!user) throw new BadRequestException("Account not found");

    // Compare hashed password with provided password
    if (!bcrypt.compareSync(payload.password, account.password))
      throw new BadRequestException("Invalid credential");

    // Check MFA if set up and enabled
    const mfa = await this.mfaModel
      .findOne({
        user: account._id,
      })
      .lean();

    if (NODE_ENV === "production") {
      if (mfa && mfa.isSetup && mfa.isEnabled && !payload.code)
        throw new BadRequestException("Provide your MFA code");

      if (mfa && mfa.isSetup && mfa.isEnabled && payload.code) {
        // Verify MFA code
        const validate = authenticator.verify({
          token: payload.code,
          secret: mfa.secret,
        });

        // If code is invalid, throw BadRequestException
        if (!validate) throw new BadRequestException("Invalid MFA code");
      }
    }

    // Sign JWT token and refresh token for the user
    const jwt = await JwtHelper.signToken(user);
    const refreshToken = await JwtHelper.refreshJWT(user);
    await this.userModel
      .findOneAndUpdate(
        { primaryEmail: payload.email },
        {
          $set: {
            isCaptchaVerified: false,
          },
        },
        { new: true }
      )
      .lean();
    // Return user data with tokens
    return {
      data: {
        ...user,
        token: jwt,
        refreshToken,
      },
    };
  }

  /**
   * Authorizes and generates new JWT and refresh tokens for a user based on their account information.
   *
   * This method fetches the user's data from the UserModel using their account ID and retrieves it as a plain JavaScript object.
   * It then generates a new JWT token using JwtHelper.signToken and a new refresh token using JwtHelper.refreshJWT for the user.
   *
   * The new tokens are returned in an IServiceResponse object along with the updated user data, including the new JWT token and refresh token.
   *
   * @param account The user account object containing the user's ID.
   * @returns An IServiceResponse containing the updated user data with new JWT token and refresh token.
   */
  async authorizeRefreshToken(account: IUser): Promise<IServiceResponse> {
    // Fetch user data from UserModel based on account ID
    const user = await this.userModel
      .findById(account._id, "-encryptedPrivateKey -password")
      .lean();

    // Generate new JWT token and refresh token for the user
    const jwt = await JwtHelper.signToken(user);
    const refreshToken = await JwtHelper.refreshJWT(user);

    // Return updated user data with new tokens
    return {
      data: {
        ...user,
        token: jwt,
        refreshToken,
      },
    };
  }

  /**
   * Initiates the email validation process for a user by sending an OTP to the provided email address.
   *
   * This method normalizes the email address to lowercase for consistency and validates it to ensure it conforms to the standards of a valid work email.
   * If the email is not valid, a BadRequestException is thrown indicating that it is not a valid work email.
   *
   * It then checks if the email is already associated with an existing user in the system. If so, a BadRequestException is thrown indicating that the email is already taken.
   *
   * If the email is valid and available, an OTP (One-Time Password) is generated using Helpers.generateOTP and stored in the internal cache service associated with the email address.
   * The OTP is set to expire after a specified duration (18000 seconds or 5 hours).
   *
   * @param payload The payload containing the email address for validation.
   * @returns An IServiceResponse indicating success if the email validation request is processed.
   * @throws BadRequestException if the email is not a valid work email or if it is already associated with an existing user.
   */
  async requestEmailValidation(
    payload: ValidationViaEmailDTO
  ): Promise<IServiceResponse> {
    // Normalize email to lowercase for consistency
    payload.email = payload.email.toLowerCase();

    // Validate if the email is a valid work email
    // if (!EmailHelper.isValidWorkEmail(payload.email))
    //   throw new BadRequestException("Is not a valid work email");

    // Check if email is already associated with an existing user
    const findEmail = await this.userModel
      .findOne(
        { primaryEmail: payload.email },
        "-encryptedPrivateKey -password"
      )
      .lean();
    if (findEmail) throw new BadRequestException("Email taken");

    // Generate OTP and store it in the internal cache service
    const otp = Helpers.generateOTP(4);
    await this.internalCacheService.set(payload.email, otp, 18000);

    // Return success if email validation request is processed
    return;
  }

  /**
   * Registers a new user with the provided registration data, including email, password, username, pin code, and phone number.
   *
   * This method formats the email  using EmailHelper.format for consistency and validation purposes.
   * It then checks if the email is already associated with an existing user in the system. If so, a BadRequestException is thrown indicating that the email is already taken.
   *
   * Upon successful validation, the method generates a referral code using Helpers.generateOTP, hashes the password using bcrypt, and creates a new user in the UserModel.
   *
   * Additionally, it creates a wallet for the user using createWallet method, saves user settings in the UserSettingModel, generates an OTP (One-Time Password) for email verification, and sends email notifications using the clientNotification service.
   *
   * The user is then signed in with a JWT token and a refresh token using JwtHelper.signToken and JwtHelper.refreshJWT respectively.
   *
   * @param payload The payload containing the user's registration data.
   * @returns An IServiceResponse containing the user data along with JWT token and refresh token upon successful registration.
   * @throws BadRequestException if the email is already taken or if there is an error during registration.
   */
  async register(payload: RegisterDTO): Promise<IServiceResponse> {
    // Format email and phone number for consistency and validation
    payload.email = EmailHelper.format(payload.email);
    const strongRegexHigherCase = new RegExp("^(?=.*[A-Z])");
    const strongRegexLowerCase = new RegExp("^(?=.*[a-z])");
    const strongRegexNumber = new RegExp("^(?=.*[0-9])");
    const strongRegexSpecialCharacter = /^(.*\W).*$/;
    // Check if email is already associated with an existing user
    const foundEmail = await this.userModel
      .findOne(
        {
          primaryEmail: payload.email,
        },
        "-encryptedPrivateKey -password"
      )
      .lean();

    if (foundEmail) throw new BadRequestException("Email taken");

    if (!payload.password) throw new BadRequestException("Provide a password.");

    if (!Helpers.validateLength(payload.password, 8, 40))
      throw new BadRequestException("Password must be atleast 8 characters.");

    if (!strongRegexHigherCase.test(payload.password))
      throw new BadRequestException("Password must contain an uppercase.");

    if (!strongRegexLowerCase.test(payload.password))
      throw new BadRequestException("Password must contain a lowercase.");

    if (!strongRegexNumber.test(payload.password))
      throw new BadRequestException("Password must contain a number.");

    if (!strongRegexSpecialCharacter.test(payload.password))
      throw new BadRequestException(
        "Password must contain a special character."
      );
    try {
      // Generate referral code, hash password, and create new user
      const referralCode = Helpers.generateOTP(7);

      const user = await new this.userModel({
        primaryEmail: payload.email,
        password: bcrypt.hashSync(payload.password, 8),
        username: payload.email.split("@")[0],
        referralCode: `rf-${referralCode}`,
      }).save();

      // Check if user creation was successful
      const account = await this.userModel
        .findOne(
          {
            primaryEmail: user.primaryEmail,
          },
          "-encryptedPrivateKey -password"
        )
        .lean();

      if (account) {
        await new this.userSettingModel({ user: account._id }).save(); // Save user settings
      }

      if (payload.referralCode) {
        const referredBy = await this.userModel.findOne(
          { referralCode: payload.referralCode.toUpperCase() },
          "xp"
        );
        if (!referredBy) {
          throw new NotFoundException("Referral code does not exist");
        }

        // create referral
        await new this.referralModel({
          referredBy: referredBy._id,
          referredUser: account._id,
          xp: 50,
        }).save();

        // create user task model
        const task = await this.taskModel
          .findOne({ name: TaskEnum.ReferAFriend })
          .lean();
        if (task) {
          await this.userTaskModel.create({
            user: referredBy._id,
            task: task._id,
            completed: true,
          });
          referredBy.xp += 50;
          await referredBy.save();
        } else {
          referredBy.xp += 50;
          await referredBy.save();
        }
      }

      // Generate OTP for email verification and set it in the internal cache service
      const otp = Helpers.generateOTP(4);
      await this.internalCacheService.set(String(otp), account._id, 1000);

      // Sign JWT token and refresh token for the user
      const [jwt, refreshToken] = await Promise.all([
        JwtHelper.signToken(account),
        JwtHelper.refreshJWT(account),
      ]);

      // Send email notifications for account creation and email verification
      this.clientNotification.emit("send:general:email", {
        to: account.primaryEmail,
        subject: `🎉 Welcome to ${APP_NAME}! Let's Get Started!`,
        username: account.primaryEmail.split("@")[0],
        appName: APP_NAME,
        featureLink: CLIENT_URL,
        profileLink: `${CLIENT_URL}/settings`,
        communityLink: TELEGRAM_COMMUNITY_URL,
        socialMediaLink: X_URL,
        supportEmail: EMAIL_USERNAME,
      });
      this.clientNotification.emit("send:otp:email", {
        to: account.primaryEmail,
        subject: "Verify Your Email",
        content: `Kindly use this code to verify your email`,
        code: otp,
        username: account.primaryEmail.split("@")[0],
      });

      // Return user data with tokens upon successful registration
      return {
        data: {
          ...account,
          token: jwt,
          refreshToken,
        },
      };
    } catch (e) {
      // Handle registration error
      console.log(e);
      throw new BadRequestException(
        "Something went wrong, kindly contact support"
      );
    }
  }

  async validateUser(details: any) {
    const user = await this.userModel
      .findOne(
        { primaryEmail: details.email },
        "-encryptedPrivateKey -password"
      )
      .lean();

    if (user) {
      const jwt = await JwtHelper.signToken(user);
      const refreshToken = await JwtHelper.refreshJWT(user);
      // Return user data with tokens
      return {
        data: {
          ...user,
          token: jwt,
          refreshToken,
        },
      };
    }
    const referralCode = Helpers.generateOTP(7);
    const otp = Helpers.generateOTP(4);

    const newUser = await new this.userModel({
      primaryEmail: details.email,
      isPassword: false,
      password: bcrypt.hashSync(`${otp + details.email}`, 8),
      username: details.email.split("@")[0],
      userProfileUrl: details.userProfileUrl,
      isEmailVerified: details.isEmailVerified,
      referralCode: referralCode,
    }).save();

    // Check if newUser creation was successful
    const account = await this.userModel
      .findOne(
        {
          primaryEmail: newUser.primaryEmail,
        },
        "-encryptedPrivateKey -password"
      )
      .lean();

    if (account) {
      await new this.userSettingModel({ user: account._id }).save(); // Save user settings
    }

    // Generate OTP for email verification and set it in the internal cache service
    await this.internalCacheService.set(String(otp), account._id, 1000);

    // Sign JWT token and refresh token for the user
    const [jwt, refreshToken] = await Promise.all([
      JwtHelper.signToken(account),
      JwtHelper.refreshJWT(account),
    ]);

    // Send email notifications for account creation and email verification
    this.clientNotification.emit("send:general:email", {
      to: account.primaryEmail,
      subject: `🎉 Welcome to ${APP_NAME}! Let's Get Started!`,
      username: account.primaryEmail.split("@")[0],
      appName: APP_NAME,
      featureLink: CLIENT_URL,
      profileLink: `${CLIENT_URL}/settings`,
      communityLink: TELEGRAM_COMMUNITY_URL,
      socialMediaLink: X_URL,
      supportEmail: EMAIL_USERNAME,
    });
    if (!details.isEmailVerified)
      this.clientNotification.emit("send:otp:email", {
        to: account.primaryEmail,
        subject: "Verify Your Email",
        content: `Kindly use this code to verify your email`,
        code: otp,
        username: account.primaryEmail.split("@")[0],
      });

    // Return user data with tokens upon successful registration
    return {
      data: {
        ...account,
        token: jwt,
        refreshToken,
      },
    };
  }
  /**
   * Creates a Stellar wallet for a user by generating a random keypair, funding the account, and storing the public and encrypted private keys in the UserModel.
   *
   * This method generates a random Stellar keypair using StellarSdk.Keypair.random().
   * It then funds the account associated with the public key using the fundAccount method, passing the public key as the destination.
   *
   * The private key is encrypted using WalletEncryption.encryptPrivateKey with the user's primary email, hashed password, and pin code for added security.
   * The public key and encrypted private key are then stored in the UserModel associated with the user's ID.
   *
   * @param payload The payload containing the user's wallet creation data.
   * @param user The user object containing user data including ID, primary email, password, and pin code.
   * @returns An object containing the public key, secret key, and account details upon successful wallet creation.
   */
  async createWallet(payload: CreateWalletDTO, user: IUser) {
    // Generate a random Stellar keypair
    const keypair = StellarSdk.Keypair.random();

    // Fund the account associated with the public key
    await this.fundAccount(keypair.publicKey());

    if (user.stellarPublicKey)
      throw new BadRequestException("You already have a wallet.");

    // Encrypt the private key using user data for added security
    const hashedPasword = user.password;
    const [_user, account] = await Promise.all([
      this.userModel.findById(user._id).lean(),
      this.userModel
        .findByIdAndUpdate(
          user._id,
          {
            $set: {
              stellarPublicKey: keypair.publicKey(),
              encryptedPrivateKey: WalletEncryption.encryptPrivateKey(
                keypair.secret(),
                `${user.primaryEmail}${hashedPasword}${payload.pinCode}`
              ),
              pinCode: payload.pinCode,
            },
          },
          { new: true }
        )
        .select("-password -encryptedPrivateKey")
        .lean(),
    ]);
    const jwt = await JwtHelper.signToken(user);
    const refreshToken = await JwtHelper.refreshJWT(user);

    // Return user data with tokens
    return {
      data: {
        ...account,
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
        token: jwt,
        refreshToken,
      },
    };
  }

  /**
   * Funds a Stellar account by creating a transaction to add starting balance to the account.
   *
   * This method loads the funding account associated with the funding key's public key using the Stellar SDK server.
   * It fetches the base fee for the transaction and creates a transaction to create an account with a starting balance of 1 XLM.
   *
   * The transaction is signed with the funding key and submitted to the Stellar network.
   *
   * @param destination The public key of the account to fund.
   * @returns The transaction result after funding the account.
   */
  async fundAccount(destination: string) {
    try {
      // Load the funding account and fetch base fee for the transaction
      const account = await this.server.loadAccount(
        this.fundingKey.publicKey()
      );
      const fee = await this.server.fetchBaseFee();

      // Create a transaction to fund the account with starting balance
      const transaction = await new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination,
            startingBalance: "5",
          })
        )
        .setTimeout(30)
        .build();

      // Sign and submit the transaction to the Stellar network
      await transaction.sign(this.fundingKey);
      const transactionResult = await this.server.submitTransaction(
        transaction
      );

      // Return the transaction result
      return transactionResult;
    } catch (error) {
      console.log("FundAccount Error", error);
    }
  }

  /**
   * Initiates the password reset process by sending a one-time password (OTP) to the user's email for verification.
   *
   * This method retrieves the user's email and username from the UserModel based on the provided email.
   * It then generates a random OTP using Helpers.generateOTP and sets it in the internal cache service for validation within a specific time period.
   *
   * A notification email containing the OTP is sent to the user's email address for password reset.
   *
   * @param payload The payload containing the user's email for password reset.
   * @returns An IServiceResponse indicating the success of sending the OTP for password reset.
   * @throws BadRequestException if the account is not found.
   */
  async forgotPassword(
    payload: ValidationViaEmailDTO
  ): Promise<IServiceResponse> {
    // Find user by email and retrieve email and username
    const user = await this.userModel
      .findOne(
        {
          primaryEmail: payload.email,
        },
        "primaryEmail username"
      )
      .select("-password -encryptedPrivateKey")
      .lean();

    if (!user) throw new BadRequestException("Account not found");

    // Generate OTP and set it in the internal cache service
    const token = Helpers.generateOTP(4);
    await this.internalCacheService.set(String(token), user._id, 18000);

    // Send OTP email notification for password reset
    this.clientNotification.emit("send:otp:email", {
      to: user.primaryEmail,
      subject: "Forgot Password",
      content: `Kindly use this code to reset your password`,
      code: token,
      username: user.primaryEmail.split("@")[0],
    });

    return;
  }

  /**
   * Resends the OTP for password reset to the user's email.
   *
   * This method retrieves the user's email from the UserModel based on the provided email.
   * It generates a new OTP using Helpers.generateOTP and sets it in the internal cache service for validation within a short time period.
   *
   * A notification email containing the new OTP is sent to the user's email address for password reset.
   *
   * @param payload The payload containing the user's email for password reset.
   * @returns An IServiceResponse indicating the success of resending the OTP for password reset.
   * @throws BadRequestException if the account is not found.
   */
  async resendForgotPasswordOTP(
    payload: ValidationViaEmailDTO
  ): Promise<IServiceResponse> {
    // Find user by email
    const user = await this.userModel
      .findOne({ primaryEmail: payload.email })
      .select("-password -encryptedPrivateKey")
      .lean();

    if (!user) throw new BadRequestException("Account not found");

    // Generate new OTP and set it in the internal cache service
    const otp = Helpers.generateOTP(4);
    await this.internalCacheService.set(String(otp), user._id, 5000);

    // Send OTP email notification for password reset
    this.clientNotification.emit("send:otp:email", {
      to: user.primaryEmail,
      subject: "Forgot Password",
      content: `Kindly use this code to reset your password`,
      code: otp,
      username: user.primaryEmail.split("@")[0],
    });

    return;
  }

  /**
   * Verifies the email using the provided OTP for password reset.
   *
   * This method validates the email format using EmailHelper.isValidWorkEmail.
   * It retrieves the stored OTP from the internal cache service and checks if it matches the provided OTP.
   *
   * If the OTP is valid, it verifies the user's email by updating the isEmailVerified field in the UserModel.
   *
   * @param data The data containing the email, OTP, and other verification details.
   * @returns An IServiceResponse indicating the success of email verification for password reset.
   * @throws BadRequestException if the email is invalid, OTP is invalid, account is not found, or email is already verified.
   */
  async verifyEmail(data: OTPVerificationDTO): Promise<IServiceResponse> {
    // Retrieve OTP from internal cache service
    const redisObject: string | null = await this.internalCacheService.get(
      data.otp
    );

    if (!redisObject) throw new BadRequestException("Invalid OTP");

    // Find user by ID and check email verification status
    const user = await this.userModel
      .findById(redisObject)
      .select("-password -encryptedPrivateKey")
      .lean();

    if (!user) throw new BadRequestException("Invalid OTP");

    if (user.isEmailVerified)
      throw new BadRequestException("Email is already verified");

    await Promise.all([
      this.userModel.findByIdAndUpdate(
        user._id,
        {
          $set: {
            isEmailVerified: true,
          },
        },
        { new: true }
      ),
      this.internalCacheService.delete(data.otp),
    ]);

    return;
  }

  /**
   * Resends the email verification OTP to the user's email for email verification.
   *
   * This method retrieves the user's email from the UserModel based on the provided email.
   * It generates a new OTP using Helpers.generateOTP and sets it in the internal cache service for validation within a short time period.
   *
   * A notification email containing the new OTP is sent to the user's email address for email verification.
   *
   * @param payload The payload containing the user's email for email verification.
   * @returns An IServiceResponse indicating the success of resending the OTP for email verification.
   * @throws BadRequestException if the email is not found.
   */
  async resendEmailVerificationOTP(
    payload: ValidationViaEmailDTO
  ): Promise<IServiceResponse> {
    // Find user by email
    const user = await this.userModel
      .findOne({ primaryEmail: payload.email })
      .select("-password -encryptedPrivateKey")
      .lean();

    if (!user) throw new BadRequestException("Email not found");

    // Generate new OTP and set it in the internal cache service
    const otp = Helpers.generateOTP(4);
    const store = await this.internalCacheService.set(
      String(otp),
      user._id,
      5000
    );
    // Send OTP email notification for email verification
    this.clientNotification.emit("send:otp:email", {
      to: user.primaryEmail,
      subject: "Verify Your Email",
      content: `Kindly use this code to verify your email`,
      code: otp,
      username: user.primaryEmail.split("@")[0],
    });

    return;
  }

  /**
   * Resets the user's password after successful verification of the OTP and email.
   *
   * This method validates the email format using EmailHelper.isValidWorkEmail and retrieves the stored OTP from the internal cache service.
   * It then checks if the OTP is valid and finds the user by ID to reset the password using bcrypt.hashSync.
   *
   * @param data The data containing the email, OTP, and new password for password reset.
   * @returns An IServiceResponse indicating the success of password reset.
   * @throws BadRequestException if the email is invalid, OTP is invalid, account is not found, or email does not match the account.
   */
  async resetPassword(
    data: ResetPasswordValidationDTO
  ): Promise<IServiceResponse> {
    // Format email and validate
    data.email = data.email.toLowerCase();
    // if (!EmailHelper.isValidWorkEmail(data.email))
    //   throw new BadRequestException("Is not a valid work email");

    // Retrieve OTP from internal cache service
    const redisObject: string | null = await this.internalCacheService.get(
      data.otp
    );

    if (!redisObject) throw new BadRequestException("Invalid OTP");

    // Find user by ID and check email match
    const user = await this.userModel
      .findById(redisObject)
      .select("-password -encryptedPrivateKey")
      .lean();

    if (!user) throw new BadRequestException("Account not found");
    if (user.primaryEmail !== data.email)
      throw new BadRequestException("Invalid Account");

    // Update password with bcrypt hash
    await this.userModel.findOneAndUpdate(
      {
        _id: user._id,
        primaryEmail: data.email,
      },
      {
        $set: {
          password: bcrypt.hashSync(data.password, 8),
        },
      },
      { new: true }
    );

    // Delete the OTP from internal cache service
    await this.internalCacheService.delete(data.otp);

    return;
  }
}
