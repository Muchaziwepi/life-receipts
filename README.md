# Your life, in receipts

A frontend-only interactive story built for the WebRush hackathon ("Your Life, In Receipts"). It turns three
disconnected datasets into one long paper receipt: nine auto-detected life chapters, computed insights, and a
"Connect the dots" board that shows how separate moments relate to each other.

**Live site:** add your deployed link here
**Stack:** React + Vite, no backend, no database. All content is static JSON loaded at runtime.

## The idea

Three datasets with no shared owner — a Spotify listening history, a household expense log, and a set of card
transactions — are combined into one fictional life. The receipt shows that life as a story, not a table:

- **Story mode** scrolls through nine chapters detected automatically from listening patterns (volume, skip rate,
  artist diversity). Each chapter shows its most-played artists, money in and out, and a few of its most notable
  receipts.
- **Summer 2017** is the chapter the data points to as the climax: the loudest month on record, a trip, and a
  single day with 1,816 plays just nine days after the last trip payment.
- **Connect the dots** is a time map of around 320 receipts, linked by same-day proximity, shared theme (the same
  artist, the same category), or story arcs (a purchase that is part of a longer thread, like a two-wheeler bought
  in instalments). Search, filters, and "follow a story" buttons make the connections explorable, and a plain list
  underneath the map gives a keyboard- and screen-reader-friendly way through the same data.

## Data

Raw sources:
- Spotify listening history (streams, 2013–2024)
- A personal household transactions log (income and expenses)
- A card transactions dataset

All three were cleaned and merged offline into static JSON (see `public/data/`). Notable cleaning steps:
- ~8,760 duplicate card transaction rows were merged back into their originals using a shared transaction ID.
- Spotify's built-in "skipped" flag was unreliable for several years, so the forward-button field was used instead.
- Chapters are detected with a clustering pass over monthly listening volume, skip rate, and artist mix, not
  hand-picked.

The three datasets don't describe one real person; combining them into a single narrative is a deliberate creative
choice for the challenge, not a claim about one individual's life.

## Running it locally

```bash
npm install
npm run dev
```

Open the local address printed in the terminal (usually `http://localhost:5173`).

## Building for deployment

```bash
npm run build
```

This outputs a static site to `dist/`, which can be hosted on Vercel, Netlify, or GitHub Pages — no server required.

## Project structure

```
src/
  components/   Story.jsx, ChapterSection.jsx, ChapterNav.jsx, Hero.jsx,
                Patterns.jsx, FinePrint.jsx, Connections.jsx (the connect-the-dots board)
  lib/          data fetching and formatting helpers
public/
  data/         the generated, static JSON the app reads (chapters, moments, links, insights, meta)
```

## Accessibility and responsive design

- Skip-to-content link, visible focus states, and `prefers-reduced-motion` support.
- The connections map has a full keyboard- and screen-reader-navigable list alongside the visual graph.
- Layout adapts from phone to desktop; the chapter navigator moves from a bottom bar to a side rail at wider
  widths.

## Hackathon constraints

Built solo, frontend-only, within the WebRush time window. No backend, server, or database is used anywhere in
the app; all data is pre-computed and shipped as static files.
