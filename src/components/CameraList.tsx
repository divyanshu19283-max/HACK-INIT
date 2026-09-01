import { Video, AlertTriangle, CircleDot, Filter } from 'lucide-react';
import type { Priority, ScoredCamera } from '@/types';
import { CAMERA_TYPE_LABELS } from '@/data/cameras';

interface Props {
  cameras: ScoredCamera[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: Priority | 'all';
  onFilter: (f: Priority | 'all') => void;
}

const PRIORITY_STYLE: Record<Priority, { ring: string; text: string; bg: string; label: string }> = {
  high: { ring: 'ring-pri-high/40', text: 'text-pri-high', bg: 'bg-pri-high/15', label: 'High' },
  medium: { ring: 'ring-pri-med/40', text: 'text-pri-med', bg: 'bg-pri-med/15', label: 'Medium' },
  low: { ring: 'ring-pri-low/40', text: 'text-pri-low', bg: 'bg-pri-low/15', label: 'Low' },
};

const CAMERA_CONTEXT_IMAGES = [
  'https://img.staticmb.com/mbphoto/locality/cropped_images/2025/Oct/9/Photo_h470_w1080/78167_Bank3_470_1080.jpg',
  'https://1.bp.blogspot.com/-WeiIXDbkM80/YCJor0lAY4I/AAAAAAAASC4/QyjkEXHqWQgxy_8aptMoMFe-BNNbAUy0wCPcBGAYYCw/w640-h400/25VZ3CCTVCAMERA.jpg',
  'https://media.newindianexpress.com/newindianexpress/2025-01-30/hkqqgtw4/C_1_1_CH1280_106820638.jpg?auto=format%2Ccompress&enlarge=true&fit=max&h=675&w=1200',
  'https://news24online.com/wp-content/uploads/2023/06/New-Project-2023-06-15T154536.325.jpg',
];

function cameraImage(index: number) {
  return CAMERA_CONTEXT_IMAGES[index % CAMERA_CONTEXT_IMAGES.length];
}

export default function CameraList({ cameras, selectedId, onSelect, filter, onFilter }: Props) {
  const counts = {
    high: cameras.filter((c) => c.priority === 'high').length,
    medium: cameras.filter((c) => c.priority === 'medium').length,
    low: cameras.filter((c) => c.priority === 'low').length,
    all: cameras.length,
  };

  const filtered = filter === 'all' ? cameras : cameras.filter((c) => c.priority === filter);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-action-400" />
          <h3 className="text-sm font-semibold text-slate-200">Identified Cameras</h3>
          <span className="chip bg-white/5 text-slate-400">{cameras.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 pb-3">
        <Filter size={12} className="text-slate-500" />
        {(['all', 'high', 'medium', 'low'] as const).map((f) => {
          const active = filter === f;
          const color = f === 'high' ? 'text-pri-high' : f === 'medium' ? 'text-pri-med' : f === 'low' ? 'text-pri-low' : 'text-slate-300';
          return (
            <button key={f} onClick={() => onFilter(f)} className={`chip transition ${active ? `bg-white/10 ${color} ring-1 ring-white/15` : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>
              {f === 'all' ? 'All' : PRIORITY_STYLE[f].label}
              <span className="opacity-70">{counts[f]}</span>
            </button>
          );
        })}
      </div>

      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-slate-500">
            <AlertTriangle size={22} className="text-slate-600" />
            <p className="text-xs">No cameras matched this filter.</p>
          </div>
        )}
        {filtered.map((c, index) => {
          const st = PRIORITY_STYLE[c.priority];
          const selected = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`card card-hover w-full overflow-hidden p-0 text-left ring-1 ${selected ? 'ring-action-500/60 bg-ink-800' : 'ring-transparent'}`}
            >
              <div className="relative h-24 w-full overflow-hidden bg-slate-900 sm:h-28">
                <img src={cameraImage(index)} alt={`Illustrative view near ${c.name}`} loading="lazy" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                <div className="absolute left-2 top-2 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-200 backdrop-blur-sm">SIMULATED VIEW</div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.active ? 'bg-pri-low' : 'bg-pri-high'}`} />
                  {c.active ? 'Live status' : 'Offline'} · {CAMERA_TYPE_LABELS[c.type]}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`chip ${st.bg} ${st.text}`}><CircleDot size={10} /> {st.label}</span>
                      <span className="truncate text-sm font-medium text-slate-100">{c.name}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">{c.id} · {CAMERA_TYPE_LABELS[c.type]} · {c.distance}m</p>
                  </div>
                  <ScoreBadge score={c.score} />
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${c.priority === 'high' ? 'bg-pri-high' : c.priority === 'medium' ? 'bg-pri-med' : 'bg-pri-low'}`} style={{ width: `${c.score}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex flex-col items-end">
      <span className="font-mono text-lg font-semibold leading-none text-slate-100">{score}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">AI score</span>
    </div>
  );
}
