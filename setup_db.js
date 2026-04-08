import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgoptyqzofayoipnblmr.supabase.co';
const supabaseKey = 'sb_publishable_JscOAAJ8MFNTLxukqXRByw_QkO9lo8s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Initiating database setup (assuming RLS allows insert for anon, or failing gracefully)...');
  
  // Note: Since we only have the anon key, we can't execute raw SQL easily. 
  // We will try a basic insert to test if the table exists or if RLS blocks it.
  // Ideally, the user needs to run SQL in their Supabase dashboard.
  console.log('Please note: To properly create tables and disable RLS (for testing), you MUST run the following SQL in your Supabase SQL Editor:');
  
  const sql = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  capital numeric not null,
  debt numeric not null,
  liquidity numeric not null,
  "riskScore" integer not null,
  "riskLevel" text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security (RLS) for testing purposes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
  `;
  
  console.log('\n--- COPY PASTE THIS IN SUPABASE SQL EDITOR ---');
  console.log(sql);
  console.log('----------------------------------------------\n');
}

setupDatabase();
