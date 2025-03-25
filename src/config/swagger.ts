import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_NAME,
  SWAGGER_API_ROOT,
} from './env.config';

/**
 * Setup Swagger documentation for the NestJS application.
 *
 * This function configures and sets up Swagger documentation for the provided
 * NestJS application instance. It uses configuration values for setting the
 * title, description, and version of the API, and adds authentication options.
 *
 * @param {INestApplication} app - The NestJS application instance.
 */
export const setupSwagger = (app: INestApplication) => {
  // Create Swagger configuration options
  const options = new DocumentBuilder()
    .setTitle(SWAGGER_API_NAME) // Set the title of the API documentation
    .setDescription(SWAGGER_API_DESCRIPTION) // Set the description of the API documentation
    .setVersion(SWAGGER_API_CURRENT_VERSION) // Set the current version of the API
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Name of the security scheme
    )
    .addApiKey({ type: 'apiKey', name: 'Api-Key', in: 'header' }, 'Api-Key') // Add API key authentication
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, options);

  // Setup Swagger module with the generated document and options
  SwaggerModule.setup(SWAGGER_API_ROOT, app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Persist authorization across page reloads
    },
  });
};
