// #!/usr/bin/env -S deno run --allow-env --allow-write --allow-read

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
const routesPath = `./src/api/v${version}`;

if (!checkFolderExists(routesPath)) {
    Deno.mkdirSync(routesPath);
    Deno.writeFileSync(
        `${routesPath}/index.ts`,
        new TextEncoder().encode(buildVersionIndex(version)),
    );
}

const routePath = `${routesPath}/${name}`;

if (!checkFolderExists(routePath)) {
    Deno.mkdirSync(routePath);
    copyDefaultFiles(['index.ts', 'services.ts', 'controllers.ts'], routePath);
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
            const contents = applyReplacements(
                './bin/defaults/router/index.ts',
                {
                    '%%router_path%%': `/api/v${version}/${name}`,
                    '%%router_name%%': name,
                },
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

function applyReplacements(
    filepath: string,
    replacements: Record<string, string>,
): string {
    let content = Deno.readTextFileSync(filepath);
    for (const [find, replace] of Object.entries(replacements)) {
        content = content.replaceAll(find, replace);
    }
    return content;
}

function buildVersionIndex(v: number): string {
    return `// @deno-types="npm:@types/express@5.0.0"
import { Router } from 'express';
import type {
    NextFunction,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';

const router = Router();

/**
 * @openapi
 * /api/v${v}:
 *   get:
 *     tags: [Health]
 *     summary: v${v} health check
 *     responses:
 *       200:
 *         description: API v${v} is running
 */
router.get(
    '/',
    function (
        _req: ExpressRequest,
        res: ExpressResponse,
        _next: NextFunction,
    ) {
        res.json({ status: 'ok', version: 'v${v}' });
    },
);

export default router;
`;
}

function checkFolderExists(dir: string): boolean {
    try {
        Deno.statSync(dir);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error;
    }
}
