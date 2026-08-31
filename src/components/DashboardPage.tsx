import {
  Video,
  Activity,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  CircleDot,
} from 'lucide-react';
import type { Page, InvestigationRecord } from '@/types';
import { CAMERAS, CAMERA_TYPE_LABELS } from '@/data/cameras';

interface Props {
  investigations: InvestigationRecord[];
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ investigations, onNavigate }: Props) {
  const totalCameras = CAMERAS.length;
  const activeCameras = CAMERAS.filter((c) => c.active).length;
  const openInvestigations = investigations.filter((i) => i.status !== 'closed').length;
  const highPriority = investigations.reduce((sum, i) => sum + i.highPriorityCount, 0);

  const stats = [
    { label: 'Total Demo Cameras', value: totalCameras, icon: Video, color: 'text-action-400', bg: 'bg-action-500/10', ring: 'ring-action-500/20' },
    { label: 'Active Cameras', value: activeCameras, icon: Activity, color: 'text-pri-low', bg: 'bg-pri-low/10', ring: 'ring-pri-low/20' },
    { label: 'Investigations', value: openInvestigations, icon: FolderOpen, color: 'text-ai-400', bg: 'bg-ai-500/10', ring: 'ring-ai-500/20' },
    { label: 'High Priority Cameras', value: highPriority, icon: AlertTriangle, color: 'text-pri-high', bg: 'bg-pri-high/10', ring: 'ring-pri-high/20' },
  ];

  const recent = [...investigations].slice(-4).reverse();
  const typeBreakdown = Object.entries(
    CAMERAS.reduce<Record<string, number>>((acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1;
      return acc;
    }, {}),
  );

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* heading */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of the simulated CCTV network and active investigations.
          </p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.ring} ring-1`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <TrendingUp size={14} className="text-slate-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* recent investigations */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-200">Recent Investigations</h2>
              <button
                onClick={() => onNavigate('new-investigation')}
                className="btn-ghost px-2 py-1 text-xs text-action-400"
              >
                New <ArrowRight size={12} />
              </button>
            </div>
            <div className="p-4">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <FolderOpen size={26} className="text-slate-700" />
                  <p className="text-xs text-slate-500">No investigations yet.</p>
                  <button
                    onClick={() => onNavigate('new-investigation')}
                    className="btn-primary mt-1"
                  >
                    Start New Investigation
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => onNavigate('investigations')}
                      className="card card-hover flex w-full items-center gap-3 p-3 text-left"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          inv.status === 'open'
                            ? 'bg-pri-high/15 text-pri-high'
                            : inv.status === 'in-progress'
                              ? 'bg-pri-med/15 text-pri-med'
                              : 'bg-pri-low/15 text-pri-low'
                        }`}
                      >
                        <CircleDot size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {inv.title}
                        </p>
                        <p className="flex items-center gap-2 text-[11px] text-slate-500">
                          <MapPin size={10} /> {inv.locationLabel}
                          <Clock size={10} /> {inv.date} {inv.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-200">
                          {inv.cameraCount}
                        </p>
                        <p className="text-[10px] text-slate-500">cameras</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* camera type breakdown */}
          <div className="card">
            <div className="border-b border-white/5 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-200">Camera Types</h2>
            </div>
            <div className="space-y-3 p-4">
              {typeBreakdown.map(([type, count]) => {
                const pct = Math.round((count / totalCameras) * 100);
                return (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{CAMERA_TYPE_LABELS[type]}</span>
                      <span className="font-mono text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-action-500 to-ai-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* quick action */}
        <div className="mt-6 card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ai-500/15 ring-1 ring-ai-500/25">
              <MapPin size={18} className="text-ai-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Start a new area analysis</p>
              <p className="text-xs text-slate-500">
                Define an incident and let the AI identify nearby cameras.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate('new-investigation')} className="btn-primary">
            New Investigation <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
