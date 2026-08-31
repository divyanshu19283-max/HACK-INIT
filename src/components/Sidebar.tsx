import {
  LayoutDashboard,
  FileSearch,
  Video,
  FolderOpen,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import type { Page } from '@/types';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
  onExit: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-investigation', label: 'New Investigation', icon: FileSearch },
  { id: 'cctv-network', label: 'CCTV Network', icon: Video },
  { id: 'investigations', label: 'Investigations', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ current, onNavigate, onExit, mobileOpen = false, onCloseMobile }: Props) {
  function navigate(page: Page) {
    onNavigate(page);
    onCloseMobile?.();
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-[2000] flex h-full w-[280px] shrink-0 flex-col border-r border-white/5 bg-ink-900/98 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:static lg:z-auto lg:w-[240px] lg:translate-x-0 lg:bg-ink-900/70 lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-action-500 to-ai-600 shadow-glow">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-slate-100">EvidenceRoute <span className="text-ai-400">AI</span></p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Investigation Support</p>
        </div>
        <button type="button" aria-label="Close menu" onClick={onCloseMobile} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"><X size={18} /></button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">Menu</p>
        {NAV.map((item) => {
          const active = current === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${active ? 'bg-action-600/15 text-action-300 ring-1 ring-action-500/25' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              <item.icon size={17} className="shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-600/20 text-xs font-semibold text-ai-300 ring-1 ring-ai-500/30">DM</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-200">Demo Investigator</p><p className="truncate text-[10px] text-slate-500">Authenticated investigator</p></div>
        </div>
        <button onClick={onExit} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"><LogOut size={15} /> Exit to landing</button>
      </div>
    </aside>
  );
}
