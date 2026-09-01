/* ============================================================
   Gill International School — Parent Portal configuration

   This file turns the parent portal into a real, multi-device
   account system. Until the two values below are filled in, the
   /register and /login pages run in "demo mode": accounts live
   only in the visitor's own browser (localStorage), and a small
   notice is shown on the form cards.

   HOW TO ENABLE REAL ACCOUNTS  (see DEPLOY.md / SUPABASE.md):

   1. Create a free project at https://supabase.com
   2. Open Project Settings → API and copy:
        Project URL          → supabaseUrl
        anon / public key    → supabaseAnonKey
   3. Run the SQL from SUPABASE.md in the SQL Editor (creates the
      parent_profiles table, security policies and the signup
      trigger).  This is a one-time step.
   4. Paste both values below and deploy.

   NEVER put the service_role key in this file — it is loaded by
   the browser. The anon key is safe by design because the
   database table is protected by Row-Level Security.
   ============================================================ */

window.GIS_CONFIG = {
  supabaseUrl: "",     // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: ""  // e.g. "eyJhbGciOi... (anon/public key)"
};
