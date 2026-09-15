import type { CookieOptions } from "@supabase/ssr";

/** Forma de las cookies que @supabase/ssr entrega a setAll. */
export type CookieToSet = { name: string; value: string; options: CookieOptions };
