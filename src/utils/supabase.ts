import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = () => {
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_KEY')!,
    );
};
