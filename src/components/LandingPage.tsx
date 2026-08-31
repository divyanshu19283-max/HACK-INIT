import { useState } from 'react';
import { formatDateShort } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  ScanLine,
  Video,
  Route,
  Cpu,
  Lock,
  LogIn,
  AlertTriangle,
  Mail,
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

  }

  async function handleGoogleLogin() {
    setError('');
    setMessage('');
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setGoogleLoading(false);
      setError(error.message);
    }
  }

  async function handleCreateAccount() {
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Enter an email and password first.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage('Account created. Check your email if confirmation is required, then sign in.');
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-action-600/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-ai-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-action-500 to-ai-600 shadow-glow">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            EvidenceRoute <span className="text-ai-400">AI</span>
          </span>
        </div>
        <span className="chip bg-action-500/10 text-action-300 ring-1 ring-action-500/20">
          <Lock size={11} /> Secure access
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-8">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-in">
            <div className="chip mb-5 bg-action-500/10 text-action-300 ring-1 ring-action-500/20">
              <Cpu size={12} /> AI-Powered Investigation Support
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-50 sm:text-4xl lg:text-[2.75rem]">
              AI-Powered CCTV
              <br />
              <span className="bg-gradient-to-r from-action-400 to-ai-400 bg-clip-text text-transparent">
                Route Intelligence
              </span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Identify potentially useful CCTV cameras around an incident location,
              visualize coverage areas, and map possible escape routes — all from a single
              investigation dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <FeaturePill icon={Video} label="Camera identification" />
              <FeaturePill icon={Route} label="Route visualization" />
              <FeaturePill icon={ScanLine} label="AI prioritization" />
            </div>

            {!showLogin && (
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary mt-8"
              >
                <LogIn size={16} /> Investigator Login
              </button>
            )}

            <p className="mt-3 text-[11px] text-slate-500">
              Authentication is required. Demo access has been disabled.
            </p>
          </div>

          <div className="animate-fade-in">
            {showLogin ? (
              <div className="card mx-auto w-full max-w-sm p-6 shadow-glow">
                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-action-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Investigator Sign In</h2>
                  </div>
                  <p className="text-xs text-slate-500">Sign in with your Supabase account.</p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="btn w-full bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                >
                  <GoogleIcon />
                  {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-widest text-slate-600">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        className="input pl-9"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="investigator@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                      {message}
                    </div>
                  )}

                  <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full disabled:opacity-60">
                    <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={loading || googleLoading}
                    className="btn w-full bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-60"
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setError('');
                      setMessage('');
                    }}
                    className="btn-ghost w-full text-xs"
                  >
                    Back
                  </button>
                </form>
              </div>
            ) : (
              <div className="card mx-auto w-full max-w-sm overflow-hidden p-0">
                <div className="relative aspect-[4/3] bg-ink-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-ink-700/40 via-ink-900 to-ai-600/10" />
                  <div className="scan-line absolute inset-x-0 h-16 bg-gradient-to-b from-action-500/15 to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pri-high" />
                    <span className="font-mono text-[10px] text-slate-300">SECURE WORKSPACE</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-action-500 to-ai-600 shadow-glow">
                      <Lock size={26} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">Authorized investigators only</p>
                    <p className="text-[11px] text-slate-500">
                      Sign in to access CCTV coverage, investigations and route analysis.
                    </p>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span>SECTOR 7 · DELHI</span>
                    <span>{formatDateShort()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-6 py-3 sm:px-10">
        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <AlertTriangle size={11} className="shrink-0 text-amber-400/70" />
          Prototype / demonstration only. All CCTV locations, metadata, routes and footage are
          simulated. Not affiliated with any police force or government body.
        </p>
      </footer>
    </div>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: typeof Video; label: string }) {
  return (
    <span className="chip bg-white/5 text-slate-300 ring-1 ring-white/10">
      <Icon size={12} className="text-action-400" /> {label}
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z" />
      <path fill="#34A853" d="M12 21.5c2.64 0 4.86-.87 6.48-2.35l-3.14-2.45c-.87.58-1.98.93-3.34.93-2.56 0-4.73-1.73-5.51-4.06H3.24v2.53A9.79 9.79 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.49 13.57A5.89 5.89 0 0 1 6.18 12c0-.55.1-1.08.31-1.57V7.9H3.24A9.5 9.5 0 0 0 2.22 12c0 1.48.35 2.88 1.02 4.1l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 6.37c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.86 3.48 14.64 2.5 12 2.5a9.79 9.79 0 0 0-8.76 5.4l3.25 2.53C7.27 8.1 9.44 6.37 12 6.37Z" />
    </svg>
  );
}
