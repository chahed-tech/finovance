import './globals.css';
import Sidebar from './SidebarClient';

export const metadata = {
  title: 'Finovance — Gestion des Risques Financiers',
  description: 'Plateforme intelligente de gestion des risques financiers et conformité réglementaire',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main style={{
            flex: 1,
            padding: '32px',
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            overflowY: 'auto',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}