import { useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  Calendar,
  Clock,
  Tag,
  Crosshair,
  Layers,
  ScanLine,
  Cpu,
  PanelRightOpen,
  PanelRightClose,
  AlertTriangle,
  Video,
  Eye,
} from 'lucide-react';
import type { Incident, ScoredCamera, PossibleRoute, Priority, InvestigationRecord } from '@/types';
import { CAMERAS, DEMO_LOCATION, LOCATION_PRESETS } from '@/data/cameras';
import { scoreAll } from '@/lib/geo';
import { buildPossibleRoutes, buildRoutePaths } from '@/lib/route';
import MapView from '@/components/MapView';
import CameraList from '@/components/CameraList';
import CameraDetail from '@/components/CameraDetail';
import RoutePanel from '@/components/RoutePanel';

const INCIDENT_TYPES = [
  'Theft',
  'Assault',
  'Vandalism',
  'Suspicious Activity',
  'Vehicle Crime',
  'Missing Person',
];

interface Props {
  onComplete: (inc: Incident, record: InvestigationRecord) => void;
}

export default function NewInvestigationPage({ onComplete }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [locationQuery, setLocationQuery] = useState(DEMO_LOCATION.label);
  const [lat, setLat] = useState(String(DEMO_LOCATION.lat));
  const [lng, setLng] = useState(String(DEMO_LOCATION.lng));
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('14:30');
  const [type, setType] = useState('Theft');
  const [radius, setRadius] = useState(300);
  const [title, setTitle] = useState('Bag snatch near market entrance');
  const [description, setDescription] = useState(
    'Handbag grabbed near the M2K plaza entrance, suspect fled east on foot.',
  );

  const [incident, setIncident] = useState<Incident | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [routes, setRoutes] = useState<PossibleRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routePaths, setRoutePaths] = useState<{ lat: number; lng: number }[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Priority | 'all'>('all');
  const [showCoverage, setShowCoverage] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scored = useMemo<ScoredCamera[]>(() => {
    if (!incident) return [];
    return scoreAll(CAMERAS, incident, routePaths);
  }, [incident, routePaths]);

  const selected = useMemo(
    () => scored.find((c) => c.id === selectedId) ?? null,
    [scored, selectedId],
  );

  const matchingPresets = LOCATION_PRESETS.filter((p) =>
    p.label.toLowerCase().includes(locationQuery.toLowerCase()),
  );

  function selectPreset(label: string, pLat: number, pLng: number) {
    setLocationQuery(label);
    setLat(String(pLat));
    setLng(String(pLng));
    setShowSuggestions(false);
  }

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    const inc: Incident = {
      id: `INC-${Date.now().toString(36).toUpperCase()}`,
      title: title || 'Untitled incident',
      category: type,
      locationLabel: locationQuery || DEMO_LOCATION.label,
      lat: Number(lat),
      lng: Number(lng),
      radius,
      date,
      time,
      occurredAt: new Date(`${date}T${time}`).toISOString(),
      description,
    };
    setIncident(inc);
    setSelectedId(null);
    setRoutes([]);
    setSelectedRouteId(null);
    const paths = buildRoutePaths(inc);
    setRoutePaths(paths);
    setFilter('all');

    setTimeout(() => {
      const s = scoreAll(CAMERAS, inc, paths);
      const generated = buildPossibleRoutes(CAMERAS, inc, s);
      setRoutes(generated);
      setSelectedRouteId(generated[0]?.id ?? null);
      setAnalyzing(false);
      const record: InvestigationRecord = {
        id: inc.id,
        title: inc.title,
        category: inc.category,
        locationLabel: inc.locationLabel,
        lat: inc.lat,
        lng: inc.lng,
        radius: inc.radius,
        date: inc.date,
        time: inc.time,
        status: 'open',
        createdAt: inc.occurredAt,
        cameraCount: s.length,
        highPriorityCount: s.filter((c) => c.priority === 'high').length,
      };
      onComplete(inc, record);
    }, 900);
  }

  return (
    <div className="flex h-full flex-col">
      {/* page header */}
      <div className="border-b border-white/5 px-6 py-3">
        <h1 className="text-base font-semibold text-slate-100">New Investigation</h1>
        <p className="text-xs text-slate-500">
          Define the incident and analyze the surrounding CCTV coverage.
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* left: form */}
        <aside className="scroll-thin w-[340px] shrink-0 overflow-y-auto border-r border-white/5 bg-ink-900/50">
          <form onSubmit={handleAnalyze} className="space-y-4 px-4 py-4">
            {/* location search */}
            <div className="relative">
              <label className="label flex items-center gap-1.5">
                <MapPin size={12} /> Incident location
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  className="input pl-9"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search for a location"
                />
              </div>
              {showSuggestions && matchingPresets.length > 0 && (
                <div className="absolute z-[1100] mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-ink-800 shadow-card">
                  {matchingPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onMouseDown={() => selectPreset(p.label, p.lat, p.lng)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
                    >
                      <MapPin size={12} className="text-slate-500" /> {p.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1.5 text-[11px] text-slate-500">
                Demo location pre-filled: M2K Rohini Sector 7, Delhi.
              </p>
            </div>

            {/* date + time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Calendar size={12} /> Incident date
                </label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Clock size={12} /> Incident time
                </label>
                <input
                  type="time"
                  className="input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* type + radius */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Tag size={12} /> Incident type
                </label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-ink-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Search radius (m)</label>
                <input
                  type="number"
                  min={50}
                  max={1000}
                  step={10}
                  className="input"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            </div>

            {/* title */}
            <div>
              <label className="label">Incident title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary"
              />
            </div>

            {/* description */}
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* advanced coords */}
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                <Crosshair size={12} /> Advanced coordinates
                <span className="ml-auto text-slate-600 group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    className="input font-mono text-xs"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    className="input font-mono text-xs"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    inputMode="decimal"
                  />
                </div>
              </div>
            </details>

            <button type="submit" className="btn-primary w-full" disabled={analyzing}>
              <Search size={16} /> Analyze Area
            </button>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <AlertTriangle size={11} className="text-amber-400/70" />
              All camera &amp; route data is simulated for demo purposes.
            </p>
          </form>
        </aside>

        {/* center: map + camera list */}
        <div className="flex min-w-0 flex-1">
          <main className="relative min-w-0 flex-1">
            <MapView
              incident={incident}
              cameras={scored}
              routes={showRoute ? routes : []}
              selectedRouteId={selectedRouteId}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showCoverage={showCoverage}
            />

            {/* overlay controls */}
            <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex flex-col gap-2">
              <div className="card pointer-events-auto flex items-center gap-1 p-1">
                <ToggleBtn active={showCoverage} onClick={() => setShowCoverage((v) => !v)}>
                  <Layers size={14} /> Coverage
                </ToggleBtn>
                <ToggleBtn
                  active={showRoute}
                  onClick={() => setShowRoute((v) => !v)}
                  disabled={!routes.length}
                >
                  <ScanLine size={14} /> Possible routes
                </ToggleBtn>
              </div>
            </div>

            {analyzing && (
              <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-ink-950/50 backdrop-blur-sm">
                <div className="card flex items-center gap-3 px-5 py-3.5 shadow-glowAi">
                  <Cpu size={18} className="animate-pulse text-ai-400" />
                  <span className="text-sm text-slate-200">
                    Analyzing coverage &amp; prioritizing cameras…
                  </span>
                </div>
              </div>
            )}

            {/* legend */}
            <div className="pointer-events-none absolute bottom-6 left-4 z-[1000]">
              <div className="card pointer-events-auto px-3 py-2.5">
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">Priority</p>
                <div className="flex flex-col gap-1 text-[11px]">
                  <LegendRow color="bg-pri-high" label="High (70+)" />
                  <LegendRow color="bg-pri-med" label="Medium (45–69)" />
                  <LegendRow color="bg-pri-low" label="Low (<45)" />
                  <LegendRow color="bg-ai-500" label="Possible route (simulated)" />
                </div>
              </div>
            </div>

            {!panelOpen && (
              <button
                onClick={() => setPanelOpen(true)}
                className="absolute right-4 top-4 z-[1000] card p-2 text-slate-300 hover:text-white"
              >
                <PanelRightOpen size={16} />
              </button>
            )}
          </main>

          {/* camera list strip */}
          {incident && (
            <div className="hidden w-[300px] shrink-0 border-l border-white/5 bg-ink-900/50 lg:flex lg:flex-col">
              <CameraList
                cameras={scored}
                selectedId={selectedId}
                onSelect={setSelectedId}
                filter={filter}
                onFilter={setFilter}
              />
            </div>
          )}
        </div>

        {/* right detail panel */}
        {incident && panelOpen && (
          <aside className="flex w-[340px] shrink-0 flex-col border-l border-white/5 bg-ink-900/60">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <ScanLine size={15} className="text-ai-400" />
                <h2 className="text-sm font-semibold text-slate-200">Routes &amp; Camera Detail</h2>
              </div>
              <button onClick={() => setPanelOpen(false)} className="btn-ghost -mr-1.5 p-1.5">
                <PanelRightClose size={16} />
              </button>
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
              <RoutePanel
                routes={routes}
                cameras={scored}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                onSelect={setSelectedId}
              />
              <div className="divider mx-4" />
              {selected ? (
                <CameraDetail camera={selected} onClose={() => setSelectedId(null)} />
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-slate-500">
                  <Eye size={24} className="text-slate-700" />
                  <p className="text-xs">Select a camera to inspect its simulated details.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* empty state hint when no analysis yet */}
      {!incident && !analyzing && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[900] flex -translate-y-1/2 items-center justify-center">
          <div className="pointer-events-auto card flex items-center gap-3 px-5 py-3">
            <Video size={16} className="text-action-400" />
            <span className="text-sm text-slate-300">
              Fill in the incident details and click <strong>Analyze Area</strong> to begin.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn px-2.5 py-1.5 text-xs ${
        active
          ? 'bg-action-600/20 text-action-300 ring-1 ring-action-500/40'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-slate-400">{label}</span>
    </div>
  );
}
