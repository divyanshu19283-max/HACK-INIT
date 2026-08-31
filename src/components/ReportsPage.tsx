import { useState } from 'react';
import {
  FileText,
  Download,
  FileSearch,
  MapPin,
  Clock,
  Video,
  AlertTriangle,
} from 'lucide-react';
import type { InvestigationRecord, Page } from '@/types';

interface Props {
  investigations: InvestigationRecord[];
  onNavigate: (page: Page) => void;
}

export default function ReportsPage({ investigations, onNavigate }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    investigations.length > 0 ? investigations[investigations.length - 1]!.id : null,
  );
  const selected = investigations.find((i) => i.id === selectedId) ?? null;

  function downloadReport() {
    if (!selected) return;
    const lines = [
      'EVIDENCEROUTE AI — SIMULATED INVESTIGATION REPORT',
      '================================================',
      '',
      `Report ID:     ${selected.id}`,
      `Title:         ${selected.title}`,
      `Category:      ${selected.category}`,
      `Location:      ${selected.locationLabel}`,
      `Coordinates:   ${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`,
      `Search radius: ${selected.radius} m`,
      `Date:          ${selected.date}`,
      `Time:          ${selected.time}`,
      `Status:        ${selected.status}`,
      '',
      'SUMMARY',
      '-------',
      `Cameras identified:     ${selected.cameraCount}`,
      `High priority cameras:  ${selected.highPriorityCount}`,
      '',
      'NOTE: All data in this report is simulated for demonstration.',
      'Not affiliated with any police force or government body.',
      '',
      `Generated: ${new Date().toISOString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selected.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate and review simulated investigation reports.
          </p>
        </div>

        {investigations.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-16 text-center">
            <FileText size={30} className="text-slate-700" />
            <p className="text-sm text-slate-500">No investigations to report on yet.</p>
            <button onClick={() => onNavigate('new-investigation')} className="btn-primary">
              <FileSearch size={15} /> Start New Investigation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* list */}
            <div className="space-y-2 lg:col-span-1">
              {investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className={`card card-hover w-full p-3 text-left ring-1 ${selectedId === inv.id ? 'ring-action-500/60 bg-ink-800' : 'ring-transparent'}`}
                >
                  <p className="truncate text-sm font-medium text-slate-200">{inv.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin size={10} /> {inv.locationLabel}
                  </p>
                </button>
              ))}
            </div>

            {/* report preview */}
            <div className="lg:col-span-2">
              {selected && (
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-action-400" />
                      <h2 className="text-sm font-semibold text-slate-200">
                        Report Preview
                      </h2>
                    </div>
                    <button onClick={downloadReport} className="btn-ghost px-2.5 py-1.5 text-xs">
                      <Download size={13} /> Download .txt
                    </button>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">
                        {selected.title}
                      </h3>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">{selected.id}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                      <Field icon={MapPin} label="Location" value={selected.locationLabel} />
                      <Field icon={Clock} label="Date / Time" value={`${selected.date} ${selected.time}`} />
                      <Field icon={FileText} label="Category" value={selected.category} />
                      <Field icon={Video} label="Cameras" value={String(selected.cameraCount)} />
                      <Field
                        icon={AlertTriangle}
                        label="High Priority"
                        value={String(selected.highPriorityCount)}
                      />
                      <Field icon={FileText} label="Status" value={selected.status} />
                    </div>

                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] text-amber-300/90">
                        <AlertTriangle size={12} />
                        This report contains simulated data for demonstration only.
                      </p>
                    </div>

                    <div>
                      <p className="label">Summary</p>
                      <p className="text-sm leading-relaxed text-slate-300">
                        The analysis identified {selected.cameraCount} cameras within the search
                        radius around {selected.locationLabel}. Of these,{' '}
                        {selected.highPriorityCount} were classified as high priority by the AI
                        scoring engine. A simulated escape route was generated linking the
                        incident location to cameras along the likely path.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
        <Icon size={11} /> {label}
      </p>
      <p className="mt-0.5 truncate text-sm text-slate-200">{value}</p>
    </div>
  );
}
