import type {
  Camera,
  Incident,
  PossibleRoute,
  Priority,
  RoutePoint,
  ScoredCamera,
} from '@/types';
import { distanceMeters, offsetPoint, availabilityRatio } from './geo';

/**
 * SIMULATED route generator.
 *
 * Builds 4 plausible road-following polylines leading away from the incident
 * (north / east / south / west). These are POSSIBLE routes for coverage
 * planning only — none of them represents a known or actual path taken by
 * any person.
 */

const DIRECTIONS: {
  id: string;
  label: string;
  direction: PossibleRoute['direction'];
  bearing: number;
  /** relative turns applied along the way, so the line follows a street grid */
  turns: number[];
  roads: string[];
}[] = [
  {
    id: 'route-a',
    label: 'Route A — North',
    direction: 'North',
    bearing: 0,
    turns: [0, 0, 90, 0, -90, 0],
    roads: ['Sector 7 Main Road', 'Bank Chowk Road', 'Outer Ring Road'],
  },
  {
    id: 'route-b',
    label: 'Route B — East',
    direction: 'East',
    bearing: 90,
    turns: [0, -90, 0, 90, 0, 0],
    roads: ['Sector 7 Market Road', 'Overhead Tank Road', 'Community Park Road'],
  },
  {
    id: 'route-c',
    label: 'Route C — South',
    direction: 'South',
    bearing: 180,
    turns: [0, 0, -90, 0, 90, 0],
    roads: ['Metro Feeder Road', 'Hotel Frontage Road', 'Rear Service Lane'],
  },
  {
    id: 'route-d',
    label: 'Route D — West',
    direction: 'West',
    bearing: 270,
    turns: [0, 90, 0, 0, -90, 0],
    roads: ['Parking Garage Access Road', 'Rohini Park Walkway', 'DTC Bus Stop Road'],
  },
];

/** Geometry only — used before scoring so cameras can be graded on route coverage. */
export function buildRoutePaths(inc: Incident): RoutePoint[][] {
  return DIRECTIONS.map((d) => buildPath(inc, d.bearing, d.turns));
}

function buildPath(inc: Incident, bearing: number, turns: number[]): RoutePoint[] {
  const path: RoutePoint[] = [{ lat: inc.lat, lng: inc.lng }];
  const step = Math.max(inc.radius / turns.length, 45);
  let cur: RoutePoint = { lat: inc.lat, lng: inc.lng };
  let head = bearing;

  turns.forEach((turn, i) => {
    head = (head + turn + 360) % 360;
    // slight jitter keeps the polyline looking like a real street run
    const legs = turn === 0 ? 1 : 2;
    for (let l = 0; l < legs; l++) {
      const dist = (step / legs) * (i % 2 === 0 ? 1.1 : 0.85);
      cur = offsetPoint(cur.lat, cur.lng, head, dist);
      path.push(cur);
    }
  });

  return path;
}

/** Total length of a polyline in meters. */
function pathLength(path: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!a || !b) continue;
    total += distanceMeters(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

/** Densify a polyline so coverage can be sampled evenly along it. */
function samplePath(path: RoutePoint[], stepM = 20): RoutePoint[] {
  const out: RoutePoint[] = [];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!a || !b) continue;
    const segLen = distanceMeters(a.lat, a.lng, b.lat, b.lng);
    const n = Math.max(1, Math.round(segLen / stepM));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
    }
  }
  const last = path[path.length - 1];
  if (last) out.push(last);
  return out;
}

/**
 * Build the full set of possible routes with camera counts, active cameras,
 * estimated coverage and a review priority.
 */
export function buildPossibleRoutes(
  cameras: Camera[],
  inc: Incident,
  scored: ScoredCamera[],
): PossibleRoute[] {
  const scoreById = new Map(scored.map((s) => [s.id, s.score]));

  const routes = DIRECTIONS.map((d) => {
    const path = buildPath(inc, d.bearing, d.turns);
    const samples = samplePath(path);

    const cameraIds: string[] = [];
    for (const cam of cameras) {
      const near = samples.some(
        (p) => distanceMeters(p.lat, p.lng, cam.lat, cam.lng) <= cam.coverageRadius,
      );
      if (near) cameraIds.push(cam.id);
    }

    const byId = new Map(cameras.map((c) => [c.id, c]));
    const activeCameraIds = cameraIds.filter((id) => {
      const cam = byId.get(id);
      return !!cam && cam.active && availabilityRatio(cam, inc.time) >= 0.9;
    });

    // coverage = share of sampled points seen by at least one active camera
    const coveredSamples = samples.filter((p) =>
      activeCameraIds.some((id) => {
        const cam = byId.get(id);
        return (
          !!cam && distanceMeters(p.lat, p.lng, cam.lat, cam.lng) <= cam.coverageRadius
        );
      }),
    ).length;
    const coveragePct = samples.length
      ? Math.round((coveredSamples / samples.length) * 100)
      : 0;

    const avgCamScore = cameraIds.length
      ? cameraIds.reduce((s, id) => s + (scoreById.get(id) ?? 0), 0) / cameraIds.length
      : 0;
    const activeRatio = cameraIds.length ? activeCameraIds.length / cameraIds.length : 0;

    const priorityScore = Math.round(
      Math.max(
        0,
        Math.min(100, coveragePct * 0.4 + avgCamScore * 0.4 + activeRatio * 100 * 0.2),
      ),
    );

    let priority: Priority;
    if (priorityScore >= 65) priority = 'high';
    else if (priorityScore >= 40) priority = 'medium';
    else priority = 'low';

    const distance = Math.round(pathLength(path));

    return {
      id: d.id,
      label: d.label,
      direction: d.direction,
      bearing: d.bearing,
      path,
      roads: d.roads,
      cameraIds,
      activeCameraIds,
      coveragePct,
      priorityScore,
      priority,
      distance,
      estMinutes: Math.round((distance / 80) * 10) / 10,
    } satisfies PossibleRoute;
  });

  return routes.sort((a, b) => b.priorityScore - a.priorityScore);
}
