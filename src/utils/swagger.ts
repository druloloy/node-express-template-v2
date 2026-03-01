// @deno-types="npm:@types/swagger-jsdoc"
import swaggerJsdoc from 'swagger-jsdoc';
// @deno-types="npm:@types/swagger-ui-express"
import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import appConfig from '../../.config/app.config.ts';

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API',
            version: '1.0.0',
            description: 'Auto-generated API documentation',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/api/**/*.ts'],
};

export const setupSwagger = (app: Application): void => {
    const spec = swaggerJsdoc(swaggerOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

    if (appConfig.isDev) {
        console.info('%c✓ Swagger docs at /docs', 'color: green');
    }
};
