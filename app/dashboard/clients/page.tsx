"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [debt, setDebt] = useState("");
  const [liquidity, setLiquidity] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("profiles").select("role").eq("id", data.session.user.id).single();
        if (profile?.role) setUserRole(profile.role);
      }
    });
    fetchClients();
  }, []);

  useEffect(() => {
    let list = clients;
    if (filter !== "Tous") list = list.filter(c => c.riskLevel === filter);
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [clients, search, filter]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  };

  const calculateRisk = (cap: number, dbt: number, liq: number) => {
    let score = 0;
    if (cap > 100000) score += 30;
    if (dbt < 50000) score += 30;
    if (liq > 20000) score += 40;
    const level = score < 50 ? "Élevé" : score < 80 ? "Moyen" : "Faible";
    return { score, level };
  };

  const addClient = async () => {
    setFormError(""); setFormSuccess("");
    if (!name || !capital || !debt || !liquidity) { setFormError("Tous les champs sont requis."); return; }
    setSubmitting(true);
    const cap = Number(capital), dbt = Number(debt), liq = Number(liquidity);
    const { score, level } = calculateRisk(cap, dbt, liq);
    const { data, error } = await supabase.from("clients").insert([{
      name, capital: cap, debt: dbt, liquidity: liq, riskScore: score, riskLevel: level
    }]).select();
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    setFormSuccess(`Client "${data[0].name}" ajouté · Score : ${score}% (${level})`);
    setClients(prev => [data[0], ...prev]);
    setName(""); setCapital(""); setDebt(""); setLiquidity("");
    setTimeout(() => { setShowModal(false); setFormSuccess(""); }, 2000);
  };

  const deleteClient = async (id: string, clientName: string) => {
    if (!confirm(`Supprimer ${clientName} ?`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) setClients(prev => prev.filter(c => c.id !== id));
  };

  // Excel Import
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("Lecture du fichier…");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) { setImportStatus("❌ Fichier vide ou colonnes incorrectes."); return; }

        const toInsert = rows.map(row => {
          const cap = Number(row["Capital"] ?? row["capital"] ?? 0);
          const dbt = Number(row["Dette"] ?? row["dette"] ?? 0);
          const liq = Number(row["Liquidite"] ?? row["Liquidité"] ?? row["liquidite"] ?? 0);
          const nm = String(row["Nom"] ?? row["nom"] ?? "Inconnu");
          const { score, level } = calculateRisk(cap, dbt, liq);
          return { name: nm, capital: cap, debt: dbt, liquidity: liq, riskScore: score, riskLevel: level };
        });

        const { data: inserted, error } = await supabase.from("clients").insert(toInsert).select();
        if (error) { setImportStatus(`❌ Erreur : ${error.message}`); return; }
        setImportStatus(`✅ ${inserted.length} client(s) importé(s) avec succès !`);
        setClients(prev => [...(inserted ?? []), ...prev]);
        setTimeout(() => setImportStatus(""), 4000);
      } catch {
        setImportStatus("❌ Erreur lors de la lecture du fichier Excel.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Nom", "Capital (TND)", "Dette (TND)", "Liquidité (TND)", "Score de Risque (%)", "Niveau de Risque"];
    const rows = clients.map(c => [c.name, c.capital, c.debt, c.liquidity, c.riskScore, c.riskLevel]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `finovance_clients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const levels = ["Tous", "Faible", "Moyen", "Élevé"];

  return (
    <div>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="section-title">Clients</h1>
          <p className="section-subtitle">Gestion et analyse des profils clients</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* CSV Export — visible for all */}
          <button onClick={exportCSV} style={{
            padding: "10px 18px", borderRadius: "10px", border: "1px solid var(--border)",
            background: "var(--bg-card)", color: "var(--text-secondary)",
            fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
          }}>
            💾 Exporter CSV
          </button>
          {/* Excel Import — admin only */}
          {userRole === "admin" && (
            <>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelImport} />
              <button onClick={() => fileInputRef.current?.click()} style={{
                padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.4)",
                background: "rgba(16,185,129,0.1)", color: "#34d399",
                fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}>
                📥 Importer Excel
              </button>
            </>
          )}
          <button onClick={() => { setShowModal(true); setFormError(""); setFormSuccess(""); }} className="btn btn-primary">
            + Nouveau Client
          </button>
        </div>
      </div>

      {/* Import status */}
      {importStatus && (
        <div style={{
          marginBottom: "16px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
          background: importStatus.startsWith("✅") ? "rgba(16,185,129,0.1)" : importStatus.startsWith("❌") ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
          border: importStatus.startsWith("✅") ? "1px solid rgba(16,185,129,0.3)" : importStatus.startsWith("❌") ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(59,130,246,0.3)",
          color: importStatus.startsWith("✅") ? "#34d399" : importStatus.startsWith("❌") ? "#f87171" : "#60a5fa"
        }}>
          {importStatus}
        </div>
      )}

      {/* Excel format hint for admin */}
      {userRole === "admin" && (
        <div style={{
          marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", fontSize: "12px",
          background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "var(--text-muted)"
        }}>
          💡 <strong>Format d'import Excel :</strong> Colonnes requises → <code>Nom</code> | <code>Capital</code> | <code>Dette</code> | <code>Liquidite</code>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input className="input" style={{ maxWidth: "280px" }} placeholder="🔍 Rechercher un client…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: "8px" }}>
          {levels.map(lvl => (
            <button key={lvl} onClick={() => setFilter(lvl)}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)",
                cursor: "pointer", fontWeight: 600, fontSize: "12px", transition: "all 0.2s",
                background: filter === lvl ? "var(--accent-blue)" : "var(--bg-card)",
                color: filter === lvl ? "white" : "var(--text-secondary)",
              }}>
              {lvl}
            </button>
          ))}
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "auto" }}>
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Capital</th>
              <th>Dette</th>
              <th>Liquidité</th>
              <th>Score de Risque</th>
              <th>Niveau</th>
              {userRole === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Aucun client trouvé</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                <td>{Number(c.capital).toLocaleString("fr-FR")} TND</td>
                <td>{Number(c.debt).toLocaleString("fr-FR")} TND</td>
                <td>{Number(c.liquidity).toLocaleString("fr-FR")} TND</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "80px", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        width: `${c.riskScore}%`, height: "100%", borderRadius: "3px",
                        background: c.riskScore < 50 ? "#ef4444" : c.riskScore < 80 ? "#f59e0b" : "#10b981",
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "13px" }}>{c.riskScore}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${c.riskLevel === "Élevé" ? "badge-red" : c.riskLevel === "Moyen" ? "badge-yellow" : "badge-green"}`}>
                    {c.riskLevel}
                  </span>
                </td>
                {userRole === "admin" && (
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={`/dashboard/ratios?clientId=${c.id}`} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", textDecoration: "none" }}>
                        ⚖️ Bilan
                      </a>
                      <button onClick={() => deleteClient(c.id, c.name)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        🗑️ Suppr.
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)",
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "480px", border: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Nouveau Client</h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Le score de risque est calculé automatiquement</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px"
              }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Nom du client", val: name, set: setName, type: "text", placeholder: "Ex: Entreprise ABC" },
                { label: "Capital (TND)", val: capital, set: setCapital, type: "number", placeholder: "Ex: 150000" },
                { label: "Dette (TND)", val: debt, set: setDebt, type: "number", placeholder: "Ex: 30000" },
                { label: "Liquidité (TND)", val: liquidity, set: setLiquidity, type: "number", placeholder: "Ex: 25000" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                    {f.label}
                  </label>
                  <input className="input" type={f.type} placeholder={f.placeholder}
                    value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
            </div>

            {formError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginTop: "16px" }}>
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginTop: "16px" }}>
                ✅ {formSuccess}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "11px", background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "8px", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer"
              }}>
                Annuler
              </button>
              <button onClick={addClient} disabled={submitting} className="btn btn-primary" style={{ flex: 2, justifyContent: "center", padding: "11px" }}>
                {submitting ? "Ajout en cours…" : "Ajouter le Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}