import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Health check: confirma que el deploy vive y si Supabase esta configurado. */
export async function GET() {
  const supabase: { configured: boolean; reachable: boolean; error?: string } = {
    configured: isSupabaseConfigured(),
    reachable: false,
  };

  if (supabase.configured) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const client = await createClient();
      const { error } = await client.auth.getUser();
      // "sesion ausente" es una respuesta valida: el servicio respondio.
      supabase.reachable = !error || error.status === 400 || error.status === 401;
      if (!supabase.reachable) supabase.error = error?.message;
    } catch (err) {
      supabase.error = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "udm-sofom",
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    environment: process.env.VERCEL_ENV ?? "development",
    supabase,
  });
}
