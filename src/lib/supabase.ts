import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client for build time / when env vars are missing
// This prevents runtime errors on Vercel while still allowing the build to pass
const createMockClient = (): SupabaseClient => {
    const mockChannel = {
        on: () => mockChannel,
        subscribe: () => mockChannel,
    };

    const mockQuery = {
        select: () => mockQuery,
        insert: () => mockQuery,
        update: () => mockQuery,
        delete: () => mockQuery,
        eq: () => mockQuery,
        order: () => mockQuery,
        single: () => mockQuery,
        then: (resolve: (value: { data: null; error: { message: string } }) => void) => {
            resolve({ data: null, error: { message: 'Supabase not configured' } });
        },
    };

    return {
        from: () => mockQuery,
        channel: () => mockChannel,
        removeChannel: () => Promise.resolve('ok'),
    } as unknown as SupabaseClient;
};

// Export the real client if env vars are available, otherwise use mock
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient();
