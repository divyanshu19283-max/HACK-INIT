import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident, ScoredCamera, PossibleRoute, Priority, Camera } from '@/types';

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#22c55e',
};

interface Props {
  incident?: Incident | null;
  cameras: (ScoredCamera | Camera)[];
  routes?: PossibleRoute[];
  selectedRouteId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showCoverage?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapView({
  incident = null,
  cameras,
  routes = [],
  selectedRouteId = null,
  selectedId = null,
  onSelect,
  showCoverage = true,
  initialCenter = [28.7325, 77.0875],
  initialZoom = 15,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // init once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap (demo map)',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // render markers
  const incidentKey = incident ? `${incident.lat},${incident.lng},${incident.radius}` : '';
  const routeKey = routes.map((r) => r.id + r.cameraIds.length).join('-') + (selectedRouteId ?? '');
  const cameraKey = cameras.map((c) => c.id).join('-');

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    // search radius circle
    if (incident) {
      L.circle([incident.lat, incident.lng], {
        radius: incident.radius,
        color: '#3b82f6',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#3b82f6',
        fillOpacity: 0.06,
        dashArray: '6 6',
      }).addTo(layer);
    }

    // coverage circles
    if (showCoverage) {
      cameras.forEach((c) => {
        const priority = 'priority' in c ? c.priority : basePriorityToTier(c.basePriority);
        L.circle([c.lat, c.lng], {
          radius: c.coverageRadius,
          color: PRIORITY_COLOR[priority],
          weight: 1,
          opacity: 0.5,
          fillColor: PRIORITY_COLOR[priority],
          fillOpacity: c.id === selectedId ? 0.18 : 0.06,
        }).addTo(layer);
      });
    }

    // possible route polylines (simulated)
    routes.forEach((r) => {
      if (r.path.length < 2) return;
      const isSel = r.id === selectedRouteId;
      const latlngs: [number, number][] = r.path.map((p) => [p.lat, p.lng]);
      L.polyline(latlngs, {
        color: isSel ? '#a78bfa' : '#6d28d9',
        weight: isSel ? 4 : 2,
        opacity: isSel ? 0.95 : 0.45,
        dashArray: '8 6',
      })
        .addTo(layer)
        .bindTooltip(
          `<div style="font-family:Inter,sans-serif"><strong>${r.label}</strong><br/>${r.cameraIds.length} cameras · ${r.activeCameraIds.length} active · ${r.coveragePct}% coverage</div>`,
          { sticky: true },
        );
      if (isSel) {
        r.path.forEach((p, i) => {
          if (i === 0) return;
          L.circleMarker([p.lat, p.lng], {
            radius: 3,
            color: '#a78bfa',
            fillColor: '#a78bfa',
            fillOpacity: 1,
          }).addTo(layer);
        });
      }
    });

    // camera markers
    cameras.forEach((c) => {
      const priority = 'priority' in c ? c.priority : basePriorityToTier(c.basePriority);
      const color = PRIORITY_COLOR[priority];
      const selected = c.id === selectedId;
      const icon = L.divIcon({
        className: '',
        html: `<div class="camera-pin" style="background:${color};${
          selected ? 'box-shadow:0 0 0 3px #fff,0 0 18px -2px ' + color : ''
        }"><span>${iconFor(c.type)}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      const m = L.marker([c.lat, c.lng], { icon }).addTo(layer);
      if (onSelect) m.on('click', () => onSelect(c.id));
      const scoreLabel = 'score' in c ? ` · ${c.score}/100` : ` · base ${c.basePriority}/100`;
      m.bindTooltip(
        `<div style="font-family:Inter,sans-serif"><strong>${c.name}</strong><br/>${c.id} · ${c.roadName}${scoreLabel}</div>`,
        { direction: 'top', offset: [0, -26] },
      );
    });

    // incident marker (on top)
    if (incident) {
      const pulse = L.divIcon({
        className: '',
        html: '<div class="incident-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([incident.lat, incident.lng], { icon: pulse, interactive: false }).addTo(layer);
      const pin = L.divIcon({
        className: '',
        html: '<div class="incident-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([incident.lat, incident.lng], { icon: pin, interactive: false }).addTo(layer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentKey, routeKey, selectedRouteId, showCoverage, selectedId, cameraKey]);

  // fit bounds when incident changes
  const fitKey = useMemo(
    () => (incident ? `${incident.lat},${incident.lng},${incident.radius}` : ''),
    [incident],
  );
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !incident) return;
    const r = Math.max(incident.radius, 120);
    map.fitBounds(
      [
        [incident.lat - r / 111000, incident.lng - r / 70000],
        [incident.lat + r / 111000, incident.lng + r / 70000],
      ],
      { padding: [40, 40] },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  return <div ref={elRef} className="h-full w-full" />;
}

function basePriorityToTier(score: number): Priority {
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function iconFor(type: string): string {
  switch (type) {
    case 'ptz':
      return '⟳';
    case 'dome':
      return '◉';
    case 'traffic':
      return '⇄';
    case 'doorbell':
      return '◷';
    case 'bodycam':
      return '▶';
    default:
      return '▪';
  }
}
