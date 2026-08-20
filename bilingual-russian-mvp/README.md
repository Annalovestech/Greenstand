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
npm start
```

## Deploy to Vercel

### Option A — Vercel CLI

```bash
cd bilingual-russian-mvp
npm install -g vercel
vercel
```

Follow the prompts. For production:

```bash
vercel --prod
```

### Option B — Vercel dashboard

1. Push this repo to GitHub.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Set **Root Directory** to `bilingual-russian-mvp`.
5. Framework Preset: **Next.js** (auto-detected).
6. Build Command: `npm run build`
7. Output Directory: leave default (`.next`).
8. Install Command: `npm install`
9. Click **Deploy**.

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
