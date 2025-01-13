import { Server } from 'node:http';
import process from 'node:process';

const closeServerOnError = (server: Server) => {
    const handler = (err: Error) => {
        console.warn('%cServer timed out.', 'color: red');
        console.log(`ERROR LOG: ${err}`);

        /**Close the server if an error is unhandled. */
        server.close(() => process.exit(1));
    };

    return handler;
};

export { closeServerOnError };
