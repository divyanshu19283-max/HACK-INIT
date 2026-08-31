import type {
  Camera,
  Incident,
  ScoredCamera,
  Priority,
  ScoreFactor,
  RoutePoint,
} from '@/types';

const R = 6371000; // earth radius meters

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

/** Haversine distance in meters */
export function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Bearing from a->b in degrees 0..360 */
export function bearingDeg(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const dLng = toRad(bLng - aLng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Angular difference between two headings, 0..180 */
export function headingDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

/** Convert a heading in degrees (0..360) to an 16-point compass label. */
export function compassLabel(headingDeg: number): string {
  const idx = Math.round(((headingDeg % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS_POINTS[idx]!;
}

/** Offset a lat/lng by a distance (m) on a bearing (deg). */
export function offsetPoint(
  lat: number,
  lng: number,
  bearing: number,
  distM: number,
): RoutePoint {
  const br = toRad(bearing);
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const dr = distM / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(br),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

/** Does the incident fall within the camera's field of view? */
export function inViewOf(camera: Camera, inc: Incident): boolean {
  if (camera.fov >= 350) return true; // full dome
  const dir = bearingDeg(camera.lat, camera.lng, inc.lat, inc.lng);
  return headingDelta(dir, camera.heading) <= camera.fov / 2;
}

/** Does the incident fall within the camera's coverage radius? */
export function inCoverageOf(camera: Camera, inc: Incident): boolean {
  return (
    distanceMeters(camera.lat, camera.lng, inc.lat, inc.lng) <=
    camera.coverageRadius
  );
}

/* ------------------------------------------------------------------ */
/* Availability (simulated active hours)                               */
/* ------------------------------------------------------------------ */

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Is a camera recording at the incident time, given its simulated active hours? */
export function availabilityRatio(camera: Camera, time: string): number {
  if (camera.activeHours.trim() === '24/7') return 1;
  const [from, to] = camera.activeHours.split('-');
  if (!from || !to) return 0.5;
  const t = minutesOfDay(time);
  const a = minutesOfDay(from);
  const b = minutesOfDay(to);
  const inside = a <= b ? t >= a && t <= b : t >= a || t <= b;
  if (inside) return 0.92;
  // near the edge of the window (within 45 min) — footage may still exist
  const edge = Math.min(
    Math.abs(t - a),
    Math.abs(t - b),
    1440 - Math.abs(t - a),
    1440 - Math.abs(t - b),
  );
  return edge <= 45 ? 0.45 : 0.1;
}

/* ------------------------------------------------------------------ */
/* Transparent weighted priority engine                                */
/* ------------------------------------------------------------------ */

export const SCORE_WEIGHTS = {
  distance: 30,
  direction: 25,
  routeCoverage: 20,
  status: 15,
  availability: 10,
} as const;

function distanceToPath(camera: Camera, path: RoutePoint[]): number {
  let best = Infinity;
  for (const p of path) {
    const d = distanceMeters(camera.lat, camera.lng, p.lat, p.lng);
    if (d < best) best = d;
  }
  return best;
}

/**
 * SIMULATED scoring. Every component is transparent and weighted:
 * distance 30%, direction relevance 25%, road/route coverage 20%,
 * camera status 15%, availability during incident time 10%.
 */
export function scoreCamera(
  camera: Camera,
  inc: Incident,
  routePaths: RoutePoint[][] = [],
): ScoredCamera {
  const distance = distanceMeters(camera.lat, camera.lng, inc.lat, inc.lng);
  const inCoverage = distance <= camera.coverageRadius;
  const seesIncident = inViewOf(camera, inc);

  // --- 1. Distance from incident (30%)
  const dRatio = clamp01(1 - distance / Math.max(inc.radius, 1));
  const distanceValue = inCoverage ? Math.max(dRatio, 0.95) : dRatio;
  const distanceNote = inCoverage
    ? `Incident sits inside the camera's ${camera.coverageRadius} m coverage (${Math.round(distance)} m away)`
    : `${Math.round(distance)} m from the incident within a ${inc.radius} m search radius`;

  // --- 2. Direction relevance (25%)
  let directionValue: number;
  let directionNote: string;
  if (camera.fov >= 350) {
    directionValue = 0.85;
    directionNote = '360° camera — no blind side toward the incident';
  } else {
    const bearing = bearingDeg(camera.lat, camera.lng, inc.lat, inc.lng);
    const delta = headingDelta(bearing, camera.heading);
    if (seesIncident) {
      directionValue = clamp01(1 - delta / Math.max(camera.fov, 1));
      directionNote = `Facing the incident (${Math.round(delta)}° off centre of a ${camera.fov}° view)`;
    } else {
      directionValue = clamp01(0.35 - (delta - camera.fov / 2) / 180);
      directionNote = `Incident falls outside the ${camera.fov}° field of view (${Math.round(delta)}° off heading)`;
    }
  }

  // --- 3. Road / route coverage (20%)
  let routeValue = 0.2;
  let routeNote = 'Not close to any of the generated possible routes';
  if (routePaths.length) {
    const nearest = Math.min(...routePaths.map((p) => distanceToPath(camera, p)));
    if (nearest <= camera.coverageRadius) {
      routeValue = clamp01(1 - nearest / (camera.coverageRadius * 2));
      routeValue = Math.max(routeValue, 0.8);
      routeNote = `Covers a possible route (path passes ~${Math.round(nearest)} m away)`;
    } else if (nearest <= camera.coverageRadius * 3) {
      routeValue = clamp01(0.6 - nearest / (camera.coverageRadius * 6));
      routeNote = `Near a possible route (~${Math.round(nearest)} m off the path)`;
    } else {
      routeValue = 0.15;
      routeNote = `~${Math.round(nearest)} m from the nearest possible route`;
    }
  }
  // road-facing camera types see more of the carriageway
  if (camera.type === 'traffic' || camera.type === 'ptz') {
    routeValue = clamp01(routeValue + 0.1);
    routeNote += ' · road-facing camera type';
  }

  // --- 4. Camera status (15%)
  const statusValue = camera.active ? 1 : 0.1;
  const statusNote = camera.active
    ? `Reported online (${camera.resolution}, ${camera.retentionDays}-day retention)`
    : 'Reported offline in the demo network';

  // --- 5. Availability during incident time (10%)
  const availValue = availabilityRatio(camera, inc.time);
  const availNote =
    camera.activeHours === '24/7'
      ? 'Records 24/7, so the incident window is covered'
      : availValue >= 0.9
        ? `Recording window ${camera.activeHours} includes ${inc.time}`
        : availValue >= 0.4
          ? `Incident time ${inc.time} is at the edge of the ${camera.activeHours} window`
          : `Incident time ${inc.time} falls outside the ${camera.activeHours} window`;

  const factors: ScoreFactor[] = [
    {
      key: 'distance',
      label: 'Distance from incident',
      weight: SCORE_WEIGHTS.distance,
      value: distanceValue,
      points: round1(distanceValue * SCORE_WEIGHTS.distance),
      note: distanceNote,
    },
    {
      key: 'direction',
      label: 'Camera direction relevance',
      weight: SCORE_WEIGHTS.direction,
      value: directionValue,
      points: round1(directionValue * SCORE_WEIGHTS.direction),
      note: directionNote,
    },
    {
      key: 'routeCoverage',
      label: 'Road / route coverage',
      weight: SCORE_WEIGHTS.routeCoverage,
      value: routeValue,
      points: round1(routeValue * SCORE_WEIGHTS.routeCoverage),
      note: routeNote,
    },
    {
      key: 'status',
      label: 'Camera status',
      weight: SCORE_WEIGHTS.status,
      value: statusValue,
      points: round1(statusValue * SCORE_WEIGHTS.status),
      note: statusNote,
    },
    {
      key: 'availability',
      label: 'Availability at incident time',
      weight: SCORE_WEIGHTS.availability,
      value: availValue,
      points: round1(availValue * SCORE_WEIGHTS.availability),
      note: availNote,
    },
  ];

  const score = Math.max(
    0,
    Math.min(100, Math.round(factors.reduce((s, f) => s + f.points, 0))),
  );

  let priority: Priority;
  if (score >= 70) priority = 'high';
  else if (score >= 45) priority = 'medium';
  else priority = 'low';

  const strong = [...factors].sort((a, b) => b.value - a.value).slice(0, 2);
  const weak = [...factors].sort((a, b) => a.value - b.value)[0]!;
  const explanation =
    `${priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Lower'} suggested priority: ` +
    `${strong.map((f) => f.label.toLowerCase()).join(' and ')} score well` +
    (weak.value < 0.5 ? `, while ${weak.label.toLowerCase()} scores poorly.` : '.') +
    ' This is a simulated relevance estimate for review order only — not evidence or proof.';

  return {
    ...camera,
    distance: Math.round(distance),
    score,
    priority,
    factors,
    explanation,
    availableAtIncidentTime: availValue >= 0.9,
    rationale: factors.map((f) => f.note),
    inCoverage,
  };
}

export function scoreAll(
  cameras: Camera[],
  inc: Incident,
  routePaths: RoutePoint[][] = [],
): ScoredCamera[] {
  return cameras
    .map((c) => scoreCamera(c, inc, routePaths))
    .filter((c) => c.distance <= inc.radius * 1.15)
    .sort((a, b) => b.score - a.score);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}
