"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";

const CustomTooltipStyle = {
    backgroundColor: "#1e293b", border: "1px solid #334155",
    borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "12px",
};

export default function RisksPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("clients").select("*").order("riskScore", { ascending: true }).then(({ data }) => {
            setClients(data ?? []);
            setLoading(false);
        });
    }, []);

    const high = clients.filter(c => c.riskLevel === "Élevé");
    const med = clients.filter(c => c.riskLevel === "Moyen");
    const low = clients.filter(c => c.riskLevel === "Faible");

    const radarData = [
        { subject: "Capital", A: clients.length ? Math.round(clients.reduce((a, b) => a + (b.capital > 100000 ? 100 : 30), 0) / clients.length) : 0 },
        { subject: "Dette", A: clients.length ? Math.round(clients.reduce((a, b) => a + (b.debt < 50000 ? 80 : 20), 0) / clients.length) : 0 },
        { subject: "Liquidité", A: clients.length ? Math.round(clients.reduce((a, b) => a + (b.liquidity > 20000 ? 90 : 25), 0) / clients.length) : 0 },
        { subject: "Solvabilité", A: clients.length ? Math.round(clients.reduce((a, b) => a + b.riskScore, 0) / clients.length) : 0 },
        { subject: "Score Glob.", A: clients.length ? Math.round(clients.reduce((a, b) => a + b.riskScore, 0) / clients.length) : 0 },
    ];

    const thresholds = [
        { label: "Score minimum réglementaire", value: 50, color: "#f59e0b" },
        { label: "Seuil d'alerte", value: 30, color: "#ef4444" },
        { label: "Seuil optimal", value: 80, color: "#10b981" },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">Analyse des Risques</h1>
                <p className="section-subtitle">Vue détaillée et indicateurs de risque par client</p>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Risque Élevé", count: high.length, color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "🔴", pct: clients.length ? Math.round(high.length / clients.length * 100) : 0 },
                    { label: "Risque Moyen", count: med.length, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "🟡", pct: clients.length ? Math.round(med.length / clients.length * 100) : 0 },
                    { label: "Risque Faible", count: low.length, color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: "🟢", pct: clients.length ? Math.round(low.length / clients.length * 100) : 0 },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>
                            <span style={{ fontSize: "22px" }}>{s.icon}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.5px" }}>{s.label.toUpperCase()}</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{loading ? "—" : s.count}</div>
                            <div style={{ marginTop: "6px", height: "4px", background: "var(--border)", borderRadius: "2px" }}>
                                <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: "2px", transition: "width 1s ease" }} />
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>{s.pct}% du portefeuille</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                {/* Bar Chart */}
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Score de Risque par Client</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
                        Classé du plus risqué au moins risqué
                    </div>
                    {clients.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Aucune donnée</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={clients.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip contentStyle={CustomTooltipStyle} />
                                <Bar dataKey="riskScore" name="Score" radius={[4, 4, 0, 0]}>
                                    {clients.slice(0, 10).map((entry, index) => (
                                        <Cell key={index} fill={entry.riskScore < 50 ? "#ef4444" : entry.riskScore < 80 ? "#f59e0b" : "#10b981"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Radar Chart */}
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Profil de Risque Global</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
                        Analyse multidimensionnelle du portefeuille
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Radar name="Portefeuille" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                            <Legend formatter={(v) => <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{v}</span>} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Thresholds + High Risk Table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Regulatory thresholds */}
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Seuils Réglementaires</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Conformité aux normes de risque</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {thresholds.map((t, i) => (
                            <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{t.label}</span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: t.color }}>{t.value}%</span>
                                </div>
                                <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${t.value}%`, height: "100%", background: t.color, borderRadius: "4px" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Clients at high risk */}
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Clients à Surveillance Prioritaire</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Score &lt; 50% — Intervention requise</div>
                    {high.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px", color: "var(--accent-green)" }}>
                            <div style={{ fontSize: "28px" }}>✅</div>
                            <div style={{ marginTop: "8px", fontWeight: 600 }}>Aucun client critique</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {high.map((c, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 14px", background: "rgba(239,68,68,0.08)",
                                    borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)",
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Capital : {Number(c.capital).toLocaleString("fr-FR")} €</div>
                                    </div>
                                    <span className="badge badge-red">{c.riskScore}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
