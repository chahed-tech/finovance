"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CustomTooltipStyle = {
    backgroundColor: "#1e293b", border: "1px solid #334155",
    borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "12px",
};

const areaData = [
    { mois: "Sep", valeur: 2100000 }, { mois: "Oct", valeur: 2350000 },
    { mois: "Nov", valeur: 2200000 }, { mois: "Déc", valeur: 2600000 },
    { mois: "Jan", valeur: 2480000 }, { mois: "Fév", valeur: 2750000 },
];

type ReportType = {
    id: number;
    title: string;
    description: string;
    type: string;
    icon: string;
    color: string;
    generated: string;
};

const reports: ReportType[] = [
    { id: 1, title: "Rapport de Risque Global", description: "Synthèse des niveaux de risque par client et tendances", type: "Risque", icon: "⚠️", color: "#ef4444", generated: "27/02/2026" },
    { id: 2, title: "Rapport de Conformité KYC/AML", description: "État de conformité réglementaire et actions correctives", type: "Conformité", icon: "✅", color: "#10b981", generated: "25/02/2026" },
    { id: 3, title: "Export Portefeuille Clients", description: "Liste complète des clients avec scores et niveaux de risque", type: "Export", icon: "📋", color: "#3b82f6", generated: "27/02/2026" },
    { id: 4, title: "Rapport Réglementaire Bâle III", description: "Ratios de fonds propres et indicateurs prudentiels", type: "Réglementaire", icon: "🏦", color: "#8b5cf6", generated: "20/02/2026" },
    { id: 5, title: "Analyse de Solvabilité", description: "Évaluation de la solvabilité du portefeuille et stress tests", type: "Analyse", icon: "📊", color: "#f59e0b", generated: "15/02/2026" },
];

export default function ReportsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [generating, setGenerating] = useState<number | null>(null);

    useEffect(() => {
        supabase.from("clients").select("*").then(({ data }) => setClients(data ?? []));
    }, []);

    const high = clients.filter(c => c.riskLevel === "Élevé").length;
    const med = clients.filter(c => c.riskLevel === "Moyen").length;
    const low = clients.filter(c => c.riskLevel === "Faible").length;

    const pieData = [
        { name: "Élevé", value: high },
        { name: "Moyen", value: med },
        { name: "Faible", value: low },
    ].filter(d => d.value > 0);

    const COLORS: Record<string, string> = { "Élevé": "#ef4444", "Moyen": "#f59e0b", "Faible": "#10b981" };

    const handleGenerate = async (id: number, title: string) => {
        setGenerating(id);
        await new Promise(r => setTimeout(r, 1800));
        setGenerating(null);
        alert(`✅ Rapport "${title}" généré avec succès !`);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">Rapports</h1>
                <p className="section-subtitle">Génération et export de rapports réglementaires et analytiques</p>
            </div>

            {/* Charts summary */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Évolution du Portefeuille</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Valeur totale gérée (€)</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="mois" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                                tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: any) => [`${Number(v).toLocaleString("fr-FR")} €`, "Portefeuille"]} />
                            <Area type="monotone" dataKey="valeur" stroke="#3b82f6" fill="url(#areaGrad)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Répartition Actuelle</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Par niveau de risque</div>
                    {pieData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Aucune donnée</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={4} dataKey="value">
                                    {pieData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name]} />)}
                                </Pie>
                                <Tooltip contentStyle={CustomTooltipStyle} />
                                <Legend formatter={(v) => <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Reports List */}
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>
                Rapports Disponibles
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reports.map(r => (
                    <div key={r.id} className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                            width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
                            background: `${r.color}20`, border: `1px solid ${r.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                        }}>{r.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>{r.title}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.description}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                Dernier rapport : {r.generated} · <span className="badge badge-blue" style={{ fontSize: "10px" }}>{r.type}</span>
                            </div>
                        </div>
                        <button onClick={() => handleGenerate(r.id, r.title)}
                            disabled={generating === r.id}
                            style={{
                                padding: "9px 18px", borderRadius: "8px",
                                border: `1px solid ${generating === r.id ? "var(--border)" : r.color + "40"}`,
                                background: generating === r.id ? "var(--bg-secondary)" : `${r.color}20`,
                                color: generating === r.id ? "var(--text-muted)" : r.color,
                                fontWeight: 600, fontSize: "13px", cursor: generating === r.id ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: "6px",
                                transition: "all 0.2s",
                                flexShrink: 0,
                            }}>
                            {generating === r.id ? "⏳ Génération..." : "⬇️ Générer"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
