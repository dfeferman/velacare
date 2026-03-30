# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains the Next.js App Router pages and layouts, including public routes such as `produkte/`, funnel steps under `beantragen/`, and dashboard areas under `admin/` and `konto/`. Reusable UI lives in `src/components`, grouped by domain (`landing`, `funnel`, `box-konfigurator`, `layout`, `ui`). Shared mock data and types are in `src/lib`. Reference material belongs in `docs/`, export utilities in `scripts/`, and visual source material in `wireframes/`.

## Build, Test, and Development Commands
Run `npm install` once to restore dependencies. Use `npm run dev` to start the local app on `http://localhost:3001`. Use `npm run build` to create a production build, `npm run start` to serve that build, and `npm run lint` to run the project ESLint rules. Use `npm run stitch:wireframes` only when updating exported wireframe assets from `scripts/export-stitch-wireframes.mjs`.

## Coding Style & Naming Conventions
The codebase is TypeScript-first and uses the App Router plus Tailwind CSS. Follow the existing style: 2-space indentation, single quotes, semicolons omitted, and small functional React components. Use `PascalCase` for component files such as `LandingHero`, `kebab-case` for shared UI filenames such as `progress-bar.tsx`, and keep route folders aligned with user-facing URLs, which are currently German. Prefer the `@/` import alias over long relative paths.

## Testing Guidelines
There is no automated test suite configured yet. Until one is introduced, treat `npm run lint` and `npm run build` as the minimum validation before opening a PR. For any new non-trivial logic added to `src/lib` or interactive components, include a short manual test note in the PR describing the route, inputs, and expected result.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:` and `fix:` with concise, imperative subjects. Keep commits focused and descriptive, for example `feat: redesign beantragen step 2 sidebar`. PRs should include a brief summary, linked issue if available, affected routes, and screenshots for UI changes. Call out any content updates in `docs/` or `wireframes/` so reviewers can verify source alignment.

## Content & Asset Notes
This repository includes German copy and wireframe-driven pages. Preserve route names and content language unless the task explicitly requires a localization change. When updating visuals, keep Tailwind theme tokens in `tailwind.config.ts` and the supporting docs in sync.
