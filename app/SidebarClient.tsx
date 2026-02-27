"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/clients", label: "Clients", icon: "👥" },
  { href: "/dashboard/risks", label: "Risques", icon: "⚠️" },
  { href: "/dashboard/compliance", label: "Conformité", icon: "✅" },
  { href: "/dashboard/reports", label: "Rapports", icon: "📄" },
  { href: "/dashboard/admin", label: "Administration", icon: "🛡️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUserEmail(data.session.user.email ?? null);
        const { data: profile } = await supabase
          .from("profiles").select("role").eq("id", data.session.user.id).single();
        if (profile?.role) setUserRole(profile.role);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: collapsed ? "72px" : "var(--sidebar-width)",
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      transition: "width 0.3s ease",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? "20px 16px" : "24px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        gap: "12px",
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
            }}>💎</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Finovance</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>RISK PLATFORM</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
          }}>💎</div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "6px", padding: "4px 8px", cursor: "pointer",
          color: "var(--text-muted)", fontSize: "12px", flexShrink: 0,
          transition: "all 0.2s"
        }}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {!collapsed && (
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", padding: "0 8px", marginBottom: "8px" }}>
            NAVIGATION
          </div>
        )}
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <a key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: collapsed ? "12px" : "10px 12px",
              borderRadius: "10px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: active
                ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.1))"
                : "transparent",
              border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              color: active ? "var(--accent-blue)" : "var(--text-secondary)",
              fontWeight: active ? 600 : 400,
              fontSize: "13px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }
              }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        {!collapsed && userEmail && (
          <div style={{
            background: "var(--bg-card)", borderRadius: "10px",
            padding: "12px", marginBottom: "12px",
            border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: 700, color: "white", flexShrink: 0,
              }}>
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userEmail}
                </div>
                <span className={`badge ${userRole === "admin" ? "badge-purple" : "badge-blue"}`} style={{ fontSize: "10px" }}>
                  {userRole === "admin" ? "Administrateur" : "Utilisateur"}
                </span>
              </div>
            </div>
          </div>
        )}
        <button onClick={handleSignOut} style={{
          width: "100%", padding: collapsed ? "10px" : "10px 14px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "10px", color: "#f87171",
          fontWeight: 600, fontSize: "13px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", transition: "all 0.2s ease",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"}>
          🚪 {!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}