# Lado — Bilingual Russian MVP

A polished, shareable demo for a Russian-language learning platform for bilingual children ages 3–6.

**Focus:** structured 20-minute live lessons + clear longitudinal progress for parents and teachers.

UI navigation is in English. Lesson content (targets, prompts, phrases) is in Russian.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Browser `localStorage` for demo persistence
- No backend, login, payments, or external AI

## Local development

```bash
cd bilingual-russian-mvp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo path

1. Dashboard → **Open Lana’s profile**
2. **View progress**
3. **Start lesson** (Clothes and colors)
4. Tap **Independent / With prompt / Not yet** on targets
5. **End lesson** → parent summary + home practice
6. **See updated progress** / **Lesson history**

Use **Reset demo** in the header to restore seed data.

## Production build

```bash
cd bilingual-russian-mvp
npm install
npm run build
```

This produces a static export in `bilingual-russian-mvp/out/` (ready for Vercel / any static host).

## Deploy to Vercel

### Fix for 404 on a Git-linked project

If the deployment shows **404**, the project is building the empty repo root instead of the app.

**Do one of these:**

1. **Preferred:** Vercel → Project Settings → General → **Root Directory** = `bilingual-russian-mvp` → Redeploy  
2. **Or:** use the repo-root `vercel.json` (already in this PR), which builds `bilingual-russian-mvp` and publishes `bilingual-russian-mvp/out`

### Option A — Vercel CLI (from the app folder)

```bash
cd bilingual-russian-mvp
npm install -g vercel
vercel
```

For production:

```bash
vercel --prod
```

### Option B — Vercel dashboard

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import `Annalovestech/Greenstand`
3. Set **Root Directory** to `bilingual-russian-mvp`
4. Framework: leave auto (or set to Other / static — this app uses `output: "export"`)
5. Build Command: `npm run build`
6. Output Directory: `out`
7. Install Command: `npm install`
8. Deploy

No environment variables are required for this MVP.

## Project structure

```
bilingual-russian-mvp/
  src/app/                  # Routes (dashboard, profile, progress, lesson, summary, history)
  src/components/           # Shared UI
  src/lib/                  # Types, demo data, localStorage, progress rules, context
```

## Notes

- Progress updates after a lesson use rule-based logic from observation taps (independent / prompted / not yet).
- Data persists in `localStorage` under key `lado-bilingual-mvp-v1`.
