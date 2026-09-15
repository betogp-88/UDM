# Guia de conexion: GitHub · Vercel · Supabase · Claude en el celular

Esta guia deja el proyecto operable de punta a punta. Los pasos marcados
**(tu)** requieren tu cuenta y navegador; no se pueden automatizar desde aqui.

---

## 1. GitHub — listo

El repositorio es `betogp-88/UDM`. El codigo de este andamiaje vive en la rama
`claude/brave-franklin-uqlnf5`.

**(tu)** Abre el Pull Request de esa rama y hazle merge a `main`, o dime y lo
abro yo. Vercel debe desplegar desde `main`.

`.github/workflows/ci.yml` ya corre typecheck, lint y build en cada push.

---

## 2. Supabase **(tu)**

1. Entra a <https://supabase.com/dashboard> → **New project**.
   - Nombre: `udm-sofom`
   - Region: `East US (North Virginia)` o la mas cercana a tus usuarios
   - Guarda la contrasena de la base de datos en tu gestor de contrasenas.
2. Project Settings → **API**. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (secreta, solo servidor)
3. SQL Editor → pega el contenido de `supabase/migrations/00000000000000_init.sql`
   y ejecutalo. Crea la tabla `profiles` con RLS y el alta automatica de perfil.
4. Authentication → Providers: deja **Email** activo y *Enable signup* apagado
   (es una app interna; las altas las haces tu).
5. Authentication → URL Configuration:
   - Site URL: la URL de produccion de Vercel (paso 3)
   - Redirect URLs: agrega `https://udm-ashy.vercel.app/**` y `http://localhost:3000/**`

> Las llaves nunca se commitean. Van en `.env.local` (local) y en las variables
> de entorno de Vercel (nube).

---

## 3. Vercel **(tu)**

1. <https://vercel.com/new> → importa `betogp-88/UDM`.
2. Framework: Next.js (se detecta solo). No cambies build ni output.
3. **Environment Variables** — agrega en Production, Preview y Development:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role |
   | `NEXT_PUBLIC_SITE_URL` | la URL de produccion |

4. Deploy. Cada push a `main` despliega a produccion; cada PR genera un
   preview con su propia URL.

### Comprobacion

Abre <https://udm-ashy.vercel.app/api/health>. Debe responder:

```json
{ "status": "ok", "supabase": { "configured": true, "reachable": true } }
```

Si `configured` es `false`, falta una variable en Vercel. Si `reachable` es
`false`, revisa la URL y la anon key.

---

## 4. Seguir el proyecto desde el celular **(tu)**

Dos caminos, complementarios:

**Claude en el navegador del celular** — <https://claude.ai/code>.
Ahi ves esta sesion y puedes abrir sesiones nuevas sobre el repo `UDM`. Cada
sesion clona el repo, trabaja en una rama y sube los cambios a GitHub. Es la
via para pedir cambios estando fuera de la computadora.

Para que funcione bien:
- GitHub conectado en <https://claude.ai/connect-github>
- La app de Claude instalada en el repo: <https://github.com/apps/claude/installations/select_target>

**App de Vercel** (iOS/Android) — te notifica de cada deploy y te deja ver
logs y previews desde el telefono.

Flujo tipico desde el celular: pides el cambio en Claude → se abre un PR →
Vercel publica un preview → lo revisas en el telefono → merge a `main`.

---

## 5. Opcional: Supabase CLI para migraciones versionadas

```bash
npm i -g supabase
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push          # aplica supabase/migrations/ al proyecto remoto
```

Con esto dejas de pegar SQL a mano: cada cambio de esquema es un archivo en el
repo y queda en el historial.

---

## Checklist

- [ ] Rama mergeada a `main`
- [ ] Proyecto de Supabase creado y migracion inicial ejecutada
- [ ] Proyecto de Vercel importado con las 4 variables de entorno
- [ ] `/api/health` responde `configured: true, reachable: true`
- [ ] GitHub conectado en Claude y app instalada en el repo
- [ ] App de Vercel instalada en el celular


---

## Estado actual (15 sep 2026)

| Pieza | Estado |
|---|---|
| GitHub `betogp-88/UDM`, rama `main` | listo |
| Vercel, proyecto `udm` | listo — <https://udm-ashy.vercel.app> |
| Supabase `udm-sofom` | creado y conectado |
| `/api/health` | `configured: true, reachable: true` |
| Migracion inicial (`profiles`) | **pendiente** |
| `NEXT_PUBLIC_SITE_URL` en Vercel | **pendiente** |
| Site URL en Supabase Auth | **pendiente** |

### Nota sobre las llaves de Supabase

El proyecto usa el formato nuevo de llaves. La equivalencia con los nombres
de las variables (que conservan el nombre clasico) es:

| Panel de Supabase | Variable |
|---|---|
| Publishable key (`sb_publishable_...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Secret key (`sb_secret_...`) | `SUPABASE_SERVICE_ROLE_KEY` |
