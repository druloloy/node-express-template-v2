// @deno-types="npm:@types/express@5.0.0"
import type { Application } from 'express';
import getRoutes from '../utils/get-routes.ts';

const loadServices = async (app: Application) => {
    const dir = './src/api';
    const { routes, ignored } = await getRoutes(dir);

    ignored.map((route) => {
        console.info(`%c✗ ${route}`, 'color: red');
    });

    await Promise.all(
        routes.map(async (route) => {
            const mod = await import(`${route.replace('/api', '.')}/index.ts`);
            app.use(route, mod.default);
            console.info(`%c✓ ${route}`, 'color: green');
        }),
    );
};

export default loadServices;
