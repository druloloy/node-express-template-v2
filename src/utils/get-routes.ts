const hasIndexFile = async (dir: string): Promise<boolean> => {
    for await (const file of Deno.readDir(dir)) {
        if (file.name === 'index.ts') {
            return true;
        }
    }
};

const traverse = async (
    dir: string,
    results: string[],
    ignored: string[] = [],
) => {
    for await (const file of Deno.readDir(dir)) {
        const fpath = `${dir}/${file.name}`;
        if (file.isDirectory) {
            const trimmedFpath = fpath.replace('./src', '');
            // if folder has no index.ts then skip it
            if (!await hasIndexFile(fpath)) {
                ignored.push(trimmedFpath);
                continue;
            }

            // if route starts with _ then skip it
            if (file.name.startsWith('_')) {
                ignored.push(trimmedFpath);
                continue;
            }

            results.push(trimmedFpath);
            await traverse(fpath, results, ignored);
        }
    }
};

const getRoutes = async (rootPath: string) => {
    const folders: string[] = [];
    const ignored: string[] = [];

    await traverse(rootPath, folders, ignored);
    return {
        routes: folders,
        ignored,
    };
};

export default getRoutes;
