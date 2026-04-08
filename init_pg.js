import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.zgoptyqzofayoipnblmr.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log("Connecté à la base de données PostgreSQL !");

        const sql = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid references auth.users on delete cascade not null primary key,
        email text,
        role text default 'user',
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

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

      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
    `;

        await client.query(sql);
        console.log("Tables créées / RLS désactivé avec succès !");

    } catch (err) {
        console.error("Erreur d'exécution :", err);
    } finally {
        await client.end();
    }
}

setupDatabase();
