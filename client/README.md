# TicTacToang client

React 19 + Vite + Zustand + Tailwind CSS 4. The game itself (modes, rules, API) is described in the root `README.md`;
the client's structure is in `docs/ARCHITECTURE.md` and `docs/PAGES.md`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:8000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build (no compression or long cache headers, unlike the real host) |
| `npm run lint` | ESLint (the project is kept at zero problems) |
| `npm run icons:update` | Rebuilds the trimmed icon font; run it after adding or renaming a Material Symbols icon |

## Configuration

`VITE_API_URL` is the backend **origin only** (for example `http://localhost:5000`). Do not add `/api/v1` or a socket path.
It defaults to `http://localhost:5000`.

## Things worth knowing

- **Icons:** the app ships a Material Symbols font that contains only the icons it uses (about 25 KB instead of 1.1 MB).
  An icon missing from it shows up as its raw name (for example the text `chat_bubble_outline`). Run `npm run icons:update`.
- **Fonts:** self-hosted in `src/assets/fonts` and declared in `src/fonts.css`; there are no Google Fonts requests.
- **Media size:** keep files in `public/` small. The welcome page's hero video is about 0.35 MB; see `public/videos/README.md`
  before replacing it.
- **Tailwind:** v4, configured in `src/index.css` (`@theme`). There is no `tailwind.config.js`.
