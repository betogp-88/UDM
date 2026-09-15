# Contexto del proyecto UDM

App web interna para una SOFOM (entidad financiera no bancaria mexicana).

## Convenciones

- Next.js 15 App Router + TypeScript estricto. Nada de `any` implicito.
- Estilos con Tailwind. Paleta de marca en `tailwind.config.ts` (`brand.*`).
- Acceso a datos siempre via `src/lib/supabase/` — nunca instanciar clientes sueltos.
- Variables de entorno solo a traves de `src/lib/env.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` es exclusiva de codigo servidor. Nunca en componentes cliente.
- Toda tabla nueva lleva RLS habilitada y sus policies en la misma migracion.
- Migraciones en `supabase/migrations/`, con prefijo de fecha `YYYYMMDDHHMMSS_nombre.sql`.
- Textos de la interfaz en espanol.

## Antes de dar por terminado un cambio

```bash
npm run typecheck && npm run lint && npm run build
```
