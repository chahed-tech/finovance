"use client";
import { useState } from "react";

type ComplianceItem = {
    id: number;
    category: string;
    label: string;
    description: string;
    status: "Conforme" | "En attente" | "Non conforme";
    regulation: string;
};

const initialItems: ComplianceItem[] = [
    { id: 1, category: "KYC", label: "Vérification d'identité clients", description: "Contrôle des pièces d'identité et documents légaux", status: "Conforme", regulation: "Directive 2015/849/UE" },
    { id: 2, category: "KYC", label: "Mise à jour des dossiers clients", description: "Actualisation annuelle des informations clients", status: "En attente", regulation: "Directive 2015/849/UE" },
    { id: 3, category: "AML", label: "Surveillance des transactions", description: "Détection des transactions suspectes et signalement", status: "Conforme", regulation: "FATF Recommandations" },
    { id: 4, category: "AML", label: "Déclaration TRACFIN", description: "Déclarations obligatoires de soupçon", status: "Conforme", regulation: "Code monétaire et financier" },
    { id: 5, category: "AML", label: "Gel des avoirs", description: "Vérification des listes de sanctions internationales", status: "Non conforme", regulation: "Règlement UE 2016/1686" },
    { id: 6, category: "RGPD", label: "Consentement collecte de données", description: "Obtention du consentement explicite clients", status: "Conforme", regulation: "RGPD Art. 6" },
    { id: 7, category: "RGPD", label: "Droit à l'oubli", description: "Procédure de suppression des données clients", status: "En attente", regulation: "RGPD Art. 17" },
    { id: 8, category: "RGPD", label: "Registre des traitements", description: "Documentation des activités de traitement", status: "Conforme", regulation: "RGPD Art. 30" },
    { id: 9, category: "Réglementaire", label: "Rapport de risque trimestriel", description: "Soumission des rapports aux autorités compétentes", status: "Conforme", regulation: "Bâle III" },
    { id: 10, category: "Réglementaire", label: "Ratio de fonds propres", description: "Maintien du ratio CET1 > 8%", status: "En attente", regulation: "Bâle III / CRR" },
];

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
    "Conforme": { badge: "badge-green", dot: "#10b981" },
    "En attente": { badge: "badge-yellow", dot: "#f59e0b" },
    "Non conforme": { badge: "badge-red", dot: "#ef4444" },
};

const CATEGORIES = ["Tous", "KYC", "AML", "RGPD", "Réglementaire"];

export default function CompliancePage() {
    const [items, setItems] = useState<ComplianceItem[]>(initialItems);
    const [filter, setFilter] = useState("Tous");
    const [statusFilter, setStatusFilter] = useState("Tous");

    const filtered = items
        .filter(i => filter === "Tous" || i.category === filter)
        .filter(i => statusFilter === "Tous" || i.status === statusFilter);

    const conforme = items.filter(i => i.status === "Conforme").length;
    const pending = items.filter(i => i.status === "En attente").length;
    const nonConf = items.filter(i => i.status === "Non conforme").length;
    const score = Math.round((conforme / items.length) * 100);

    const cycleStatus = (id: number) => {
        const cycle: ComplianceItem["status"][] = ["Conforme", "En attente", "Non conforme"];
        setItems(prev => prev.map(i => {
            if (i.id !== id) return i;
            const idx = cycle.indexOf(i.status);
            return { ...i, status: cycle[(idx + 1) % 3] };
        }));
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">Conformité Réglementaire</h1>
                <p className="section-subtitle">Suivi KYC, AML et RGPD — Tableau de bord de conformité</p>
            </div>

            {/* Score global */}
            <div className="card" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "32px" }}>
                <div style={{ position: "relative", width: "100px", height: "100px" }}>
                    <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100px", height: "100px" }}>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
                            strokeWidth="3" strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "20px", fontWeight: 800, color: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444" }}>{score}%</span>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Score de Conformité Global</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                        {score >= 80 ? "Niveau de conformité satisfaisant" : score >= 60 ? "Améliorations nécessaires" : "Niveau critique — action immédiate requise"}
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        {[
                            { label: "Conformes", val: conforme, color: "#10b981" },
                            { label: "En attente", val: pending, color: "#f59e0b" },
                            { label: "Non conformes", val: nonConf, color: "#ef4444" },
                        ].map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color }} />
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}><strong style={{ color: s.color }}>{s.val}</strong> {s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{
                        padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        border: "1px solid var(--border)",
                        background: filter === cat ? "var(--accent-blue)" : "var(--bg-card)",
                        color: filter === cat ? "white" : "var(--text-secondary)",
                    }}>{cat}</button>
                ))}
                <div style={{ borderLeft: "1px solid var(--border)", margin: "0 4px" }} />
                {["Tous", "Conforme", "En attente", "Non conforme"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} style={{
                        padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s",
                        border: `1px solid ${statusFilter === s ? "var(--accent-blue)" : "var(--border)"}`,
                        background: statusFilter === s ? "rgba(59,130,246,0.15)" : "var(--bg-card)",
                        color: statusFilter === s ? "var(--accent-blue)" : "var(--text-secondary)",
                    }}>{s}</button>
                ))}
            </div>

            {/* Compliance items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map(item => (
                    <div key={item.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS[item.status].dot, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{item.label}</span>
                                <span className="badge badge-blue" style={{ fontSize: "10px" }}>{item.category}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.description}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>📋 {item.regulation}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                            <span className={`badge ${STATUS_COLORS[item.status].badge}`}>{item.status}</span>
                            <button onClick={() => cycleStatus(item.id)} style={{
                                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                                borderRadius: "6px", padding: "5px 10px", cursor: "pointer",
                                color: "var(--text-muted)", fontSize: "12px", transition: "all 0.2s",
                            }}>Modifier</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
