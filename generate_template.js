import * as XLSX from "xlsx";
import fs from "fs";

const data = [
    { "Nom": "Exemple Entreprise A", "Capital": 250000, "Dette": 50000, "Liquidite": 30000 },
    { "Nom": "Tech Solutions B", "Capital": 100000, "Dette": 80000, "Liquidite": 5000 },
    { "Nom": "Services C", "Capital": 500000, "Dette": 10000, "Liquidite": 150000 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Clients");

XLSX.writeFile(wb, "template_import_clients.xlsx");
console.log("Fichier 'template_import_clients.xlsx' cree avec succes.");
