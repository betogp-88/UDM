import { isSupabaseConfigured } from "@/lib/env";

export default function Home() {
  const supabaseOk = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-4 py-16">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-brand-accent">SOFOM</p>
        <h1 className="mt-1 text-3xl font-semibold">UDM · Sistema de gestión</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Andamiaje inicial. La funcionalidad del negocio se define en el siguiente paso.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Estado de la conexion
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Status label="Next.js en Vercel" ok />
          <Status
            label="Supabase (variables de entorno)"
            ok={supabaseOk}
            hint={supabaseOk ? undefined : "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY"}
          />
        </ul>
      </section>

      <p className="text-xs text-slate-500">
        Diagnostico detallado en <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">/api/health</code>
      </p>
    </main>
  );
}

function Status({ label, ok, hint }: { label: string; ok: boolean; hint?: string }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden className={ok ? "text-emerald-600" : "text-amber-600"}>
        {ok ? "●" : "○"}
      </span>
      <span>
        {label}
        {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
      </span>
    </li>
  );
}
