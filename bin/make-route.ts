// #!/usr/bin/env -S deno run --allow-env --allow-write --allow-read

/**
 * This script is used to create a folder structure for a new route
 * It will create a folder for the route, and the files for the route
 */

import { parseArgs } from 'jsr:@std/cli/parse-args';

const flags = parseArgs(Deno.args, {
    string: ['name', 'version'],
    default: {
        version: '1',
    },
});

const version = Number(flags.version);

if (!flags.name) {
    console.error('Name is required');
    Deno.exit(1);
}

if (version < 1 || isNaN(version)) {
    console.error('Version must be greater than 0');
    Deno.exit(1);
}

const name = flags.name;

const routesPath = './src/api/v' + version;

// check if folder exists
if (!checkFolderExists(routesPath)) {
    Deno.mkdirSync(routesPath);
    const contents = replaceInFileText(
        './bin/defaults/router/index.ts',
        '%%router_name%%',
        `v${version}`,
    );
    Deno.writeFileSync(
        `${routesPath}/index.ts`,
        new TextEncoder().encode(contents),
    );
}

// create route folder
const routePath = `${routesPath}/${name}`;
if (!checkFolderExists(routePath)) {
    Deno.mkdirSync(routePath);

    // create route files
    const routeFiles = [
        'index.ts',
        'services.ts',
        'controllers.ts',
    ];

    copyDefaultFiles(routeFiles, routePath);

    console.log(`Created route: ${routePath}`);
} else {
    console.error(`%cRoute already exists: ${routePath}`, 'color: red');
    console.info(
        '%cDelete the existing router first and try running this script again.',
        'color: blue',
    );
    Deno.exit(1);
}

function copyDefaultFiles(files: string[], routePath: string) {
    files.forEach((file) => {
        if (file === 'index.ts') {
            const contents = replaceInFileText(
                './bin/defaults/router/index.ts',
                '%%router_name%%',
                `v${version}/${name}`,
            );
            Deno.writeFileSync(
                `${routePath}/${file}`,
                new TextEncoder().encode(contents),
            );
            return;
        }

        Deno.copyFileSync(
            `./bin/defaults/router/${file}`,
            `${routePath}/${file}`,
        );
    });
}

function checkFolderExists(dir: string): boolean {
    try {
        Deno.statSync(dir);
        // successful, file or directory must exist
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            // file or directory does not exist
            return false;
        } else {
            // unexpected error, maybe permissions, pass it along
            throw error;
        }
    }
}

function replaceInFileText(filepath: string, find: string, replace: string) {
    const file = Deno.readTextFileSync(filepath);
    const newFile = file.replace(find, replace);

    return newFile;
}
