// @deno-types="npm:@types/express@5.0.0"
import express, { Application } from 'express';
import { loadDefaultMiddlewares } from './middlewares/index.ts';
import loadServices from './api/index.ts';
import errorHandler from './middlewares/errorHandler.ts';
import { setupSwagger } from './utils/swagger.ts';

const app: Application = express();

loadDefaultMiddlewares(app);
loadServices(app).then(() => {
    setupSwagger(app);
    app.use(errorHandler);
});

export default app;
