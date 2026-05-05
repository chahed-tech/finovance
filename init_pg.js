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

      CREATE TABLE IF NOT EXISTS public.bilans (
        id uuid default gen_random_uuid() primary key,
        client_id uuid references public.clients(id) on delete cascade not null UNIQUE,
        
        -- Emplois
        immob_corporelles numeric default 0,
        immob_corporelles_en_cours numeric default 0,
        immob_incorporelles numeric default 0,
        immob_financieres numeric default 0,
        stocks numeric default 0,
        creances_clients numeric default 0,
        autres_actifs_courants numeric default 0,
        autres_actifs_financiers numeric default 0,
        liquidite_equivalents numeric default 0,
        
        -- Ressources
        capitaux_propres numeric default 0,
        amortissements_provisions numeric default 0,
        provisions_risques_charges numeric default 0,
        emprunt_dettes_financieres numeric default 0,
        dettes_fournisseurs numeric default 0,
        autres_passifs_courants numeric default 0,
        concours_bancaires_passifs_fin numeric default 0,
        
        -- Gestion
        ca numeric default 0,
        achats numeric default 0,
        resultat_net numeric default 0,
        caf numeric default 0,
        
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.bilans DISABLE ROW LEVEL SECURITY;
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
