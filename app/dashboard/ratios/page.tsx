"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

function RatiosContent() {
    const searchParams = useSearchParams();
    const initialClientId = searchParams.get("clientId");

    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>(initialClientId || "");
    const [loading, setLoading] = useState(true);

    // Valeurs du Bilan
    const [actifImmob, setActifImmob] = useState<string | number>("");
    const [stocks, setStocks] = useState<string | number>("");
    const [creancesClients, setCreancesClients] = useState<string | number>("");
    const [autresActifsCirc, setAutresActifsCirc] = useState<string | number>("");
    const [tresorerieActif, setTresorerieActif] = useState<string | number>("");

    const [capitauxPropres, setCapitauxPropres] = useState<string | number>("");
    const [amortissements, setAmortissements] = useState<string | number>("");
    const [provRisques, setProvRisques] = useState<string | number>("");
    const [dettesFinancieres, setDettesFinancieres] = useState<string | number>(""); // Emprunts
    const [dettesFournisseurs, setDettesFournisseurs] = useState<string | number>("");
    const [autresPassifsCourants, setAutresPassifsCourants] = useState<string | number>("");
    const [tresoreriePassif, setTresoreriePassif] = useState<string | number>("");

    // Valeurs de Gestion (Compte de Résultat)
    const [ca, setCa] = useState<string | number>("");
    const [achats, setAchats] = useState<string | number>("");
    const [resultatNet, setResultatNet] = useState<string | number>("");
    const [caf, setCaf] = useState<string | number>("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from("clients").select("id, name").order("name");
        if (data) setClients(data);
        setLoading(false);
    };

    // Cast as numbers
    const nActifImmob = Number(actifImmob) || 0;
    const nStocks = Number(stocks) || 0;
    const nCreancesClients = Number(creancesClients) || 0;
    const nAutresActifsCirc = Number(autresActifsCirc) || 0;
    const nTresorerieActif = Number(tresorerieActif) || 0;

    const nCapitauxPropres = Number(capitauxPropres) || 0;
    const nAmortissements = Number(amortissements) || 0;
    const nProvRisques = Number(provRisques) || 0;
    const nDettesFinancieres = Number(dettesFinancieres) || 0;
    const nDettesFournisseurs = Number(dettesFournisseurs) || 0;
    const nAutresPassifsCourants = Number(autresPassifsCourants) || 0;
    const nTresoreriePassif = Number(tresoreriePassif) || 0;

    const nCa = Number(ca) || 0;
    const nAchats = Number(achats) || 0;
    const nResultatNet = Number(resultatNet) || 0;
    const nCaf = Number(caf) || 0;

    // Calculs intermédiaires
    const totalActifCourant = nStocks + nCreancesClients + nAutresActifsCirc + nTresorerieActif;
    const totalActif = nActifImmob + totalActifCourant;

    const totalPassifCourant = nDettesFournisseurs + nAutresPassifsCourants + nTresoreriePassif;
    const ressourcesStables = nCapitauxPropres + nAmortissements + nProvRisques + nDettesFinancieres;
    const totalPassif = ressourcesStables + totalPassifCourant;

    const totalDettes = nDettesFinancieres + nDettesFournisseurs + nAutresPassifsCourants + nTresoreriePassif;

    // Ratios calculés
    const liquiditeGenerale = totalPassifCourant > 0 ? totalActifCourant / totalPassifCourant : 0;
    const liquiditeReduite = totalPassifCourant > 0 ? (totalActifCourant - nStocks) / totalPassifCourant : 0;
    const liquiditeImmediate = totalPassifCourant > 0 ? nTresorerieActif / totalPassifCourant : 0;

    const endettement = totalActif > 0 ? totalDettes / totalActif : 0;
    const autonomieFinanciere = totalActif > 0 ? nCapitauxPropres / totalActif : 0;
    const leverageFinancier = nCapitauxPropres > 0 ? totalDettes / nCapitauxPropres : 0;
    const capaciteRemboursement = nCaf > 0 ? nDettesFinancieres / nCaf : 0;

    const roa = totalActif > 0 ? nResultatNet / totalActif : 0;
    const roe = nCapitauxPropres > 0 ? nResultatNet / nCapitauxPropres : 0;
    const margeNette = nCa > 0 ? nResultatNet / nCa : 0;

    const fondsDeRoulement = ressourcesStables - nActifImmob;
    const besoinFondsDeRoulement = (nStocks + nCreancesClients + nAutresActifsCirc) - (nDettesFournisseurs + nAutresPassifsCourants);
    const tresorerieNette = fondsDeRoulement - besoinFondsDeRoulement;

    // Ratios de Gestion
    const delaiMoyenStockage = nCa > 0 && nStocks > 0 ? (nStocks / nAchats) * 360 : 0;
    const delaiMoyenRecouvrement = nCa > 0 ? (nCreancesClients / nCa) * 360 : 0;
    const delaiMoyenPaiementV = nAchats > 0 ? (nDettesFournisseurs / nAchats) * 360 : 0;

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();

        const bilanData = [
            ["Poste Actif", "Montant", "Poste Passif", "Montant"],
            ["Actif Immobilisé Brut", nActifImmob, "Capitaux Propres", nCapitauxPropres],
            ["Stocks", nStocks, "Amortissements & Provisions", nAmortissements],
            ["Créances Clients", nCreancesClients, "Provisions Risques & Charges", nProvRisques],
            ["Autres Actifs Circulants", nAutresActifsCirc, "Dettes Financières (Emprunts)", nDettesFinancieres],
            ["Trésorerie Actif", nTresorerieActif, "Dettes Fournisseurs", nDettesFournisseurs],
            ["", "", "Autres Passifs Courants", nAutresPassifsCourants],
            ["", "", "Trésorerie Passif", nTresoreriePassif],
            [],
            ["TOTAL ACTIF", totalActif, "TOTAL PASSIF", totalPassif],
            [],
            ["Données de Gestion", ""],
            ["Chiffre d'Affaires", nCa],
            ["Achats (Coût des ventes)", nAchats],
            ["Résultat Net", nResultatNet],
            ["Capacité Autofinancement (CAF)", nCaf]
        ];

        const wsBilan = XLSX.utils.aoa_to_sheet(bilanData);
        XLSX.utils.book_append_sheet(wb, wsBilan, "Bilan & Gestion");

        const ratiosData = [
            ["Catégorie", "Ratio", "Valeur"],
            ["Liquidité", "Liquidité Générale", liquiditeGenerale.toFixed(2)],
            ["Liquidité", "Liquidité Réduite", liquiditeReduite.toFixed(2)],
            ["Liquidité", "Liquidité Immédiate", liquiditeImmediate.toFixed(2)],

            ["Solvabilité", "Endettement global", (endettement * 100).toFixed(2) + "%"],
            ["Solvabilité", "Autonomie Financière", (autonomieFinanciere * 100).toFixed(2) + "%"],
            ["Solvabilité", "Leverage Financier", leverageFinancier.toFixed(2)],
            ["Solvabilité", "Capacité Remboursement (Années)", capaciteRemboursement.toFixed(2)],

            ["Rentabilité", "ROA (Rentabilité Economique)", (roa * 100).toFixed(2) + "%"],
            ["Rentabilité", "ROE (Rentabilité Financière)", (roe * 100).toFixed(2) + "%"],
            ["Rentabilité", "Marge Nette", (margeNette * 100).toFixed(2) + "%"],

            ["Structure Fin.", "Fonds de Roulement (FR)", fondsDeRoulement],
            ["Structure Fin.", "Besoin en Fonds de Roulement (BFR)", besoinFondsDeRoulement],
            ["Structure Fin.", "Trésorerie Nette", tresorerieNette],

            ["Gestion", "Délai de rotation des stocks (Jours)", delaiMoyenStockage.toFixed(0)],
            ["Gestion", "Délai de recouvrement (Jours)", delaiMoyenRecouvrement.toFixed(0)],
            ["Gestion", "Délai paiement fournisseur (Jours)", delaiMoyenPaiementV.toFixed(0)],
        ];

        const wsRatios = XLSX.utils.aoa_to_sheet(ratiosData);
        XLSX.utils.book_append_sheet(wb, wsRatios, "Ratios");

        const clientName = clients.find(c => c.id === selectedClient)?.name || "Client";
        XLSX.writeFile(wb, `Analyse_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportPDF = () => {
        window.print();
    };

    return (
        <div className="animate-fade-in ratios-page">
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body * { visibility: hidden; }
          .ratios-page, .ratios-page * { visibility: visible; }
          .ratios-page { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                    <h1 className="section-title">Analyse du Bilan & Ratios</h1>
                    <p className="section-subtitle">Saisissez les données financières pour générer l'analyse</p>
                </div>

                <div className="no-print" style={{ display: "flex", gap: "10px" }}>
                    <button onClick={exportPDF} style={{
                        padding: "10px 18px", borderRadius: "10px", border: "1px solid var(--border)",
                        background: "var(--bg-card)", color: "var(--text-secondary)",
                        fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}>
                        🖨️ Imprimer PDF
                    </button>
                    <button onClick={exportExcel} style={{
                        padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.4)",
                        background: "rgba(16,185,129,0.1)", color: "#34d399",
                        fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}>
                        💾 Exporter Excel
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ color: "var(--text-muted)" }}>Chargement des clients...</div>
            ) : (
                <div className="no-print" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>Client étudié :</span>
                    <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="input" style={{ width: "300px" }}>
                        <option value="">-- Sélectionnez un client --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Grid Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                {/* Actif */}
                <div className="card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-blue)", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                        Bilan - Emplois (Actif)
                    </h3>
                    <InputRow label="Actif Immobilisé Brut" val={actifImmob} set={(v) => setActifImmob(v)} />
                    <InputRow label="Stocks" val={stocks} set={(v) => setStocks(v)} />
                    <InputRow label="Créances Clients" val={creancesClients} set={(v) => setCreancesClients(v)} />
                    <InputRow label="Autres Actifs Circulants" val={autresActifsCirc} set={(v) => setAutresActifsCirc(v)} />
                    <InputRow label="Trésorerie Actif" val={tresorerieActif} set={(v) => setTresorerieActif(v)} />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "2px solid var(--border)", fontWeight: 700 }}>
                        <span>TOTAL ACTIF</span>
                        <span style={{ color: "var(--text-primary)" }}>{totalActif.toLocaleString()} TND</span>
                    </div>
                </div>

                {/* Passif */}
                <div className="card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-purple)", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                        Bilan - Ressources (Passif)
                    </h3>
                    <InputRow label="Capitaux Propres" val={capitauxPropres} set={(v) => setCapitauxPropres(v)} />
                    <InputRow label="Amortissements & Prov." val={amortissements} set={(v) => setAmortissements(v)} />
                    <InputRow label="Provision Risques & Charges" val={provRisques} set={(v) => setProvRisques(v)} />
                    <InputRow label="Emprunts (Dettes Fin.)" val={dettesFinancieres} set={(v) => setDettesFinancieres(v)} />
                    <InputRow label="Dettes Fournisseurs" val={dettesFournisseurs} set={(v) => setDettesFournisseurs(v)} />
                    <InputRow label="Autres Passifs Courants" val={autresPassifsCourants} set={(v) => setAutresPassifsCourants(v)} />
                    <InputRow label="Trésorerie Passif" val={tresoreriePassif} set={(v) => setTresoreriePassif(v)} />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "2px solid var(--border)", fontWeight: 700 }}>
                        <span>TOTAL PASSIF</span>
                        <span style={{ color: totalPassif === totalActif ? "#10b981" : "#ef4444" }}>
                            {totalPassif.toLocaleString()} TND
                        </span>
                    </div>
                    {totalPassif !== totalActif && totalActif > 0 && totalPassif > 0 && (
                        <div style={{ fontSize: "11px", color: "#ef4444", textAlign: "right", marginTop: "4px" }}>Déséquilibre: {Math.abs(totalActif - totalPassif).toLocaleString()} TND</div>
                    )}
                </div>

                {/* Compte Résultat */}
                <div className="card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#10b981", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                        Données de Gestion
                    </h3>
                    <InputRow label="Chiffre d'Affaires (CA)" val={ca} set={(v) => setCa(v)} />
                    <InputRow label="Achats (Coût Ventes/Exploitation)" val={achats} set={(v) => setAchats(v)} />
                    <InputRow label="Résultat Net" val={resultatNet} set={(v) => setResultatNet(v)} />
                    <InputRow label="Capacité d'Autofinancement" val={caf} set={(v) => setCaf(v)} />
                </div>
            </div>

            {/* Ratios Display */}
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Ratios Financiers Calculés</h2>

            <div style={{ display: "grid", gap: "24px" }}>

                {/* Row 1 */}
                <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>1. Liquidité (Capacité à payer à court terme)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <RatioCard title="Liquidité Générale" value={liquiditeGenerale.toFixed(2)} unit="x" />
                        <RatioCard title="Liquidité Réduite" value={liquiditeReduite.toFixed(2)} unit="x" />
                        <RatioCard title="Liquidité Immédiate" value={liquiditeImmediate.toFixed(2)} unit="x" />
                    </div>
                </div>

                {/* Row 2 */}
                <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>2. Solvabilité (Capacité à long terme)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <RatioCard title="Taux d'endettement" value={(endettement * 100).toFixed(2)} unit="%" />
                        <RatioCard title="Autonomie Financière" value={(autonomieFinanciere * 100).toFixed(2)} unit="%" />
                        <RatioCard title="Leverage Financier" value={leverageFinancier.toFixed(2)} unit="x" />
                        <RatioCard title="Capacité Remboursement" value={capaciteRemboursement.toFixed(2)} unit="ans" />
                    </div>
                </div>

                {/* Row 3 */}
                <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>3. Rentabilité (Performance)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <RatioCard title="ROA (Rentabilité Eco.)" value={(roa * 100).toFixed(2)} unit="%" />
                        <RatioCard title="ROE (Rentabilité Fin.)" value={(roe * 100).toFixed(2)} unit="%" />
                        <RatioCard title="Marge Nette" value={(margeNette * 100).toFixed(2)} unit="%" />
                    </div>
                </div>

                {/* Row 4 */}
                <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>4. Structure Financière</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <RatioCard title="Fonds de Roulement (FR)" value={fondsDeRoulement.toLocaleString()} unit="TND" />
                        <RatioCard title="Besoin en FR (BFR)" value={besoinFondsDeRoulement.toLocaleString()} unit="TND" />
                        <RatioCard title="Trésorerie Nette" value={tresorerieNette.toLocaleString()} unit="TND" />
                    </div>
                </div>

                {/* Row 5 */}
                <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>5. Gestion (Rotation)</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <RatioCard title="Délai Moyen Stockage" value={delaiMoyenStockage.toFixed(0)} unit="jours" />
                        <RatioCard title="Délai Moyen Recouvrement" value={delaiMoyenRecouvrement.toFixed(0)} unit="jours" />
                        <RatioCard title="Délai Régl. Fournisseurs" value={delaiMoyenPaiementV.toFixed(0)} unit="jours" />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function RatiosPage() {
    return (
        <Suspense fallback={<div style={{ color: "var(--text-muted)", padding: "20px" }}>Chargement...</div>}>
            <RatiosContent />
        </Suspense>
    );
}

const InputRow = ({ label, val, set }: { label: string, val: string | number, set: (v: string) => void }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px dashed var(--border-light)" }}>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <input
            type="text" className="input" inputMode="decimal"
            style={{ width: "120px", textAlign: "right", padding: "6px" }}
            value={val === 0 ? "" : val}
            onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9.-]/g, '');
                set(cleaned);
            }}
            placeholder="0"
        />
    </div>
);

const RatioCard = ({ title, value, unit = "" }: { title: string, value: string | number, unit?: string }) => (
    <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px",
        padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px" }}>{title}</div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{value} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>{unit}</span></div>
    </div>
);
