import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Logger, ValidationPipe } from "@nestjs/common";
import {
  APP_NAME,
  DEV_RABBITMQ_QUEUE_NAME,
  DEV_RABBITMQ_URL,
  NODE_ENV,
  PORT,
  PRODUCTION_RABBITMQ_QUEUE_NAME,
  PRODUCTION_RABBITMQ_URL,
  SECRET,
} from "./config/env.config";
import { setupSwagger } from "./config/swagger";
import { Transport } from "@nestjs/microservices";
import * as passport from "passport";
import * as session from "express-session";
import { json, urlencoded } from "express";
import 'multer';

async function bootstrap() {
  // Create a NestJS application instance using the Express framework
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api/mammonapp");

  // Apply global validation pipes to automatically validate incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip out properties that are not defined in the DTOs
    })
  );
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  setupSwagger(app);

  // Enable trust proxy settings to account for proxies in front of the server
  app.enable("trust proxy", 1);

  // Disable the 'X-Powered-By' header to make the application less identifiable
  app.disable("x-powered-by");

  // Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins
  app.enableCors();

  // Connect to a RabbitMQ microservice with appropriate configurations based on the environment
  app.connectMicroservice({
    transport: Transport.RMQ, // Use RabbitMQ as the transport layer
    options: {
      urls: [
        NODE_ENV === "development" ? DEV_RABBITMQ_URL : PRODUCTION_RABBITMQ_URL, // Select RabbitMQ URL based on the environment
      ],
      queue:
        NODE_ENV === "development"
          ? DEV_RABBITMQ_QUEUE_NAME
          : PRODUCTION_RABBITMQ_QUEUE_NAME, // Select RabbitMQ queue name based on the environment
      queueOptions: { durable: false }, // Set queue options, such as non-durability
      noAck: false, // Enable manual acknowledgment of messages to ensure they are processed correctly
    },
  });

  app.use(
    session({
      secret: `${SECRET}`,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Start all configured microservices and the main application server
  await Promise.all([app.startAllMicroservices(), app.listen(PORT)]);

  // Log a message indicating that the server is running and listening on the specified port
  Logger.log(`[${APP_NAME}] server is running on port ${PORT}`);
}

// Bootstrap the NestJS application by invoking the bootstrap function
bootstrap();
