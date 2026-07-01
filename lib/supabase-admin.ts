import { createClient } from "@supabase/supabase-js";

// Ensure this is only used on the server side
if (typeof window !== "undefined") {
  throw new Error("Supabase admin client should only be used on the server side.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Missing Supabase environment variables. Supabase admin client will not work properly.");
}

// Create a single supabase admin client for interacting with your database
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
