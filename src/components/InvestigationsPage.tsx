import { useState } from 'react';
import {
  FolderOpen,
  MapPin,
  Clock,
  CircleDot,
  Search,
  FileSearch,
} from 'lucide-react';
import type { InvestigationRecord, Page } from '@/types';

interface Props {
  investigations: InvestigationRecord[];
  onNavigate: (page: Page) => void;
}

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: 'bg-pri-high/15', text: 'text-pri-high' },
  'in-progress': { label: 'In Progress', bg: 'bg-pri-med/15', text: 'text-pri-med' },
  closed: { label: 'Closed', bg: 'bg-pri-low/15', text: 'text-pri-low' },
};

export default function InvestigationsPage({ investigations, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = investigations.filter((i) => {
    const matchesQuery =
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.locationLabel.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Investigations</h1>
            <p className="mt-1 text-sm text-slate-500">
              All simulated investigation records created in this session.
            </p>
          </div>
          <button onClick={() => onNavigate('new-investigation')} className="btn-primary">
            <FileSearch size={15} /> New
          </button>
        </div>

        {/* filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search investigations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'open', 'in-progress', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`chip ${statusFilter === s ? 'bg-white/10 text-slate-200 ring-1 ring-white/15' : 'bg-white/5 text-slate-500'}`}
              >
                {s === 'all' ? 'All' : (STATUS_STYLE[s]?.label ?? s)}
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-16 text-center">
            <FolderOpen size={30} className="text-slate-700" />
            <p className="text-sm text-slate-500">
              {investigations.length === 0
                ? 'No investigations yet. Create one to get started.'
                : 'No investigations match your filters.'}
            </p>
            {investigations.length === 0 && (
              <button onClick={() => onNavigate('new-investigation')} className="btn-primary">
                Start New Investigation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inv) => {
              const st = STATUS_STYLE[inv.status]!;
              return (
                <div key={inv.id} className="card card-hover p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`chip ${st.bg} ${st.text}`}>
                          <CircleDot size={10} /> {st.label}
                        </span>
                        <h3 className="truncate text-sm font-medium text-slate-100">
                          {inv.title}
                        </h3>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {inv.locationLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {inv.date} {inv.time}
                        </span>
                        <span className="font-mono">{inv.id}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-4 text-right">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{inv.cameraCount}</p>
                        <p className="text-[10px] text-slate-500">cameras</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-pri-high">
                          {inv.highPriorityCount}
                        </p>
                        <p className="text-[10px] text-slate-500">high priority</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
