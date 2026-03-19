# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Obsidian-Excalidraw is a plugin for [Obsidian.md](https://obsidian.md) that integrates the Excalidraw drawing tool. It stores drawings as markdown files with embedded JSON scene data, supporting links, transclusions, LaTeX, PDF embeds, image caching, and a scripting engine. Author: Zsolt Viczian.

## Build Commands

```bash
npm run dev          # Development build (rollup, unminified, inline sourcemaps)
npm run build        # Production build (rollup, minified, no sourcemaps)
npm run build:mathjax # Build the MathjaxToSVG sub-package first
npm run build:all    # Build MathjaxToSVG + main plugin (full production build)
npm run dev:all      # Build MathjaxToSVG + main plugin (full dev build)
npm run lib          # Build the ExcalidrawAutomate library export (lib/ folder)
npm run code:fix     # ESLint autofix (extends @excalidraw/eslint-config)
npm run madge        # Check for circular dependencies
```

Output goes to `dist/` (main.js + styles.css + manifest.json). There are no test scripts — the project has no automated test suite.

## Build System Quirks

The rollup config does unusual things you need to understand:

- **Package inlining**: React, ReactDOM, and the Excalidraw library are read from `node_modules` at build time, minified/compressed with LZString, and injected as string literals into `main.js` via `rollup-plugin-postprocess`. They are NOT bundled normally — they are eval'd at runtime.
- **JSX runtime shim**: A React 19 compatibility shim is injected to provide `jsx`/`jsxs` runtime functions since the Excalidraw package targets React 19 but the plugin uses React 18.
- **Language compression**: Non-English locale files (ru, zh-cn, zh-tw, es) are compressed with LZString at build time and decompressed at runtime.
- **CSS merging**: Excalidraw's CSS and `styles.css` are merged and minified via cssnano into `dist/styles.css`.
- **MathjaxToSVG**: A separate sub-package in `MathjaxToSVG/` that must be built before the main build if LaTeX support code has changed.
- **Globals injected by rollup**: `PLUGIN_VERSION`, `INITIAL_TIMESTAMP`, `REACT_PACKAGES`, `PLUGIN_LANGUAGES`, `unpackExcalidraw`, `react`, `reactDOM`, `excalidrawLib` — these are declared but not imported in source; they exist only at runtime.

## Architecture

### Entry Points

- **Plugin entry**: `src/core/main.ts` — `ExcalidrawPlugin extends Plugin` (Obsidian plugin lifecycle)
- **Library entry**: `src/core/index.ts` — exports `getEA()` for external consumers of ExcalidrawAutomate
- **View**: `src/view/ExcalidrawView.ts` (~6700 lines) — `TextFileView` subclass that renders the Excalidraw React component

### Source Layout

```
src/
├── core/              # Plugin lifecycle, settings, managers
│   ├── main.ts        # ExcalidrawPlugin class (onload, onunload)
│   ├── settings.ts    # ExcalidrawSettings interface + ExcalidrawSettingTab (~3400 lines)
│   ├── editor/        # EditorHandler, Fadeout behavior
│   └── managers/      # Decomposed plugin responsibilities:
│       ├── CommandManager.ts       # Obsidian command palette registrations
│       ├── EventManager.ts         # Workspace/vault event handlers
│       ├── FileManager.ts          # File operations, isExcalidraw checks
│       ├── MarkdownPostProcessor.ts # Renders excalidraw embeds in reading view
│       ├── ObserverManager.ts      # MutationObserver management
│       ├── PackageManager.ts       # Runtime loading of React/Excalidraw packages
│       └── StylesManager.ts        # Dynamic CSS injection
├── view/              # ExcalidrawView + React components
│   ├── ExcalidrawView.ts    # Main view (handles scene, events, save/load)
│   ├── ExcalidrawLoading.ts # Loading screen / migration from markdown view
│   ├── components/          # React TSX components (menus, embeddables)
│   ├── managers/            # DropManager, CanvasNodeFactory
│   └── sidepanel/           # Sidepanel view implementation
├── shared/            # Core domain logic shared across view and plugin
│   ├── ExcalidrawAutomate.ts  # Public scripting API (~4000 lines)
│   ├── ExcalidrawData.ts      # Parse/serialize excalidraw markdown format
│   ├── EmbeddedFileLoader.ts  # Load images, PDFs, markdown embeds
│   ├── ExcalidrawConfig.ts    # Runtime config derived from settings
│   ├── ImageCache.ts          # Singleton image cache
│   ├── LaTeX.ts               # LaTeX equation rendering via MathJax
│   ├── Scripts.ts             # Script Engine (user automation scripts)
│   ├── Frontmatter.ts         # Frontmatter parsing for excalidraw files
│   ├── Dialogs/               # Modal dialogs (export, insert, prompts, etc.)
│   ├── Suggesters/            # Autocomplete suggesters for links/files
│   └── svgToExcalidraw/       # SVG import conversion
├── utils/             # Pure-ish utility functions
│   ├── utils.ts               # General utilities (grab-bag)
│   ├── fileUtils.ts           # File I/O helpers
│   ├── obsidianUtils.ts       # Obsidian API wrappers
│   ├── excalidrawViewUtils.ts # View-related helpers
│   ├── sceneDataUtils.ts      # Scene data compression/linking
│   ├── pathUtils.ts           # Path parsing (block refs, section headings)
│   ├── debugHelper.ts         # Debug logging, CustomMutationObserver
│   └── ...                    # Many specialized util files
├── constants/         # Constants, icons, settings tags
├── lang/              # i18n (en.ts is the source of truth, others are translations)
└── types/             # TypeScript type definitions and declarations
```

### Key Abstractions

- **ExcalidrawData** (`shared/ExcalidrawData.ts`): Parses the markdown file format. Excalidraw drawings are stored as `.md` files with frontmatter + a `# Excalidraw Data` section containing JSON scene data (optionally LZString-compressed). Text elements, element links, and embedded file references are stored in separate markdown sections.
- **ExcalidrawAutomate** (`shared/ExcalidrawAutomate.ts`): The public scripting API exposed as `window.ExcalidrawAutomate`. Used by user scripts in the Script Engine and by external plugins.
- **PackageManager** (`core/managers/PackageManager.ts`): Manages per-window React/Excalidraw package instances. Packages are eval'd from compressed strings at startup, not imported normally.
- **EmbeddedFileLoader** (`shared/EmbeddedFileLoader.ts`): Resolves and loads images, PDFs, markdown files, and URLs embedded in drawings.
- **TextMode**: Drawings have two modes — `parsed` (renders markdown links/transclusions) and `raw` (shows original markup). Controlled by frontmatter `excalidraw-plugin: parsed|raw`.

### Dependencies

- `@zsviczian/excalidraw` — Fork of Excalidraw maintained by the plugin author
- `obsidian` — Obsidian API (devDependency, provided at runtime)
- React 18 + ReactDOM (inlined at build time, not imported at runtime)
- `mathjax-full` — LaTeX rendering (built separately in MathjaxToSVG/)

### Conventions

- Imports use `src/` path prefix (configured via `baseUrl: "."` in tsconfig)
- ESLint extends `@excalidraw/eslint-config` with Prettier integration
- TSX is used only for React components in `src/view/components/` and `src/constants/actionIcons.tsx`
- The `DEVICE` global tracks platform capabilities (mobile, iPad, etc.)
- `t()` function from `src/lang/helpers.ts` is used for all user-facing strings (i18n)
- `ea-scripts/` contains community automation scripts (markdown + SVG pairs) — not part of the build
