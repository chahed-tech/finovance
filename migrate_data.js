import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Ancienne base de données (celle inaccessible via dashboard)
const oldUrl = 'https://qhjxocdecdnuwlggwwan.supabase.co';
const oldKey = 'sb_publishable_6TcPapCGqgxS-IFPxG40QA_sSm6TjC2';
const oldSupabase = createClient(oldUrl, oldKey);

async function backupData() {
    console.log("Tentative de récupération des données depuis l'ancienne base...");
    const { data: clients, error } = await oldSupabase.from('clients').select('*');

    if (error) {
        console.error("Erreur, impossible de lire (RLS problement activé) :", error);
        return;
    }

    if (clients) {
        fs.writeFileSync('clients_backup.json', JSON.stringify(clients, null, 2));
        console.log(`✅ SUCCÈS : ${clients.length} clients sauvegardés localement dans le fichier "clients_backup.json" ! Vos données sont en sécurité.`);
    } else {
        console.log("Aucune donnée trouvée.");
    }
}

backupData();
