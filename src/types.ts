export type Priority = 'high' | 'medium' | 'low';

export type CameraType =
  | 'dome'
  | 'bullet'
  | 'ptz'
  | 'traffic'
  | 'doorbell'
  | 'bodycam';

export interface Camera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: CameraType;
  /** Simulated coverage radius in meters */
  coverageRadius: number;
  /** Simulated field of view in degrees */
  fov: number;
  /** Simulated facing heading in degrees (0 = north) */
  heading: number;
  /** Whether the simulated camera is currently active */
  active: boolean;
  /** Simulated operator/owner (fictional) */
  operator: string;
  /** Simulated install date */
  installed: string;
  /** Simulated recording resolution */
  resolution: string;
  /** Simulated retention days */
  retentionDays: number;
  /** Simulated road/street the camera overlooks */
  roadName: string;
  /** Simulated active recording hours (e.g. "24/7" or "06:00-23:00") */
  activeHours: string;
  /** Simulated baseline priority score 0..100, independent of any incident */
  basePriority: number;
}

export interface Incident {
  id: string;
  title: string;
  category: string;
  locationLabel: string;
  lat: number;
  lng: number;
  radius: number;
  date: string;
  time: string;
  occurredAt: string;
  description: string;
}

/** One transparent component of the priority score. */
export interface ScoreFactor {
  key: 'distance' | 'direction' | 'routeCoverage' | 'status' | 'availability';
  label: string;
  /** Max points this factor can contribute (weight %) */
  weight: number;
  /** Normalised 0..1 performance on this factor */
  value: number;
  /** value * weight */
  points: number;
  /** Plain-language reason */
  note: string;
}

export interface ScoredCamera extends Camera {
  /** Distance to incident in meters */
  distance: number;
  /** Simulated relevance score 0..100 */
  score: number;
  priority: Priority;
  /** Per-factor breakdown of the score */
  factors: ScoreFactor[];
  /** Plain-language summary of why the score is what it is */
  explanation: string;
  /** Whether the simulated recording window covers the incident time */
  availableAtIncidentTime: boolean;
  /** Human-readable rationale lines */
  rationale: string[];
  /** Whether the incident location falls inside this camera's coverage */
  inCoverage: boolean;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

/** A simulated possible road route leading away from the incident. */
export interface PossibleRoute {
  id: string;
  /** e.g. "Route A — North" */
  label: string;
  direction: 'North' | 'East' | 'South' | 'West';
  bearing: number;
  path: RoutePoint[];
  /** Simulated road names the route follows */
  roads: string[];
  /** All cameras along the route */
  cameraIds: string[];
  /** Subset that is online and recording at the incident time */
  activeCameraIds: string[];
  /** Estimated share of the route length under CCTV coverage (0..100) */
  coveragePct: number;
  /** Simulated review-priority score 0..100 */
  priorityScore: number;
  priority: Priority;
  /** Total simulated distance in meters */
  distance: number;
  /** Estimated time on foot in minutes */
  estMinutes: number;
}

export interface InvestigationRecord {
  id: string;
  title: string;
  category: string;
  locationLabel: string;
  lat: number;
  lng: number;
  radius: number;
  date: string;
  time: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  cameraCount: number;
  highPriorityCount: number;
}

export type Page =
  | 'dashboard'
  | 'new-investigation'
  | 'cctv-network'
  | 'investigations'
  | 'reports'
  | 'settings';
