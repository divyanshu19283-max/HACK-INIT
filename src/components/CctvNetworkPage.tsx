import { useMemo, useState } from 'react';
import { Video, Layers, Search, Activity } from 'lucide-react';
import { CAMERAS, CAMERA_TYPE_LABELS } from '@/data/cameras';
import MapView from '@/components/MapView';

export default function CctvNetworkPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCoverage, setShowCoverage] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      CAMERAS.filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase()) ||
          c.operator.toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === 'all' || c.type === typeFilter;
        return matchesQuery && matchesType;
      }),
    [query, typeFilter],
  );

  const types = Object.keys(CAMERA_TYPE_LABELS);
  const selected = CAMERAS.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/5 px-6 py-3">
        <h1 className="text-base font-semibold text-slate-100">CCTV Network</h1>
        <p className="text-xs text-slate-500">
          Browse all simulated cameras in the demo network.
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* camera table */}
        <div className="flex w-[380px] shrink-0 flex-col border-r border-white/5 bg-ink-900/50">
          <div className="space-y-3 border-b border-white/5 p-4">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-9"
                placeholder="Search cameras…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTypeFilter('all')}
                className={`chip ${typeFilter === 'all' ? 'bg-white/10 text-slate-200 ring-1 ring-white/15' : 'bg-white/5 text-slate-500'}`}
              >
                All
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`chip ${typeFilter === t ? 'bg-white/10 text-slate-200 ring-1 ring-white/15' : 'bg-white/5 text-slate-500'}`}
                >
                  {CAMERA_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="scroll-thin flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {filtered.map((c) => {
                const isSel = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`card card-hover w-full p-3 text-left ring-1 ${isSel ? 'ring-action-500/60 bg-ink-800' : 'ring-transparent'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{c.name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {c.id} · {CAMERA_TYPE_LABELS[c.type]} · {c.roadName}
                        </p>
                      </div>
                      <span className={`chip ${c.active ? 'bg-pri-low/15 text-pri-low' : 'bg-pri-high/15 text-pri-high'}`}>
                        <Activity size={10} /> {c.active ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-xs text-slate-500">No cameras found.</p>
              )}
            </div>
          </div>
        </div>

        {/* map */}
        <main className="relative min-w-0 flex-1">
          <MapView
            cameras={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showCoverage={showCoverage}
          />
          <div className="pointer-events-none absolute left-4 top-4 z-[1000]">
            <div className="card pointer-events-auto flex items-center gap-1 p-1">
              <button
                onClick={() => setShowCoverage((v) => !v)}
                className={`btn px-2.5 py-1.5 text-xs ${showCoverage ? 'bg-action-600/20 text-action-300 ring-1 ring-action-500/40' : 'text-slate-400'}`}
              >
                <Layers size={14} /> Coverage
              </button>
            </div>
          </div>
        </main>

        {/* detail */}
        {selected && (
          <aside className="scroll-thin w-[300px] shrink-0 overflow-y-auto border-l border-white/5 bg-ink-900/60 p-4">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-action-400" />
              <h2 className="text-sm font-semibold text-slate-100">{selected.name}</h2>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">{selected.id}</p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <Meta label="Type" value={CAMERA_TYPE_LABELS[selected.type] ?? selected.type} />
              <Meta label="Status" value={selected.active ? 'Active' : 'Offline'} />
              <Meta label="Road" value={selected.roadName} />
              <Meta label="Active hours" value={selected.activeHours} />
              <Meta label="Base priority" value={`${selected.basePriority}/100`} />
              <Meta label="Operator" value={selected.operator} />
              <Meta label="Resolution" value={selected.resolution} />
              <Meta label="Coverage" value={`${selected.coverageRadius} m`} />
              <Meta label="Field of view" value={`${selected.fov}°`} />
              <Meta label="Heading" value={`${selected.heading}°`} />
              <Meta label="Retention" value={`${selected.retentionDays} days`} />
              <Meta label="Installed" value={selected.installed} />
              <Meta label="Coordinates" value={`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`} />
            </div>
            <div className="mt-4 card overflow-hidden">
              <div className="relative aspect-video bg-ink-900">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-700/40 to-ink-900" />
                <div className="scan-line absolute inset-x-0 h-12 bg-gradient-to-b from-action-500/10 to-transparent" />
                <div className="absolute left-2 top-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pri-high" />
                  <span className="font-mono text-[10px] text-slate-300">REC · SIMULATED</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[11px] text-slate-600">Demo footage preview</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="truncate text-sm text-slate-200">{value}</p>
    </div>
  );
}
