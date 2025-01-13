// @deno-types="npm:@types/express"
import express, { Application, Request, Response } from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import appConfig from '../../.config/app.config.ts';

export const loadDefaultMiddlewares = (app: Application) => {
    app.use(express.json());
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    }));
    app.use(logger(appConfig.isDev ? 'dev' : 'tiny', {
        skip: (_req: Request, res: Response) => {
            return !appConfig.isDev && res.statusCode < 400;
        },
    }));
    app.use(cors());

    return app;
};
