# Your life, in receipts

A frontend-only story built from three datasets (music history, household money, card transactions).

## Run it

1. Install Node.js (nodejs.org, the LTS version).
2. Open this folder in VS Code, then open a terminal (Ctrl + `).
3. Run:

```bash
npm install
npm run dev
```

4. Open the address the terminal prints (usually http://localhost:5173).

## Deploy

```bash
npm run build
```

Upload the `dist` folder to Netlify, or connect the GitHub repo to Vercel with build command `npm run build` and output folder `dist`.

## Where things are

- `public/data/` the generated JSON (chapters, moments, links, insights, and more)
- `src/components/` the story: Hero, ChapterSection, ChapterNav, Patterns, FinePrint
- `src/index.css` all styling and design tokens (colours and fonts are at the top)
