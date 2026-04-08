"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, { label: string; badge: string; desc: string }> = {
    admin: { label: "Administrateur", badge: "#8b5cf6", desc: "Accès complet à toutes les fonctionnalités" },
    analyst: { label: "Analyste", badge: "#3b82f6", desc: "Accès à l'analyse des risques et rapports" },
    compliance: { label: "Conformité", badge: "#10b981", desc: "Accès au suivi de conformité réglementaire" },
    user: { label: "Utilisateur", badge: "#f59e0b", desc: "Accès lecture aux clients et alertes" },
};

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: session } = await supabase.auth.getSession();
            if (!session.session?.user) { router.replace("/"); return; }
            const user = session.session.user;
            const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();

            // If profile doesn't exist yet, create it
            if (!prof) {
                const { data: created } = await supabase.from("profiles").upsert({
                    id: user.id,
                    email: user.email,
                    role: "user",
                }).select().single();
                setProfile({ ...created, email: user.email });
            } else {
                setProfile({ ...prof, email: prof.email ?? user.email });
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleChangePassword = async () => {
        setPwError(""); setPwSuccess("");
        if (!newPassword || !confirmPassword) { setPwError("Veuillez remplir les deux champs."); return; }
        if (newPassword !== confirmPassword) { setPwError("Les mots de passe ne correspondent pas."); return; }
        if (newPassword.length < 6) { setPwError("Le mot de passe doit contenir au moins 6 caractères."); return; }
        setSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setSaving(false);
        if (error) setPwError(error.message);
        else {
            setPwSuccess("Mot de passe mis à jour avec succès !");
            setNewPassword(""); setConfirmPassword("");
            setEditMode(false);
            setTimeout(() => setPwSuccess(""), 3000);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ color: "var(--text-muted)" }}>Chargement du profil…</div>
            </div>
        );
    }

    const roleInfo = ROLE_LABELS[profile?.role] ?? ROLE_LABELS["user"];
    const initial = profile?.email?.charAt(0).toUpperCase() ?? "?";
    const createdDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—";

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="section-title">Mon Profil</h1>
                <p className="section-subtitle">Informations de votre compte Finovance</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "900px" }}>

                {/* Profile Card */}
                <div className="card" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "28px", padding: "28px 32px", background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.04))", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "32px", fontWeight: 800, color: "white", flexShrink: 0,
                        boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
                    }}>
                        {initial}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                            {profile?.email}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <span style={{
                                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                                background: `${roleInfo.badge}20`, color: roleInfo.badge, border: `1px solid ${roleInfo.badge}40`
                            }}>
                                {roleInfo.label}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{roleInfo.desc}</span>
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                            Membre depuis le {createdDate}
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "20px", color: "var(--text-primary)" }}>
                        📋 Informations du compte
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {[
                            { label: "Email", value: profile?.email },
                            { label: "Rôle", value: roleInfo.label },
                            { label: "Identifiant", value: `${profile?.id?.slice(0, 12)}…` },
                            { label: "Inscrit le", value: createdDate },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontFamily: label === "Identifiant" ? "monospace" : "inherit" }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Password change */}
                <div className="card">
                    <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "20px", color: "var(--text-primary)" }}>
                        🔑 Sécurité du compte
                    </div>

                    {!editMode ? (
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                Votre mot de passe est chiffré et sécurisé. Vous pouvez le modifier à tout moment.
                            </div>
                            <button onClick={() => setEditMode(true)} style={{
                                width: "100%", padding: "11px", border: "1px solid var(--border)",
                                borderRadius: "8px", background: "var(--bg-secondary)", color: "var(--text-secondary)",
                                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                            }}>
                                🔒 Modifier le mot de passe
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                                { label: "Nouveau mot de passe", val: newPassword, set: setNewPassword },
                                { label: "Confirmer le mot de passe", val: confirmPassword, set: setConfirmPassword },
                            ].map(f => (
                                <div key={f.label}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "5px" }}>
                                        {f.label}
                                    </label>
                                    <input className="input" type="password" placeholder="••••••••"
                                        value={f.val} onChange={e => f.set(e.target.value)} />
                                </div>
                            ))}
                            {pwError && <div style={{ color: "#f87171", fontSize: "12px" }}>⚠️ {pwError}</div>}
                            {pwSuccess && <div style={{ color: "#34d399", fontSize: "12px" }}>✅ {pwSuccess}</div>}
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <button onClick={() => { setEditMode(false); setPwError(""); setNewPassword(""); setConfirmPassword(""); }}
                                    style={{ flex: 1, padding: "9px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                                    Annuler
                                </button>
                                <button onClick={handleChangePassword} disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: "center", padding: "9px" }}>
                                    {saving ? "Enregistrement…" : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                        <button onClick={handleSignOut} style={{
                            width: "100%", padding: "11px",
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: "8px", color: "#f87171", fontWeight: 600, fontSize: "13px", cursor: "pointer",
                        }}>
                            🚪 Se déconnecter
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
