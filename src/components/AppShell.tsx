import { useEffect, useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import type { Incident, InvestigationRecord, Page } from "@/types";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/DashboardPage";
import NewInvestigationPage from "@/components/NewInvestigationPage";
import CctvNetworkPage from "@/components/CctvNetworkPage";
import InvestigationsPage from "@/components/InvestigationsPage";
import ReportsPage from "@/components/ReportsPage";
import SettingsPage from "@/components/SettingsPage";
import { getInvestigations } from "@/lib/backend";

interface Props { onExit: () => void; }

export default function AppShell({ onExit }: Props) {
  const [page, setPage] = useState<Page>("dashboard");
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getInvestigations()
      .then(({ investigations: records }) => { if (active) setInvestigations(records); })
      .catch((error) => console.error("Failed to load investigations:", error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  function handleComplete(_incident: Incident, record: InvestigationRecord) {
    setInvestigations((prev) => [record, ...prev.filter((item) => item.id !== record.id)]);
    setPage("investigations");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink-950">
      {mobileMenuOpen && <button aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[1900] bg-black/60 backdrop-blur-[2px] lg:hidden" />}
      <Sidebar current={page} onNavigate={setPage} onExit={onExit} mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <main className="min-w-0 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-[1500] flex min-h-14 shrink-0 items-center justify-between border-b border-white/5 bg-ink-950/90 px-4 backdrop-blur-xl lg:hidden">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2.5 text-slate-300 hover:bg-white/5 hover:text-white"><Menu size={21} /></button>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-action-500 to-ai-600 shadow-glow"><ShieldCheck size={15} /></span>
            EvidenceRoute <span className="text-ai-400">AI</span>
          </div>
          <div className="w-10" />
        </header>
        <div className="min-h-0 flex-1">
          {page === "dashboard" && <DashboardPage investigations={investigations} onNavigate={setPage} />}
          {page === "new-investigation" && <NewInvestigationPage onComplete={handleComplete} />}
          {page === "cctv-network" && <CctvNetworkPage />}
          {page === "investigations" && <InvestigationsPage investigations={investigations} onNavigate={setPage} />}
          {page === "reports" && <ReportsPage investigations={investigations} onNavigate={setPage} />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>

      <style>{`
        @media (max-width: 1023px) {
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 {
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > aside[class*="w-[340px]"] {
            width: 100% !important;
            max-height: none !important;
            flex: none !important;
            border-right: 0 !important;
            border-bottom: 1px solid rgba(255,255,255,.05) !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > .flex.min-w-0.flex-1 {
            width: 100% !important;
            min-height: 0 !important;
            flex: none !important;
            flex-direction: column !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > .flex.min-w-0.flex-1 > main {
            width: 100% !important;
            height: 52vh !important;
            min-height: 320px !important;
            flex: none !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > .flex.min-w-0.flex-1 > div[class*="w-[300px]"] {
            display: flex !important;
            width: 100% !important;
            height: 280px !important;
            flex: none !important;
            border-left: 0 !important;
            border-top: 1px solid rgba(255,255,255,.05) !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > aside:last-child {
            width: 100% !important;
            max-height: 560px !important;
            flex: none !important;
            border-left: 0 !important;
            border-top: 1px solid rgba(255,255,255,.05) !important;
          }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col input,
          main > .min-h-0.flex-1 > .flex.h-full.flex-col select,
          main > .min-h-0.flex-1 > .flex.h-full.flex-col textarea {
            font-size: 16px;
          }
        }
        @media (max-width: 640px) {
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .border-b { padding-left: 1rem; padding-right: 1rem; }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > aside[class*="w-[340px]"] form { padding: 1rem; }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > .flex.min-w-0.flex-1 > main { height: 48vh !important; min-height: 300px !important; }
          main > .min-h-0.flex-1 > .flex.h-full.flex-col > .flex.min-h-0.flex-1 > .flex.min-w-0.flex-1 > div[class*="w-[300px]"] { height: 250px !important; }
        }
      `}</style>
    </div>
  );
}
