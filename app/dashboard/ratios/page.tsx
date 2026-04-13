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
    const [actifImmob, setActifImmob] = useState(0);
    const [stocks, setStocks] = useState(0);
    const [creancesClients, setCreancesClients] = useState(0);
    const [autresActifsCirc, setAutresActifsCirc] = useState(0);
    const [tresorerieActif, setTresorerieActif] = useState(0);

    const [capitauxPropres, setCapitauxPropres] = useState(0);
    const [amortissements, setAmortissements] = useState(0);
    const [provRisques, setProvRisques] = useState(0);
    const [dettesFinancieres, setDettesFinancieres] = useState(0); // Emprunts
    const [dettesFournisseurs, setDettesFournisseurs] = useState(0);
    const [autresPassifsCourants, setAutresPassifsCourants] = useState(0);
    const [tresoreriePassif, setTresoreriePassif] = useState(0);

    // Valeurs de Gestion (Compte de Résultat)
    const [ca, setCa] = useState(0);
    const [achats, setAchats] = useState(0);
    const [resultatNet, setResultatNet] = useState(0);
    const [caf, setCaf] = useState(0);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from("clients").select("id, name").order("name");
        if (data) setClients(data);
        setLoading(false);
    };

    // Calculs intermédiaires
    const totalActifCourant = stocks + creancesClients + autresActifsCirc + tresorerieActif;
    const totalActif = actifImmob + totalActifCourant;

    const totalPassifCourant = dettesFournisseurs + autresPassifsCourants + tresoreriePassif;
    const ressourcesStables = capitauxPropres + amortissements + provRisques + dettesFinancieres;
    const totalPassif = ressourcesStables + totalPassifCourant;

    const totalDettes = dettesFinancieres + dettesFournisseurs + autresPassifsCourants + tresoreriePassif;

    // Ratios calculés
    const liquiditeGenerale = totalPassifCourant > 0 ? totalActifCourant / totalPassifCourant : 0;
    const liquiditeReduite = totalPassifCourant > 0 ? (totalActifCourant - stocks) / totalPassifCourant : 0;
    const liquiditeImmediate = totalPassifCourant > 0 ? tresorerieActif / totalPassifCourant : 0;

    const endettement = totalActif > 0 ? totalDettes / totalActif : 0;
    const autonomieFinanciere = totalBilan() > 0 ? capitauxPropres / totalBilan() : 0;
    const leverageFinancier = capitauxPropres > 0 ? totalDettes / capitauxPropres : 0;
    const capaciteRemboursement = caf > 0 ? dettesFinancieres / caf : 0;

    const roa = totalActif > 0 ? resultatNet / totalActif : 0;
    const roe = capitauxPropres > 0 ? resultatNet / capitauxPropres : 0;
    const margeNette = ca > 0 ? resultatNet / ca : 0;

    const fondsDeRoulement = ressourcesStables - actifImmob;
    const besoinFondsDeRoulement = (stocks + creancesClients + autresActifsCirc) - (dettesFournisseurs + autresPassifsCourants);
    const tresorerieNette = fondsDeRoulement - besoinFondsDeRoulement;

    // Ratios de Gestion
    const delaiMoyenStockage = ca > 0 && stocks > 0 ? (stocks / achats) * 360 : 0; // approximatif basé sur les achats/coût des ventes
    const delaiMoyenRecouvrement = ca > 0 ? (creancesClients / ca) * 360 : 0;
    const delaiMoyenPaiementV = achats > 0 ? (dettesFournisseurs / achats) * 360 : 0;

    function totalBilan() {
        // Total Actif = Total Passif si équilibré, mais on prend Actif pour calculer les ratios
        return totalActif;
    }

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();

        const bilanData = [
            ["Poste Actif", "Montant", "Poste Passif", "Montant"],
            ["Actif Immobilisé Brut", actifImmob, "Capitaux Propres", capitauxPropres],
            ["Stocks", stocks, "Amortissements & Provisions", amortissements],
            ["Créances Clients", creancesClients, "Provisions Risques & Charges", provRisques],
            ["Autres Actifs Circulants", autresActifsCirc, "Dettes Financières (Emprunts)", dettesFinancieres],
            ["Trésorerie Actif", tresorerieActif, "Dettes Fournisseurs", dettesFournisseurs],
            ["", "", "Autres Passifs Courants", autresPassifsCourants],
            ["", "", "Trésorerie Passif", tresoreriePassif],
            [],
            ["TOTAL ACTIF", totalActif, "TOTAL PASSIF", totalPassif],
            [],
            ["Données de Gestion", ""],
            ["Chiffre d'Affaires", ca],
            ["Achats (Coût des ventes)", achats],
            ["Résultat Net", resultatNet],
            ["Capacité Autofinancement (CAF)", caf]
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

    const InputRow = ({ label, val, set }: { label: string, val: number, set: (v: number) => void }) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px dashed var(--border-light)" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
            <input
                type="number" className="input"
                style={{ width: "120px", textAlign: "right", padding: "6px" }}
                value={val === 0 ? "" : val}
                onChange={(e) => set(Number(e.target.value))}
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
                    <InputRow label="Actif Immobilisé Brut" val={actifImmob} set={setActifImmob} />
                    <InputRow label="Stocks" val={stocks} set={setStocks} />
                    <InputRow label="Créances Clients" val={creancesClients} set={setCreancesClients} />
                    <InputRow label="Autres Actifs Circulants" val={autresActifsCirc} set={setAutresActifsCirc} />
                    <InputRow label="Trésorerie Actif" val={tresorerieActif} set={setTresorerieActif} />

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
                    <InputRow label="Capitaux Propres" val={capitauxPropres} set={setCapitauxPropres} />
                    <InputRow label="Amortissements & Prov." val={amortissements} set={setAmortissements} />
                    <InputRow label="Provision Risques & Charges" val={provRisques} set={setProvRisques} />
                    <InputRow label="Emprunts (Dettes Fin.)" val={dettesFinancieres} set={setDettesFinancieres} />
                    <InputRow label="Dettes Fournisseurs" val={dettesFournisseurs} set={setDettesFournisseurs} />
                    <InputRow label="Autres Passifs Courants" val={autresPassifsCourants} set={setAutresPassifsCourants} />
                    <InputRow label="Trésorerie Passif" val={tresoreriePassif} set={setTresoreriePassif} />

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
                    <InputRow label="Chiffre d'Affaires (CA)" val={ca} set={setCa} />
                    <InputRow label="Achats (Coût Ventes/Exploitation)" val={achats} set={setAchats} />
                    <InputRow label="Résultat Net" val={resultatNet} set={setResultatNet} />
                    <InputRow label="Capacité d'Autofinancement" val={caf} set={setCaf} />
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
