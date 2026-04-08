"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("clients").select("*").eq("riskLevel", "Élevé").order("riskScore", { ascending: true }).then(({ data }) => {
            setAlerts(data ?? []);
            setLoading(false);
        });
    }, []);

    const getRecommendation = (riskScore: number, debt: number, capital: number, liquidity: number) => {
        const recommendations: string[] = [];
        if (capital <= 100000) recommendations.push("📈 Augmenter les fonds propres pour consolider le bilan.");
        if (debt >= 50000) recommendations.push("📉 Réduire la dette — le taux d'endettement dépasse les seuils acceptables.");
        if (liquidity <= 20000) recommendations.push("💧 Améliorer la trésorerie — liquidités insuffisantes pour absorber les chocs.");
        if (riskScore === 0) recommendations.push("🚨 Situation critique — une intervention immédiate est recommandée.");
        return recommendations.length > 0 ? recommendations : ["🔍 Audit complet du profil financier recommandé."];
    };

    const severityColor = (score: number) => {
        if (score === 0) return { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.4)", dot: "#ef4444", label: "Critique" };
        if (score < 30) return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", dot: "#f97316", label: "Élevé" };
        return { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", dot: "#f59e0b", label: "Modéré" };
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">🔔 Centre d'Alertes</h1>
                <p className="section-subtitle">Clients à haut risque nécessitant une attention immédiate</p>
            </div>

            {/* Summary banner */}
            <div className="card" style={{ marginBottom: "24px", padding: "20px 24px", display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "center", background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "36px" }}>🚨</div>
                    <div>
                        <div style={{ fontSize: "28px", fontWeight: 800, color: "#ef4444" }}>{alerts.length}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Alertes actives</div>
                    </div>
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {alerts.length === 0
                            ? "✅ Aucune alerte active — tous les clients sont dans les seuils acceptables."
                            : `${alerts.length} client(s) présentent un niveau de risque élevé. Consultez les recommandations ci-dessous pour chaque profil.`}
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Chargement des alertes…</div>
            ) : alerts.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "60px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Aucune alerte</div>
                    <div style={{ color: "var(--text-muted)" }}>Tous les clients sont dans les seuils de risque acceptables.</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {alerts.map((client, i) => {
                        const sev = severityColor(client.riskScore);
                        const recs = getRecommendation(client.riskScore, client.debt, client.capital, client.liquidity);
                        return (
                            <div key={client.id} className="card" style={{
                                padding: "20px 24px",
                                background: sev.bg,
                                border: `1px solid ${sev.border}`,
                                animationDelay: `${i * 0.05}s`
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: sev.dot, boxShadow: `0 0 8px ${sev.dot}` }} />
                                        <div>
                                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                Capital : {Number(client.capital).toLocaleString("fr-FR")} TND &nbsp;·&nbsp; Dette : {Number(client.debt).toLocaleString("fr-FR")} TND &nbsp;·&nbsp; Liquidité : {Number(client.liquidity).toLocaleString("fr-FR")} TND
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: "22px", fontWeight: 800, color: sev.dot }}>{client.riskScore}%</span>
                                        <span className="badge badge-red">{sev.label}</span>
                                    </div>
                                </div>

                                {/* Risk bar */}
                                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginBottom: "16px", overflow: "hidden" }}>
                                    <div style={{ width: `${client.riskScore}%`, height: "100%", background: `linear-gradient(90deg, #ef4444, #f97316)`, borderRadius: "2px" }} />
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "8px" }}>RECOMMANDATIONS</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {recs.map((rec, j) => (
                                            <div key={j} style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                                {rec}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
