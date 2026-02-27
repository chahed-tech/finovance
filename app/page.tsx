"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, []);

  const handleAuth = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Email et mot de passe requis."); return; }
    setLoading(true);
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAuth();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
        borderRadius: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="glass animate-fade-in" style={{
        width: "100%", maxWidth: "440px",
        borderRadius: "20px",
        padding: "48px 40px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "60px", height: "60px", borderRadius: "16px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            fontSize: "28px", marginBottom: "16px",
            boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
          }} className="animate-float">
            💎
          </div>
          <h1 style={{
            fontSize: "26px", fontWeight: "800",
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "4px",
          }}>Finovance</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Plateforme de gestion des risques financiers
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "var(--bg-secondary)",
          borderRadius: "10px", padding: "4px", marginBottom: "28px",
          border: "1px solid var(--border)"
        }}>
          {["Connexion", "Inscription"].map((tab, i) => (
            <button key={tab} onClick={() => { setIsRegister(i === 1); setError(""); setSuccess(""); }}
              style={{
                flex: 1, padding: "9px", border: "none", cursor: "pointer",
                borderRadius: "8px", fontWeight: 600, fontSize: "13px",
                transition: "all 0.2s ease",
                background: isRegister === (i === 1)
                  ? "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark))"
                  : "transparent",
                color: isRegister === (i === 1) ? "white" : "var(--text-muted)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Adresse email
            </label>
            <input
              className="input"
              type="email" placeholder="vous@exemple.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Mot de passe
            </label>
            <input
              className="input"
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", padding: "10px 14px", borderRadius: "8px",
            fontSize: "13px", marginBottom: "16px",
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            color: "#34d399", padding: "10px 14px", borderRadius: "8px",
            fontSize: "13px", marginBottom: "16px",
          }}>✅ {success}</div>
        )}

        {/* Submit */}
        <button onClick={handleAuth} disabled={loading}
          style={{
            width: "100%", padding: "13px",
            background: loading ? "var(--bg-card)" : "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark))",
            color: loading ? "var(--text-muted)" : "white",
            border: "none", borderRadius: "10px",
            fontWeight: 700, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: loading ? "none" : "0 4px 16px rgba(59,130,246,0.35)",
          }}>
          {loading ? "Chargement..." : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", marginTop: "24px" }}>
          Plateforme sécurisée · Données chiffrées · Conformité RGPD
        </p>
      </div>
    </div>
  );
}