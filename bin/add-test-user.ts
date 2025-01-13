// #!/usr/bin/env -S deno run --allow-env
import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'jsr:@std/cli/parse-args';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_KEY')!;

// get terminal inputs
const flags = parseArgs(Deno.args, {
    string: ['password', 'email'],
});

if (!flags.password || !flags.email) {
    console.error('Email and password are required');
    Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data, error } = await supabase.auth.signUp({
    email: flags.email,
    password: flags.password,
});

if (error) {
    console.error(error);
    Deno.exit(1);
}

console.log(data);
