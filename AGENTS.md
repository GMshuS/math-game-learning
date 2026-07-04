# AGENTS.md

## Working directory

All app code and commands live in `game-learning/`.

## Commands

```bash
npm install       # install deps
npm run dev       # dev server on :3000, auto-opens browser
npm run build     # production build → dist/
npm run preview   # preview build locally
```

No test runner, linter, or formatter is configured yet.

## Stack

- **Vue 3** (Composition API, `<script setup>`) + **Vite 5**
- **Phaser.js 3** (game engine, listed in devDependencies but used at runtime)
- **Pinia** (state management)
- **LocalStorage** (save data)
- Plain JavaScript (`"type": "module"`), no TypeScript

## Architecture

### Entrypoint
`src/main.js` → mounts `App.vue` → renders `components/GameApp.vue`
`GameApp.vue` conditionally shows ~20 sub-views via `currentView` ref string (menu → adventure → levelSelect → battle → shop → cashier → challenge → ...).

### Phaser integration
Phaser is **not** a standalone game; it runs inside Vue wrapper components that each create their own `Phaser.Game`:
- `BattleGame.vue` → `src/scenes/BattleScene.js` (key: `'BattleScene'`)
- `AdventureMap.vue` → `src/scenes/WorldMapScene.js` (key: `'WorldMapScene'`)

<!-- `src/config/phaser.js` was historically referenced but has been removed (unused by any component). -->

### State
- `src/store/` — 15 Pinia stores, one per domain. All stores follow a **save-on-write** pattern: every mutation calls `storageManager.saveGame(...)` immediately.
- `src/models/` — 5 model classes (Player, GameProgress, Inventory, Settings, Character) with `toStorage()`/`fromStorage()` for serialization.

### Storage
- `src/utils/storage.js` — `StorageManager` singleton wrapping `localStorage` with keys prefixed `math_game_*`.
- Versioning system (`VERSION = '3.0.0'`): old-version saves are automatically wiped.

### Question system
- `src/utils/questionGenerator.js` — main entry point. Delegates to `src/questions/` modules (addition, subtraction, multiplication, division, fraction, decimal, percentage, equation, estimate, numberFill, wordProblem, mixed) via a registry pattern (`src/questions/registry.js`).
- `src/utils/questionBank.js` exists with overlapping logic — noted as a TODO to consolidate.

### Static data
`src/config/` — 24 files: grades, monsters, achievements, shop, equipment, adventure, audio, questionTypes, difficultyScale, cards, etc.

### Build
- `vite.config.js` — dev config (`base: './'`, port 3000, GitHub Pages compatible)
- `vite.optimized.config.js` — production config with code splitting (vendor/phaser chunks), terser minification, no sourcemaps, no console.log
- `dev` → `vite.config.js`, `build` → `vite.config.js` (switch to `vite.optimized.config.js` manually if needed)

## OpenSpec

This repo uses OpenSpec via `.opencode/skills/openspec-*` skills. Changes flow through the experimental artifact workflow. Use `openspec-*` skills to propose, apply, verify, and archive changes.

## Conventions

- UI text and README are in Chinese (zh-CN)
- No `.env` loading convention; config lives in `src/config/*.js`
- Responsive design for PC + mobile
- `Phaser.Scale.FIT` + `CENTER_BOTH` for responsive canvas
- Audio volumes stored as 0–1 floats; UI displays as 0–100 percentages (conversion at store/export boundaries)
