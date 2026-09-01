import { useState } from 'react';
import { X, Video, Activity, Eye, Compass, Ruler, HardDrive, Calendar, Building2, Sparkles, ShieldAlert, Route, Clock, PlayCircle } from 'lucide-react';
import type { ScoredCamera } from '@/types';
import { CAMERA_TYPE_LABELS } from '@/data/cameras';
import { compassLabel } from '@/lib/geo';
import CameraFootageModal from '@/components/CameraFootageModal';

interface Props { camera: ScoredCamera | null; onClose: () => void; }

const CAMERA_CONTEXT_IMAGES = [
  'https://img.staticmb.com/mbphoto/locality/cropped_images/2025/Oct/9/Photo_h470_w1080/78167_Bank3_470_1080.jpg',
  'https://1.bp.blogspot.com/-WeiIXDbkM80/YCJor0lAY4I/AAAAAAAASC4/QyjkEXHqWQgxy_8aptMoMFe-BNNbAUy0wCPcBGAYYCw/w640-h400/25VZ3CCTVCAMERA.jpg',
  'https://media.newindianexpress.com/newindianexpress/2025-01-30/hkqqgtw4/C_1_1_CH1280_106820638.jpg?auto=format%2Ccompress&enlarge=true&fit=max&h=675&w=1200',
  'https://news24online.com/wp-content/uploads/2023/06/New-Project-2023-06-15T154536.325.jpg',
];

function cameraImage(camera: ScoredCamera) {
  const numericId = Number(camera.id.replace(/\D/g, '')) || 1;
  return CAMERA_CONTEXT_IMAGES[(numericId - 1) % CAMERA_CONTEXT_IMAGES.length];
}

export default function CameraDetail({ camera, onClose }: Props) {
  const [footageOpen, setFootageOpen] = useState(false);
  if (!camera) return null;

  const rows = [
    { icon: Building2, label: 'Operator', value: camera.operator },
    { icon: Video, label: 'Type', value: CAMERA_TYPE_LABELS[camera.type] },
    { icon: Route, label: 'Road name', value: camera.roadName },
    { icon: Clock, label: 'Active hours', value: camera.activeHours },
    { icon: Activity, label: 'Recording at incident time', value: camera.availableAtIncidentTime ? 'Yes (simulated)' : 'Unlikely' },
    { icon: Ruler, label: 'Distance from incident', value: `${camera.distance} m` },
    { icon: Eye, label: 'Field of view', value: `${camera.fov}°` },
    { icon: Compass, label: 'Direction', value: `${compassLabel(camera.heading)} (${camera.heading}°)` },
    { icon: Ruler, label: 'Coverage radius', value: `${camera.coverageRadius} m` },
    { icon: HardDrive, label: 'Resolution', value: camera.resolution },
    { icon: Calendar, label: 'Installed', value: camera.installed },
    { icon: HardDrive, label: 'Retention', value: `${camera.retentionDays} days` },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-white/5 px-4 py-3">
        <div>
          <div className="flex items-center gap-2"><Video size={16} className="text-action-400" /><h3 className="text-sm font-semibold text-slate-100">{camera.name}</h3></div>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">{camera.id}</p>
        </div>
        <button onClick={onClose} className="btn-ghost -mr-1.5 p-1.5"><X size={16} /></button>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="relative mb-4 h-40 overflow-hidden rounded-lg ring-1 ring-white/10 sm:h-48">
          <img src={cameraImage(camera)} alt={`Illustrative surroundings for ${camera.name}`} className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-black/10" />
          <div className="absolute left-3 top-3 rounded bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-200 backdrop-blur-sm">SIMULATED CAMERA CONTEXT</div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div><p className="text-sm font-semibold text-white">{camera.name}</p><p className="text-[11px] text-slate-300">Illustrative area / CCTV reference image</p></div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${camera.active ? 'bg-pri-low/20 text-pri-low' : 'bg-pri-high/20 text-pri-high'}`}>{camera.active ? 'ACTIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="card p-3"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500"><Activity size={11} /> Status</div><p className={`mt-1 text-sm font-semibold ${camera.active ? 'text-pri-low' : 'text-pri-high'}`}>{camera.active ? 'Active' : 'Offline'}</p></div>
          <div className="card p-3"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500"><Sparkles size={11} className="text-ai-400" /> Priority score</div><p className="mt-1 text-sm font-semibold text-slate-100">{camera.score}% <span className="ml-1 text-[11px] font-normal text-slate-500">{camera.priority} priority</span></p></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">{rows.map((r) => <div key={r.label} className="flex items-start gap-2"><r.icon size={14} className="mt-0.5 shrink-0 text-slate-500" /><div className="min-w-0"><p className="text-[11px] uppercase tracking-wider text-slate-500">{r.label}</p><p className="truncate text-sm text-slate-200">{r.value}</p></div></div>)}</div>

        <div className="mt-5"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ai-300"><ShieldAlert size={12} /> Why this score</div><p className="mt-2 rounded-md bg-ai-500/5 px-2.5 py-2 text-xs leading-relaxed text-slate-300 ring-1 ring-ai-500/15">{camera.explanation}</p><div className="mt-3 space-y-2.5">{camera.factors.map((f) => <div key={f.key}><div className="flex items-center justify-between text-[11px]"><span className="text-slate-300">{f.label} <span className="text-slate-500">({f.weight}%)</span></span><span className="font-mono text-slate-400">{f.points.toFixed(1)}/{f.weight}</span></div><div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-ai-500" style={{ width: `${Math.round(f.value * 100)}%` }} /></div><p className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-500"><Sparkles size={10} className="mt-0.5 shrink-0 text-ai-400/70" />{f.note}</p></div>)}</div><p className="mt-3 text-[10px] leading-relaxed text-slate-500">Simulated priority is a review-order suggestion only. It is not proof, certainty, or an indication that anything was recorded.</p></div>

        <div className="mt-5"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500"><Video size={12} /> Footage</div><button onClick={() => setFootageOpen(true)} className="card card-hover mt-2 flex w-full items-center gap-3 overflow-hidden p-3 text-left"><div className="relative flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-900"><img src={cameraImage(camera)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-black/45" /><PlayCircle size={22} className="relative text-slate-300" /></div><div className="min-w-0"><p className="text-sm font-medium text-slate-200">View Demo Footage</p><p className="mt-0.5 text-[11px] text-slate-500">Opens a simulated player · no real recording exists</p></div></button></div>
      </div>

      <CameraFootageModal camera={footageOpen ? camera : null} onClose={() => setFootageOpen(false)} />
    </div>
  );
}
