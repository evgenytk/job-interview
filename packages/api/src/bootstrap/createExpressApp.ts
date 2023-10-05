import { Express } from 'express';
import compression from 'compression';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { StatusController } from 'src/controllers/StatusController';
import { MessageController } from 'src/controllers/MessageController';

const { ENVIRONMENT } = process.env;
export const createExpressApp = (): Express => {
  useContainer(Container);
  const app = createExpressServer({
    controllers: [StatusController, MessageController],
    development: ENVIRONMENT === 'development',
    cors: {
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      optionsSuccessStatus: 200,
      origin: '*',
      allowedHeaders: '*',
      exposedHeaders: '*',
    },
    middlewares: [compression()],
  });

  // Disabled for security reasons
  app.disable('x-powered-by');

  // Allow load balancer to forward headers
  app.enable('trust proxy');

  return app;
};
