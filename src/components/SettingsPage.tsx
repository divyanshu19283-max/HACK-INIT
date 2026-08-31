import { Settings, Cpu, MapPin, ShieldAlert, Database, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure demo preferences for the investigation platform.
          </p>
        </div>

        <div className="space-y-4">
          <SettingsCard
            icon={Cpu}
            title="AI Engine"
            description="Simulated AI scoring and route generation."
          >
            <Toggle label="AI camera prioritization" defaultOn />
            <Toggle label="Auto-generate escape route" defaultOn />
            <Toggle label="Coverage radius overlay" defaultOn />
          </SettingsCard>

          <SettingsCard
            icon={MapPin}
            title="Map & Location"
            description="Default map center and search radius."
          >
            <Row label="Default location" value="M2K Rohini Sector 7, Delhi" />
            <Row label="Default search radius" value="300 m" />
            <Row label="Tile provider" value="OpenStreetMap (dark filter)" />
          </SettingsCard>

          <SettingsCard
            icon={Database}
            title="Data Source"
            description="Where simulated camera data is stored."
          >
            <Row label="Source" value="Local demo dataset (20 cameras)" />
            <Row label="Persistence" value="Session only (in-memory)" />
          </SettingsCard>

          <SettingsCard
            icon={Bell}
            title="Notifications"
            description="Alerts for high-priority findings."
          >
            <Toggle label="High-priority camera alerts" defaultOn />
            <Toggle label="Route generation complete" defaultOn />
          </SettingsCard>

          <SettingsCard
            icon={ShieldAlert}
            title="Demo Notice"
            description="This platform is a prototype only."
          >
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-300/90">
                All CCTV locations, camera metadata, routes and footage are simulated.
                Not affiliated with any police force or government body.
              </p>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-action-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
            <p className="text-[11px] text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between px-5 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-white/10 transition has-[:checked]:bg-action-600">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <span className="ml-0.5 h-4 w-4 rounded-full bg-slate-300 transition-transform peer-checked:translate-x-4 peer-checked:bg-white" />
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}
