const appConfig = {
    port: Deno.env.get('PORT') || 5000,
    databaseUrl: Deno.env.get('DATABASE_URL'),
    isDev: Deno.env.get('DENO_ENV') === 'development',
};

export default appConfig;
