"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
    id: string;
    email: string;
    role: string;
    created_at: string;
};

const ROLES = ["user", "analyst", "manager", "admin"];

const ROLE_LABELS: Record<string, { label: string; badge: string; desc: string }> = {
    user: { label: "Utilisateur", badge: "badge-blue", desc: "Accès lecture seule" },
    analyst: { label: "Analyste", badge: "badge-green", desc: "Accès analyse et rapports" },
    manager: { label: "Manager", badge: "badge-yellow", desc: "Gestion clients et risques" },
    admin: { label: "Administrateur", badge: "badge-purple", desc: "Accès complet" },
};

export default function AdminPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentRole, setCurrentRole] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: session } = await supabase.auth.getSession();
            if (!session.session?.user) return;
            const uid = session.session.user.id;
            setCurrentUser(session.session.user);

            const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).single();
            setCurrentRole(profile?.role ?? "user");

            // Fetch all profiles with email from auth (server-side won't work in client, use profiles + list)
            const { data: allProfiles } = await supabase
                .from("profiles")
                .select("id, role, created_at")
                .order("created_at", { ascending: false });

            if (allProfiles) {
                // Enrich with email from auth (works if RLS allows or using service role)
                // For now we display id and role; email will show "—" if not accessible
                setProfiles(allProfiles.map(p => ({ ...p, email: p.id === uid ? session.session!.user.email ?? "—" : "—" })));
            }
            setLoading(false);
        };
        init();
    }, []);

    const updateRole = async (profileId: string, newRole: string) => {
        if (profileId === currentUser?.id && newRole !== "admin") {
            alert("Vous ne pouvez pas retirer votre propre rôle admin.");
            return;
        }
        setUpdating(profileId);
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profileId);
        setUpdating(null);
        if (error) {
            setFeedback({ id: profileId, type: "error", msg: error.message });
        } else {
            setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p));
            setFeedback({ id: profileId, type: "success", msg: `Rôle mis à jour : ${ROLE_LABELS[newRole].label}` });
            if (profileId === currentUser?.id) setCurrentRole(newRole);
        }
        setTimeout(() => setFeedback(null), 3000);
    };

    const isAdmin = currentRole === "admin";

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">Administration</h1>
                <p className="section-subtitle">Gestion des utilisateurs et contrôle des rôles d'accès</p>
            </div>

            {/* Access warning */}
            {!isAdmin && !loading && (
                <div style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "12px", padding: "20px 24px", marginBottom: "24px",
                    display: "flex", alignItems: "center", gap: "16px",
                }}>
                    <span style={{ fontSize: "32px" }}>🔒</span>
                    <div>
                        <div style={{ fontWeight: 700, color: "#f87171", marginBottom: "4px" }}>Accès restreint</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            Seuls les administrateurs peuvent gérer les rôles utilisateurs. Votre rôle actuel : <strong>{ROLE_LABELS[currentRole]?.label}</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Role reference */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
                {ROLES.map(role => {
                    const r = ROLE_LABELS[role];
                    return (
                        <div key={role} className="card" style={{ padding: "16px" }}>
                            <div style={{ marginBottom: "8px" }}>
                                <span className={`badge ${r.badge}`}>{r.label}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.desc}</div>
                        </div>
                    );
                })}
            </div>

            {/* Users table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>Utilisateurs Enregistrés</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {profiles.length} utilisateur{profiles.length !== 1 ? "s" : ""} au total
                    </div>
                </div>
                <div className="table-wrapper" style={{ border: "none" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Identifiant</th>
                                <th>Email</th>
                                <th>Rôle Actuel</th>
                                <th>Inscrit le</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Chargement…</td></tr>
                            ) : profiles.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Aucun utilisateur</td></tr>
                            ) : profiles.map(p => {
                                const isMe = p.id === currentUser?.id;
                                const roleInfo = ROLE_LABELS[p.role] ?? { label: p.role, badge: "badge-blue" };
                                return (
                                    <tr key={p.id} style={{ background: isMe ? "rgba(59,130,246,0.04)" : undefined }}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{
                                                    width: "28px", height: "28px", borderRadius: "50%",
                                                    background: isMe ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "linear-gradient(135deg, #334155, #475569)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "11px", fontWeight: 700, color: "white", flexShrink: 0,
                                                }}>
                                                    {isMe ? "★" : p.id.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                                                    {p.id.slice(0, 8)}…
                                                </span>
                                                {isMe && <span className="badge badge-blue" style={{ fontSize: "9px" }}>Vous</span>}
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)" }}>{p.email}</td>
                                        <td><span className={`badge ${roleInfo.badge}`}>{roleInfo.label}</span></td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                            {new Date(p.created_at).toLocaleDateString("fr-FR")}
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <select
                                                        value={p.role}
                                                        onChange={e => updateRole(p.id, e.target.value)}
                                                        disabled={updating === p.id}
                                                        style={{
                                                            background: "var(--bg-secondary)", border: "1px solid var(--border)",
                                                            color: "var(--text-primary)", borderRadius: "6px", padding: "5px 10px",
                                                            fontSize: "12px", cursor: "pointer", outline: "none",
                                                        }}>
                                                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r].label}</option>)}
                                                    </select>
                                                    {updating === p.id && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>⏳</span>}
                                                    {feedback?.id === p.id && (
                                                        <span style={{ fontSize: "11px", color: feedback.type === "success" ? "#34d399" : "#f87171" }}>
                                                            {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permissions matrix */}
            <div className="card" style={{ marginTop: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Matrice des Permissions</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Accès par fonctionnalité et rôle</div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Fonctionnalité</th>
                                {ROLES.map(r => <th key={r}>{ROLE_LABELS[r].label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["Voir le Dashboard", true, true, true, true],
                                ["Voir les Clients", true, true, true, true],
                                ["Ajouter un Client", false, true, true, true],
                                ["Supprimer un Client", false, false, true, true],
                                ["Voir les Risques", false, true, true, true],
                                ["Modifier la Conformité", false, false, true, true],
                                ["Générer des Rapports", false, true, true, true],
                                ["Gérer les Utilisateurs", false, false, false, true],
                            ].map(([feature, ...perms], i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{feature}</td>
                                    {perms.map((perm, j) => (
                                        <td key={j} style={{ textAlign: "center" }}>
                                            {perm
                                                ? <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
                                                : <span style={{ color: "#475569", fontSize: "16px" }}>✗</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
