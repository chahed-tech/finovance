import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const newUrl = 'https://zgoptyqzofayoipnblmr.supabase.co';
const newKey = 'sb_publishable_JscOAAJ8MFNTLxukqXRByw_QkO9lo8s';
const newSupabase = createClient(newUrl, newKey);

async function uploadData() {
    console.log("Lecture des donnees locales...");
    const rawData = fs.readFileSync('clients_backup.json');
    const clients = JSON.parse(rawData);

    console.log("Injection de " + clients.length + " clients dans la nouvelle base...");

    // We upload in chunks to avoid hitting insert limits per request, but 561 is usually fine
    const { data, error } = await newSupabase.from('clients').insert(clients);

    if (error) {
        console.error("Erreur lors de l'insertion (Avez-vous bien execute le code SQL des tables ?) :", error.message);
    } else {
        console.log("✅ SUCCES : Tous les clients ont bien ete restaures dans la nouvelle base !");
    }
}

uploadData();
