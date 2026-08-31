import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import { supabase } from "@/lib/supabase";

const AppShell = lazy(() => import("@/components/AppShell"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EvidenceRoute AI — Secure CCTV Route Intelligence" },
      {
        name: "description",
        content:
          "Secure investigator access for CCTV coverage analysis and route intelligence.",
      },
      { property: "og:title", content: "EvidenceRoute AI — Secure CCTV Route Intelligence" },
      {
        property: "og:description",
        content: "Secure investigator access for CCTV coverage analysis and route mapping.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialiseAuth() {
      // Google/Supabase OAuth may return to this same route with a PKCE
      // authorization code. Explicitly exchange it before rendering the app.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        // Remove the one-time code so refreshes cannot try to exchange it again.
        url.searchParams.delete("code");
        url.searchParams.delete("error");
        url.searchParams.delete("error_code");
        url.searchParams.delete("error_description");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);

        if (error) {
          console.error("Supabase OAuth callback error:", error);
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        console.error("Supabase session error:", error);
      }

      setAuthenticated(Boolean(data.session));
      setReady(true);
    }

    void initialiseAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthenticated(Boolean(session));
      setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return <AppLoading />;
  }

  if (!authenticated) {
    return <LandingPage />;
  }

  return (
    <ClientOnly fallback={<AppLoading />}>
      <Suspense fallback={<AppLoading />}>
        <AppShell
          onExit={async () => {
            await supabase.auth.signOut();
            setAuthenticated(false);
          }}
        />
      </Suspense>
    </ClientOnly>
  );
}

function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950">
      <p className="text-sm text-slate-400">Loading secure workspace…</p>
    </div>
  );
}
