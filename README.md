# UDM · Plataforma interna SOFOM

Aplicacion web interna. Este repositorio arranca solo con el andamiaje y las
conexiones (GitHub → Vercel → Supabase); la funcionalidad del negocio se define
en la siguiente etapa.

## Stack

| Pieza | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Estilos | Tailwind CSS |
| Base de datos / Auth | Supabase (Postgres + RLS) |
| Hosting | Vercel |
| CI | GitHub Actions (typecheck + lint + build) |

## Correr en local

```bash
npm install
cp .env.example .env.local   # llena los valores de Supabase
npm run dev                  # http://localhost:3000
```

## Verificar que todo esta conectado

- `/` muestra el estado de configuracion.
- `/api/health` devuelve JSON con el commit desplegado y si Supabase responde.

## Estructura

```
src/app/              rutas (App Router)
src/app/api/health/   health check del deploy
src/lib/env.ts        lectura centralizada de variables de entorno
src/lib/supabase/     clientes de Supabase (browser, server, middleware)
supabase/migrations/  migraciones SQL versionadas
docs/CONEXION.md      guia paso a paso de GitHub + Vercel + Supabase + celular
```

## Guia de conexion

Ver [`docs/CONEXION.md`](docs/CONEXION.md).
