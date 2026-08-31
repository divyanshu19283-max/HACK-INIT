import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Video, ShieldQuestion } from 'lucide-react';
import type { ScoredCamera } from '@/types';
import { formatDateShort } from '@/lib/format';

interface Props {
  camera: ScoredCamera | null;
  onClose: () => void;
}

/** mm:ss from a whole-second counter, wrapping at 10 minutes for the demo clip. */
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const CLIP_LENGTH_SECONDS = 10 * 60; // simulated 10-minute clip

export default function CameraFootageModal({ camera, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset playback state whenever a different camera's footage is opened
  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [camera?.id]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => (prev + 1 >= CLIP_LENGTH_SECONDS ? 0 : prev + 1));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  // close on Escape
  useEffect(() => {
    if (!camera) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [camera, onClose]);

  if (!camera) return null;

  const progressPct = (elapsed / CLIP_LENGTH_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-in card w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-action-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Demo footage — {camera.name}
              </h3>
              <p className="font-mono text-[11px] text-slate-500">{camera.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost -mr-1.5 p-1.5">
            <X size={16} />
          </button>
        </div>

        {/* simulated video surface */}
        <div className="relative aspect-video bg-ink-900">
          <div className="absolute inset-0 bg-gradient-to-br from-ink-700/40 to-ink-900" />
          {playing && (
            <div className="scan-line absolute inset-x-0 h-12 bg-gradient-to-b from-action-500/10 to-transparent" />
          )}

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-pri-high ${playing ? 'animate-pulse' : ''}`}
            />
            <span className="font-mono text-[10px] text-slate-300">
              {playing ? 'REC' : 'PAUSED'} · SIMULATED
            </span>
          </div>

          <div className="absolute right-3 top-3 font-mono text-[10px] text-slate-400">
            {camera.roadName}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-slate-100 backdrop-blur-sm transition hover:bg-white/20"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
            <p className="text-[11px] text-slate-500">No real footage exists — demo playback only</p>
          </div>

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-slate-400">
            <span>{camera.id}</span>
            <span>{formatDateShort()}</span>
          </div>
        </div>

        {/* transport controls */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="btn-primary !px-3 !py-1.5"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              {formatTime(elapsed)} / {formatTime(CLIP_LENGTH_SECONDS)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-action-500 transition-[width]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <p className="mt-3 flex items-start gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2 text-[11px] leading-relaxed text-slate-400">
            <ShieldQuestion size={12} className="mt-0.5 shrink-0 text-amber-400/70" />
            This is a simulated player for demo purposes only. No video is actually
            recorded, stored, or streamed by this camera — the timestamp and clip
            above are placeholders, not real footage.
          </p>
        </div>
      </div>
    </div>
  );
}
