import { useState } from "react";
import type { Incident, InvestigationRecord, Page } from "@/types";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/DashboardPage";
import NewInvestigationPage from "@/components/NewInvestigationPage";
import CctvNetworkPage from "@/components/CctvNetworkPage";
import InvestigationsPage from "@/components/InvestigationsPage";
import ReportsPage from "@/components/ReportsPage";
import SettingsPage from "@/components/SettingsPage";

interface Props {
  /** Return to the landing page. */
  onExit: () => void;
}

export default function AppShell({ onExit }: Props) {
  const [page, setPage] = useState<Page>("dashboard");
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);

  function handleComplete(_incident: Incident, record: InvestigationRecord) {
    setInvestigations((prev) => [...prev, record]);
    setPage("investigations");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink-950">
      <Sidebar current={page} onNavigate={setPage} onExit={onExit} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {page === "dashboard" && (
          <DashboardPage investigations={investigations} onNavigate={setPage} />
        )}
        {page === "new-investigation" && <NewInvestigationPage onComplete={handleComplete} />}
        {page === "cctv-network" && <CctvNetworkPage />}
        {page === "investigations" && (
          <InvestigationsPage investigations={investigations} onNavigate={setPage} />
        )}
        {page === "reports" && (
          <ReportsPage investigations={investigations} onNavigate={setPage} />
        )}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
