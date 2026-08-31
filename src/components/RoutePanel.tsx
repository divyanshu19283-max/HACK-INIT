import { Route as RouteIcon, Clock, Ruler, Video, Signal, ShieldQuestion } from 'lucide-react';
import type { PossibleRoute, Priority, ScoredCamera } from '@/types';

interface Props {
  routes: PossibleRoute[];
  cameras: ScoredCamera[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onSelect: (id: string) => void;
}

const PRIORITY_STYLE: Record<Priority, string> = {
  high: 'bg-pri-high/15 text-pri-high ring-pri-high/40',
  medium: 'bg-pri-med/15 text-pri-med ring-pri-med/40',
  low: 'bg-pri-low/15 text-pri-low ring-pri-low/40',
};

export default function RoutePanel({
  routes,
  cameras,
  selectedRouteId,
  onSelectRoute,
  onSelect,
}: Props) {
  if (!routes.length) {
    return (
      <div className="px-4 py-3 text-center text-xs text-slate-500">
        Run an analysis to generate simulated possible routes.
      </div>
    );
  }

  const byId = new Map(cameras.map((c) => [c.id, c]));
  const selected = routes.find((r) => r.id === selectedRouteId) ?? null;
  const selectedCams = selected
    ? selected.cameraIds
        .map((id) => byId.get(id))
        .filter((c): c is ScoredCamera => Boolean(c))
        .sort((a, b) => b.score - a.score)
    : [];

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <RouteIcon size={15} className="text-ai-400" />
        <h3 className="text-sm font-semibold text-slate-200">Possible Routes</h3>
        <span className="chip bg-white/5 text-slate-400">{routes.length}</span>
      </div>

      <p className="flex items-start gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2 text-[11px] leading-relaxed text-slate-400">
        <ShieldQuestion size={12} className="mt-0.5 shrink-0 text-amber-400/70" />
        Simulated potential routes away from the incident, ranked by CCTV route
        coverage. None of these is an identified or actual path taken by anyone.
      </p>

      <div className="space-y-2">
        {routes.map((r) => {
          const active = r.id === selectedRouteId;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`card card-hover w-full p-3 text-left transition ${
                active ? 'ring-1 ring-ai-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">{r.label}</span>
                <span className={`chip ring-1 ${PRIORITY_STYLE[r.priority]}`}>
                  {r.priority === 'high'
                    ? 'High'
                    : r.priority === 'medium'
                      ? 'Medium'
                      : 'Low'}{' '}
                  priority · {r.priorityScore}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Video size={11} className="text-slate-500" /> {r.cameraIds.length} cameras
                </span>
                <span className="flex items-center gap-1.5">
                  <Signal size={11} className="text-pri-low" /> {r.activeCameraIds.length} active
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler size={11} className="text-slate-500" /> {r.distance} m
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={11} className="text-slate-500" /> ~{r.estMinutes} min on foot
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                  <span>Route coverage</span>
                  <span className="text-slate-300">{r.coveragePct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-ai-500"
                    style={{ width: `${r.coveragePct}%` }}
                  />
                </div>
              </div>

              <p className="mt-2 truncate text-[10px] text-slate-500">
                Follows: {r.roads.join(' → ')}
              </p>
            </button>
          );
        })}
      </div>

      {selected && selectedCams.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">
            Cameras on {selected.label}
          </p>
          <div className="space-y-1">
            {selectedCams.slice(0, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/5"
              >
                <span className="truncate">
                  <span className="font-mono text-[10px] text-slate-500">{c.id}</span>{' '}
                  {c.name}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-slate-400">
                  {c.score}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
