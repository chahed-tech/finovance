"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar,
} from "recharts";

const COLORS = { "Élevé": "#ef4444", "Moyen": "#f59e0b", "Faible": "#10b981" };

const monthlyData = [
  { mois: "Sep", score: 48 }, { mois: "Oct", score: 55 }, { mois: "Nov", score: 52 },
  { mois: "Déc", score: 61 }, { mois: "Jan", score: 58 }, { mois: "Fév", score: 65 },
];

const CustomTooltipStyle = {
  backgroundColor: "#1e293b", border: "1px solid #334155",
  borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "12px",
};

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (!error && data) setClients(data);
    setLoading(false);
  };

  const highRisk = clients.filter(c => c.riskLevel === "Élevé").length;
  const medRisk = clients.filter(c => c.riskLevel === "Moyen").length;
  const lowRisk = clients.filter(c => c.riskLevel === "Faible").length;
  const avgScore = clients.length ? Math.round(clients.reduce((a, b) => a + b.riskScore, 0) / clients.length) : 0;
  const totalPortfolio = clients.reduce((a, b) => a + (Number(b.capital) || 0), 0);
  const avgDebtRatio = clients.length
    ? Math.round(clients.reduce((a, b) => a + (b.capital > 0 ? (b.debt / b.capital) * 100 : 0), 0) / clients.length)
    : 0;

  const pieData = [
    { name: "Élevé", value: highRisk },
    { name: "Moyen", value: medRisk },
    { name: "Faible", value: lowRisk },
  ].filter(d => d.value > 0);

  const topRiskClients = [...clients].sort((a, b) => a.riskScore - b.riskScore).slice(0, 6);

  const stats = [
    { label: "Total Clients", value: clients.length, icon: "👥", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { label: "Haut Risque", value: highRisk, icon: "🔴", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    { label: "Score Moyen", value: `${avgScore}%`, icon: "📈", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { label: "Alertes Actives", value: highRisk, icon: "🔔", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { label: "Portefeuille Total", value: totalPortfolio > 0 ? `${(totalPortfolio / 1000).toFixed(0)}K TND` : "0 TND", icon: "💰", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    { label: "Ratio Dette/Capital", value: `${avgDebtRatio}%`, icon: "⚖️", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Vue d'ensemble de la gestion des risques financiers</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: "22px" }}>{s.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "4px" }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? "—" : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Pie Chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "15px" }}>Distribution des Risques</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Répartition par niveau</div>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend
                  formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "15px" }}>Évolution du Score Moyen</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>6 derniers mois</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mois" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
                dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6, fill: "#60a5fa" }} name="Score moyen" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Bar Chart: Top Risk Clients */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "15px" }}>Clients à Risque Élevé</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Scores les plus faibles</div>
          {topRiskClients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Aucun client</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topRiskClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Bar dataKey="riskScore" name="Score de risque" radius={[0, 4, 4, 0]}>
                  {topRiskClients.map((entry, index) => (
                    <Cell key={index} fill={entry.riskScore < 50 ? "#ef4444" : entry.riskScore < 80 ? "#f59e0b" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "15px" }}>Alertes Actives</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Surveillance en temps réel</div>
          {highRisk === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--accent-green)" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontWeight: 600 }}>Aucune alerte critique</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {clients.filter(c => c.riskLevel === "Élevé").slice(0, 4).map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", background: "rgba(239,68,68,0.08)",
                  borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <div style={{ fontSize: "18px" }}>🚨</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: "#f87171" }}>Score de risque : {c.riskScore}% — Intervention requise</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "15px" }}>Derniers Clients</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Clients récemment enregistrés</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Capital</th>
                <th>Dette</th>
                <th>Liquidité</th>
                <th>Score</th>
                <th>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Chargement...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Aucun client enregistré</td></tr>
              ) : clients.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                  <td>{c.capital?.toLocaleString("fr-FR")} TND</td>
                  <td>{c.debt?.toLocaleString("fr-FR")} TND</td>
                  <td>{c.liquidity?.toLocaleString("fr-FR")} TND</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "60px", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${c.riskScore}%`, height: "100%", borderRadius: "3px",
                          background: c.riskScore < 50 ? "#ef4444" : c.riskScore < 80 ? "#f59e0b" : "#10b981"
                        }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{c.riskScore}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.riskLevel === "Élevé" ? "badge-red" : c.riskLevel === "Moyen" ? "badge-yellow" : "badge-green"}`}>
                      {c.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}