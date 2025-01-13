import process from 'node:process';
import appConfig from '../.config/app.config.ts';
import app from './app.ts';
import { closeServerOnError } from './utils/server-handlers.ts';

if (appConfig.isDev) {
    console.log('%cRunning in development mode', 'color: blue');
} else {
    console.log('%cRunning in production mode', 'color: blue');
}

const PORT = appConfig.port || 5000;

const server = app.listen(PORT, () => {
    console.log(`%cServer started on port ${PORT}`, 'color: blue');
});

process.on('unhandledRejection', closeServerOnError(server));
