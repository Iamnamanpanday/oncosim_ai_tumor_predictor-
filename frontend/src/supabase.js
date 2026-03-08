// ── Supabase Client ────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a free project
// 2. Project Settings → API → copy "Project URL" and "anon public" key
// 3. Create a .env.local file in this folder (copy from .env.local.example)
// 4. In Supabase: Authentication → Providers → Google → Enable
//    - Create Google OAuth credentials at console.cloud.google.com
//    - Add  http://localhost:5173  to Authorized JavaScript origins
//    - Add  https://<your-project>.supabase.co/auth/v1/callback  as redirect URI
// 5. In Supabase: Authentication → URL Configuration
//    - Set Site URL to: http://localhost:5173
//    - Add http://localhost:5173/* to Redirect URLs

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ""
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

export const supabase = createClient(supabaseUrl, supabaseKey)
