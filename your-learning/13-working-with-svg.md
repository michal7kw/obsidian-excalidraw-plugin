# Working with SVG in the Obsidian-Excalidraw Plugin

This guide provides a comprehensive look at how SVG (Scalable Vector Graphics) permeates every layer of the Obsidian-Excalidraw plugin -- from export and embedding, to color mapping, import conversion, PDF generation, and scripting. All code references point to actual source files in the repository.

---

## Table of Contents

1. [SVG in the Excalidraw Ecosystem -- Overview](#part-1-svg-in-the-excalidraw-ecosystem--overview)
2. [SVG Export](#part-2-svg-export)
3. [SVG Embedding in Markdown](#part-3-svg-embedding-in-markdown)
4. [SVG Color Mapping and Theme Awareness](#part-4-svg-color-mapping--theme-awareness)
5. [SVG Import -- Converting SVG to Excalidraw Elements](#part-5-svg-import--converting-svg-to-excalidraw-elements)
6. [SVG Generation Under the Hood](#part-6-svg-generation-under-the-hood)
7. [Working with SVG in Scripts](#part-7-working-with-svg-in-scripts)
8. [SVG Manipulation Techniques](#part-8-svg-manipulation-techniques)
9. [SVG and PDF Export](#part-9-svg-and-pdf-export)
10. [Hybrid Markdown-Excalidraw Notes](#part-10-hybrid-markdown-excalidraw-notes)
11. [Troubleshooting SVG Issues](#part-11-troubleshooting-svg-issues)

---

## Part 1: SVG in the Excalidraw Ecosystem -- Overview

### The Many Roles of SVG

SVG is not a secondary format in the Excalidraw plugin; it is the central representation that bridges the gap between Excalidraw's internal scene model and the outside world. SVG surfaces in at least seven distinct roles:

1. **Export format** -- Drawings can be exported as `.svg` files, either manually through the command palette or automatically via the auto-export system. The exported SVG faithfully reproduces the drawing with vector precision.

2. **Reading mode preview** -- When an Excalidraw file is embedded in a markdown note (`![[drawing.excalidraw]]`), the plugin generates an SVG (or PNG, depending on settings) and injects it into the reading view DOM. This is handled by the `MarkdownPostProcessor` in `src/core/managers/MarkdownPostProcessor.ts`.

3. **Embedded image format** -- When one Excalidraw drawing is embedded inside another, the inner drawing is rendered to SVG (via `getExcalidrawSVG()` in `src/shared/EmbeddedFileLoader.ts`), converted to a base64 data URL, and loaded as an image element.

4. **Markdown-to-SVG conversion** -- When a markdown file is embedded inside an Excalidraw drawing, the markdown content is rendered into an SVG using `foreignObject` elements. This is the `convertMarkdownToSVG()` method in `EmbeddedFilesLoader`.

5. **SVG import** -- External SVG files can be imported and converted into native Excalidraw elements (rectangles, ellipses, lines, paths) using the `svgToExcalidraw` module at `src/shared/svgToExcalidraw/`.

6. **Color mapping substrate** -- SVG's structured XML format makes it possible to systematically replace colors in embedded SVG and Excalidraw images via the `replaceSVGColors()` function, enabling theme-aware rendering and creative recoloring.

7. **PDF export intermediate** -- PDF export works by first generating SVG representations of each frame or the entire drawing, then tiling those SVGs onto page-sized `<div>` elements for Chromium's print-to-PDF pipeline. See `src/utils/exportUtils.ts`.

### SVG vs. PNG -- A Complete Comparison

| Aspect | SVG | PNG |
|--------|-----|-----|
| **Rendering type** | Vector -- scales perfectly to any resolution | Raster -- fixed pixel grid, blurs when scaled up |
| **Block references** | Full support for area, group, frame, clipped-frame, and section references via viewBox manipulation | Limited support -- group and frame references work, but area/section references cannot crop the raster image via viewBox |
| **Working links** | Native SVG mode preserves clickable links on elements (links are `<a>` elements in the SVG DOM) | Links are not interactive in a raster image |
| **File size** | Typically smaller for drawings dominated by shapes and text; can be large if many embedded bitmaps are present | Typically smaller for photo-heavy drawings; can be very large at high scale factors |
| **Performance** | Excellent for simple drawings; can be slow for very complex scenes with thousands of elements due to DOM overhead | Faster for complex drawings because the browser only needs to paint a single `<img>` element |
| **Compatibility** | Excellent in modern browsers, Obsidian's reading view, and web contexts; some email clients and older tools may not render SVG correctly | Universal -- works everywhere images are supported |
| **Theme awareness** | SVGs with embedded bitmaps (`hasSVGwithBitmap`) get separate light/dark variants with CSS filters applied to bitmap portions | PNG is a single raster; the plugin generates separate light/dark PNGs when needed |
| **Editability** | The SVG structure can be inspected, modified, or styled with CSS after export | Not editable after rasterization |
| **Font embedding** | Fonts can be inlined as base64 `@font-face` definitions; controlled by the `skipInliningFonts` export setting | Fonts are rasterized into the image -- no embedding needed, but also no editability |

### The Three Preview Modes in Markdown

The plugin offers three distinct modes for rendering Excalidraw previews in reading view. The mode is configured globally in plugin settings and stored as a `PreviewImageType` enum (defined in `src/types/utilTypes.ts`):

```typescript
export enum PreviewImageType {
  PNG = "PNG",      // Render as <img> with PNG data URL
  SVGIMG = "SVGIMG", // Render as <img> with SVG data URL (SVG-as-image)
  SVG = "SVG"       // Render as native <svg> element in the DOM
}
```

1. **Native SVG (`PreviewImageType.SVG`)** -- The SVG is inserted directly into the DOM as an `<svg>` element inside a `<div>`. This mode preserves clickable links and allows CSS styling. The `_getSVGNative()` function in `MarkdownPostProcessor.ts` handles this path.

2. **SVG Image (`PreviewImageType.SVGIMG`)** -- The SVG is serialized, converted to a blob URL, and placed as the `src` of an `<img>` element. Links are not clickable. The `_getSVGIMG()` function handles this path. This is a good middle ground: vector quality without the DOM overhead of native SVG.

3. **PNG Image (`PreviewImageType.PNG`)** -- The drawing is rasterized to PNG using the Excalidraw library's `exportToBlob()`. The scale factor is automatically determined based on the display width (1x for widths under 600px, up to 5x for widths over 2400px). The `_getPNG()` function handles this path.

---

## Part 2: SVG Export

### Auto-Export Configuration

Auto-export is a powerful feature that automatically generates SVG and/or PNG files whenever an Excalidraw drawing is saved. This keeps image files in sync with their source drawings.

#### Global Plugin Settings

In the plugin settings, you can enable auto-export for all drawings:

- **Auto-export SVG** (`autoexportSVG`) -- When enabled, a `.svg` file is created alongside every Excalidraw drawing and updated on each save.
- **Auto-export PNG** (`autoexportPNG`) -- Same behavior for `.png` files.
- These settings serve as defaults and can be overridden at the file level.

#### Per-File Override via Frontmatter

Individual files can override the global setting using the `excalidraw-autoexport` frontmatter property (defined in `FRONTMATTER_KEYS` at `src/constants/constants.ts`, line 262):

```yaml
---
excalidraw-plugin: parsed
excalidraw-autoexport: svg
---
```

Valid values:

| Value | Behavior |
|-------|----------|
| `svg` | Export SVG only |
| `png` | Export PNG only |
| `both` | Export both SVG and PNG |
| `none` | Disable auto-export for this file |
| (omitted) | Inherit the global plugin setting |

The parsing of this property happens in `ExcalidrawData.setAutoexportPreferences()` at `src/shared/ExcalidrawData.ts` (around line 1956), which maps the string to the `AutoexportPreference` enum:

```typescript
export enum AutoexportPreference {
  none,
  both,
  png,
  svg,
  inherit
}
```

The actual auto-export decision logic lives in `ExcalidrawView.ts` (around line 960):

```typescript
const autoexportPreference = this.excalidrawData.autoexportPreference;
const autoexportConfig = {
  svg: (autoexportPreference === AutoexportPreference.inherit && this.plugin.settings.autoexportSVG) ||
    autoexportPreference === AutoexportPreference.both || autoexportPreference === AutoexportPreference.svg,
  png: (autoexportPreference === AutoexportPreference.inherit && this.plugin.settings.autoexportPNG) ||
    autoexportPreference === AutoexportPreference.both || autoexportPreference === AutoexportPreference.png,
};
```

#### Export Location and Filename Sync

By default, auto-exported files are placed in the same folder as the drawing. The exported filename mirrors the drawing filename with the appropriate extension:

- `MyDrawing.excalidraw.md` produces `MyDrawing.svg` and/or `MyDrawing.png`

When a drawing is renamed, the exported files are renamed to match. When a drawing is deleted, the exported files are deleted. This synchronization is managed by the `FileManager` (`src/core/managers/FileManager.ts`).

#### Dark and Light Theme Variants

Auto-export respects the theme setting. You can control whether exports use dark or light mode with the `excalidraw-export-dark` frontmatter property.

#### The `onTriggerAutoexportHook`

For advanced automation, the scripting API provides a hook that fires during auto-export. This allows scripts to modify the export configuration dynamically (defined at `src/shared/ExcalidrawAutomate.ts`, around line 3403):

```typescript
onTriggerAutoexportHook: (data: {
  autoexportConfig: AutoexportConfig;
  excalidrawFile: TFile;
}) => AutoexportConfig | null = null;
```

The `AutoexportConfig` interface (from `src/types/excalidrawViewTypes.ts`):

```typescript
interface AutoexportConfig {
  png: boolean;
  svg: boolean;
  excalidraw: boolean;
  theme: "light" | "dark" | "both";
}
```

### Manual Export

#### Command Palette

The plugin registers commands for manual export via the `CommandManager` (`src/core/managers/CommandManager.ts`). Available commands include:

- Export drawing as SVG
- Export drawing as PNG
- Export drawing as PDF
- Copy SVG to clipboard
- Copy PNG to clipboard

#### Script-Based Export

The `ExcalidrawAutomate` class provides methods for programmatic export:

- `ea.createSVG()` -- Creates an SVG from EA workbench elements
- `ea.createViewSVG()` -- Creates an SVG from the current view
- `ea.createPNG()` -- Creates a PNG blob from EA workbench elements
- `ea.createPNGBase64()` -- Creates a base64-encoded PNG string
- `ea.createPDF()` -- Creates a PDF from SVG elements

### Export Settings via Frontmatter

The following frontmatter properties control export behavior (all defined in `FRONTMATTER_KEYS` at `src/constants/constants.ts`, lines 242-267):

| Frontmatter Key | Type | Description |
|-----------------|------|-------------|
| `excalidraw-export-transparent` | checkbox | Transparent background (removes `viewBackgroundColor`) |
| `excalidraw-export-dark` | checkbox | Force dark mode in export |
| `excalidraw-export-padding` | number | Padding in pixels around the exported content |
| `excalidraw-export-pngscale` | number | Scale factor for PNG export (1-5) |
| `excalidraw-export-embed-scene` | checkbox | Embed the full Excalidraw scene JSON in the exported image |
| `excalidraw-export-internal-links` | checkbox | Include internal Obsidian links in the export |
| `excalidraw-mask` | checkbox | Treat the drawing as a mask (crop image) |

Example frontmatter with export overrides:

```yaml
---
excalidraw-plugin: parsed
excalidraw-export-transparent: true
excalidraw-export-dark: false
excalidraw-export-padding: 20
excalidraw-export-pngscale: 3
excalidraw-autoexport: svg
---
```

### Export via the EA Scripting API

#### `ea.createViewSVG()` -- Export Current View

This method creates an SVG from the currently open Excalidraw view. It is defined at `src/shared/ExcalidrawAutomate.ts` (line 1320):

```javascript
const svg = await ea.createViewSVG({
  withBackground: true,       // Include background color
  theme: "light",             // "light" or "dark"
  frameRendering: {           // Control frame rendering
    enabled: true,
    name: true,
    outline: true,
    clip: true,
  },
  padding: 10,                // Padding in pixels
  selectedOnly: false,        // Export only selected elements
  skipInliningFonts: false,   // Skip embedding fonts (reduces size)
  embedScene: false,          // Embed scene JSON in SVG
  elementsOverride: null,     // Override elements array
});
```

Under the hood, `createViewSVG()` calls the `getSVG()` utility function from `src/utils/utils.ts` (line 331), which in turn calls the Excalidraw library's `exportToSvg()`.

#### `ea.createSVG()` -- Export from EA Workbench

This method creates an SVG from elements in the ExcalidrawAutomate workbench. It is defined at line 1389:

```javascript
const svg = await ea.createSVG(
  templatePath,     // Optional template file path
  embedFont,        // Whether to embed fonts (boolean)
  exportSettings,   // ExportSettings object
  loader,           // EmbeddedFilesLoader (optional)
  theme,            // "light" or "dark"
  padding,          // Padding in pixels
  convertMarkdownLinksToObsidianURLs, // Convert [[links]] to obsidian:// URLs
  includeInternalLinks,               // Include internal link markers
);
```

The `ExportSettings` interface (from `src/types/exportUtilTypes.ts`):

```typescript
export interface ExportSettings {
  withBackground: boolean;
  withTheme: boolean;
  isMask: boolean;
  frameRendering?: FrameRenderingOptions;
  skipInliningFonts?: boolean;
}
```

---

## Part 3: SVG Embedding in Markdown

### Basic Embedding

The simplest way to embed an Excalidraw drawing in a markdown note:

```markdown
![[drawing.excalidraw]]
```

This triggers the `MarkdownPostProcessor` (`src/core/managers/MarkdownPostProcessor.ts`), which detects that the embedded file is an Excalidraw file and replaces the default embed with an SVG or PNG preview based on the `previewImageType` setting.

### Sizing

Control the display size of the embedded drawing using Obsidian's standard image sizing syntax:

```markdown
![[drawing.excalidraw|400]]        <!-- Width only -->
![[drawing.excalidraw|400x300]]    <!-- Width x Height -->
![[drawing.excalidraw|x300]]       <!-- Height only -->
```

The parsing of dimensions happens in the `parseAlias()` and `getDimensionsFromAliasString()` functions in `MarkdownPostProcessor.ts` (lines 628-722). These functions handle complex alias formats:

```markdown
![[drawing.excalidraw|My Alias|400]]           <!-- Alias + width -->
![[drawing.excalidraw|400|my-css-class]]       <!-- Width + CSS class -->
![[drawing.excalidraw|My Alias|400x300|style]] <!-- Alias + dimensions + CSS class -->
```

### Image Block References

One of the most powerful features of the Excalidraw plugin is the ability to reference specific parts of a drawing. These block references work by manipulating the SVG `viewBox` to crop the output to the referenced element(s).

The reference types are parsed by `getEmbeddedFilenameParts()` in `src/utils/utils.ts` (line 905) and stored in the `FILENAMEPARTS` type (from `src/types/utilTypes.ts`):

```typescript
export type FILENAMEPARTS = {
  filepath: string,
  hasBlockref: boolean,
  hasGroupref: boolean,
  hasTaskbone: boolean,
  hasArearef: boolean,
  hasFrameref: boolean,
  hasClippedFrameref: boolean,
  hasSectionref: boolean,
  blockref: string,
  sectionref: string,
  linkpartReference: string,
  linkpartAlias: string
};
```

#### Area Reference

Crops the SVG to show only the bounding box of a specific element:

```markdown
![[drawing.excalidraw#^area=elementId]]
```

The area reference works by finding the referenced element, computing its bounding box, then adjusting the SVG's `viewBox` to show only that area. This happens in the `createSVG()` function in `src/utils/excalidrawAutomateUtils.ts` (lines 582-612).

#### Group Reference

Shows a group of elements (elements sharing the same `groupId`):

```markdown
![[drawing.excalidraw#^group=elementId]]
```

When a group reference is detected, the `createSVG()` function passes the group reference through to the template loading process, which filters elements to those in the specified group.

#### Frame Reference

Shows the contents of a named frame:

```markdown
![[drawing.excalidraw#^frame=frameIdOrName]]
```

Frame references use the Excalidraw library's frame rendering capabilities. The frame content is exported with frame rendering enabled.

#### Clipped Frame Reference

Same as frame reference but clips content to the frame boundary:

```markdown
![[drawing.excalidraw#^clippedframe=frameIdOrName]]
```

When a clipped frame reference is detected, the export settings are modified to enable clipping:

```typescript
{ ...exportSettings, frameRendering: { enabled: true, name: false, outline: false, clip: true } }
```

This pattern appears in multiple places: `MarkdownPostProcessor.ts` (lines 121-126, 227-228, 283-284) and `EmbeddedFileLoader.ts` (lines 406-407).

### How to Get Element IDs

To create block references, you need the element ID. In Excalidraw:

1. Select an element or group of elements.
2. Use the "Copy Markdown Link" button in the toolbar.
3. The plugin generates a markdown link with the appropriate reference: `![[drawing.excalidraw#^area=AbCdEfGh]]`
4. Different modifier keys (Shift, Ctrl, Alt) produce different reference types (area, group, frame).

### Force Image Rendering with Phantom Block Reference

If you want to force Excalidraw to render as an image (rather than as embedded markdown text) when using block references, use the special `as-image` phantom reference:

```markdown
![[drawing.excalidraw#^as-image]]
```

The `isTextOnlyEmbed()` function in `MarkdownPostProcessor.ts` (line 740) checks for this:

```typescript
const isTextOnlyEmbed = (internalEmbedEl: Element): boolean => {
  const fnameParts = getEmbeddedFilenameParts(src);
  return !(fnameParts.hasArearef || fnameParts.hasGroupref || fnameParts.hasFrameref || fnameParts.hasClippedFrameref) &&
    (fnameParts.hasBlockref || fnameParts.hasSectionref) && fnameParts.blockref !== "as-image"
}
```

When the block ref is `as-image`, the function returns `false`, meaning the embed will be treated as an image rather than text.

### The `excalidraw-embed-md` Property

When a drawing has the frontmatter property `excalidraw-embed-md: true`, embedding the file in another note will show the markdown content of the Excalidraw file rather than the drawing image. This is checked in the `tmpObsidianWYSIWYG` function (line 760):

```typescript
if(ctx.frontmatter?.["excalidraw-embed-md"]) {
  return;
}
```

---

## Part 4: SVG Color Mapping & Theme Awareness

### How SVG Recoloring Works Under the Hood

The color mapping system is one of the most sophisticated features of the plugin. It allows systematic replacement of colors in embedded SVG and Excalidraw files, enabling theme-aware rendering and creative recoloring.

#### The `replaceSVGColors()` Function

The core color replacement logic lives in `src/shared/EmbeddedFileLoader.ts` (lines 61-120). This function handles two input types: SVG DOM elements and SVG strings.

```typescript
const replaceSVGColors = (
  svg: SVGSVGElement | string,
  colorMap: ColorMap | null
): SVGSVGElement | string => {
  if(!colorMap) return svg;
  // ...
}
```

The `ColorMap` type is a simple dictionary mapping source colors to target colors:

```typescript
// From src/types/embeddedFileLoaderTypes.ts
type ColorMap = { [color: string]: string };
```

**For string-based SVGs**, the function uses regex replacement:

1. Special keys `"stroke"` and `"fill"` are handled first -- these set the root `<svg>` element's stroke/fill attributes directly.
2. For all other color entries, four regex patterns are applied:
   - `fill="oldColor"` is replaced with `fill="newColor"`
   - `fill:oldColor` (in CSS style attributes) is replaced with `fill:newColor`
   - `stroke="oldColor"` is replaced with `stroke="newColor"`
   - `stroke:oldColor` (in CSS style attributes) is replaced with `stroke:newColor`

**For DOM-based SVGs**, the function recursively walks all child nodes:

```typescript
const childNodes = (node: ChildNode) => {
  if (node instanceof SVGElement) {
    const oldFill = node.getAttribute('fill')?.toLocaleLowerCase();
    const oldStroke = node.getAttribute('stroke')?.toLocaleLowerCase();
    if (oldFill && colorMap[oldFill]) {
      node.setAttribute('fill', colorMap[oldFill]);
    }
    if (oldStroke && colorMap[oldStroke]) {
      node.setAttribute('stroke', colorMap[oldStroke]);
    }
  }
  for(const child of node.childNodes) {
    childNodes(child);
  }
}
```

#### Color Maps in Link Parameters

Color maps are stored as JSON in the link alias when embedding an image in Excalidraw. The `EmbeddedFile` constructor parses this (line 141-150):

```typescript
constructor(plugin, hostPath, imgPath, colorMapJSON?) {
  this.resetImage(hostPath, imgPath);
  if(this.file && (this.plugin.isExcalidrawFile(this.file) || this.file.extension.toLowerCase() === "svg")) {
    try {
      this.colorMap = colorMapJSON ? JSON.parse(colorMapJSON.toLocaleLowerCase()) : null;
    } catch (error) {
      this.colorMap = null;
    }
  }
}
```

Note that color maps are only applied to SVG files and nested Excalidraw files -- not to raster images.

#### The Color Map Application Pipeline

When an embedded Excalidraw file is rendered as SVG inside another drawing, the color map is applied after SVG creation in `getExcalidrawSVG()` (line 396-419):

```typescript
const svg = replaceSVGColors(
  await createSVG(/* ... */),
  inFile instanceof EmbeddedFile ? inFile.colorMap : null
) as SVGSVGElement;
```

When a plain SVG file is loaded, the color map is applied during data URL generation in `getSVGData()` (line 1220-1223):

```typescript
const getSVGData = async (app, file, colorMap) => {
  const svgString = replaceSVGColors(await app.vault.read(file), colorMap) as string;
  return svgToBase64(svgString) as DataURL;
};
```

### The `SVGColorInfo` Type

For programmatic color manipulation, the plugin uses a richer type that tracks both the original colors and their mappings:

```typescript
// From src/types/excalidrawAutomateTypes.ts
export type SVGColorInfo = Map<string, {
  mappedTo: string;
  fill: boolean;
  stroke: boolean;
}>;
```

Each entry in the map represents a color found in the SVG, with flags indicating whether it appears as a fill, stroke, or both, and a `mappedTo` field indicating what color it should be replaced with.

### Extracting Colors from SVGs

The `getColorsFromSVGString()` method on `ExcalidrawAutomate` (line 2920) parses an SVG string and extracts all colors used as fills and strokes:

```javascript
const svgColors = ea.getColorsFromSVGString(svgString);
// Returns SVGColorInfo: Map<string, {mappedTo, fill, stroke}>
```

For embedded image elements in the current view, use `getSVGColorInfoForImgElement()` (line 2851):

```javascript
const el = ea.getViewSelectedElements()[0]; // must be an image element
const colorInfo = await ea.getSVGColorInfoForImgElement(el);
```

This method works for both SVG files and nested Excalidraw files. For Excalidraw files, it loads the embedded file's scene data and extracts `strokeColor` and `backgroundColor` from all elements (via `getColosFromExcalidrawFile()` at line 2887).

### Helper Functions for Color Map Manipulation

Several utility functions in `src/utils/excalidrawAutomateUtils.ts` support color map operations:

- **`isSVGColorInfo(obj)`** (line 54) -- Type guard to distinguish `ColorMap` from `SVGColorInfo`
- **`mergeColorMapIntoSVGColorInfo(colorMap, svgColorInfo)`** (line 64) -- Merges an existing color map into SVGColorInfo, updating `mappedTo` values
- **`svgColorInfoToColorMap(svgColorInfo)`** (line 77) -- Converts SVGColorInfo back to a flat ColorMap for use in `replaceSVGColors()`
- **`filterColorMap(colorMap)`** (line 88) -- Removes identity mappings (where key equals value)
- **`updateOrAddSVGColorInfo(svgColorInfo, color, info)`** (line 94) -- Adds or updates a color entry in SVGColorInfo

### Theme-Aware SVG Generation

When an SVG contains embedded bitmap images (non-SVG images), the plugin detects this and generates separate light and dark variants. The detection happens in `getExcalidrawSVG()` (lines 422-452):

```typescript
// Check for non-SVG images in the SVG
const imageList = svg.querySelectorAll("image:not([href^='data:image/svg'])");
if (imageList.length > 0) {
  hasSVGwithBitmap = true;
}

// In dark mode, apply inversion filter to bitmaps
if (hasSVGwithBitmap && isDark && !Boolean(maybeSVG)) {
  imageList.forEach((i) => {
    const id = i.parentElement?.id;
    if (id.endsWith("-invert-bitmap")) return;
    svg.querySelectorAll(`use[href='#${id}']`).forEach((u) => {
      u.setAttribute("filter", THEME_FILTER);
    });
  });
}
```

The `THEME_FILTER` constant contains a CSS filter that inverts and adjusts hue to approximate dark mode rendering of light-mode bitmaps.

The `EmbeddedFile` class stores separate image data for light and dark modes:

```typescript
private img: string = "";         // base64 for light mode
private imgInverted: string = ""; // base64 for dark mode
```

The `hasSeparateDarkAndLightVersion` property (line 153) returns `true` when the SVG contains bitmaps, indicating that both variants should be maintained.

---

## Part 5: SVG Import -- Converting SVG to Excalidraw Elements

### The `svgToExcalidraw` Module

The SVG import functionality lives in `src/shared/svgToExcalidraw/`. This is an embedded copy of the `@excalidraw/svg-to-excalidraw` package (as noted in `src/shared/svgToExcalidraw/readme.md`), integrated directly into the codebase rather than imported as a dependency.

The module's architecture:

```
svgToExcalidraw/
  parser.ts         -- Entry point: svgToExcalidraw() function
  walker.ts         -- Tree walker that traverses SVG DOM
  attributes.ts     -- Maps SVG attributes to Excalidraw properties
  transform.ts      -- Handles SVG transform matrices (translate, rotate, scale, etc.)
  types.ts          -- Type definitions
  utils.ts          -- Utility functions (randomId, dimensionsFromPoints, etc.)
  elements/
    ExcalidrawElement.ts  -- Base element types and factory functions
    ExcalidrawScene.ts    -- Scene container
    Group.ts              -- Group handling
    index.ts              -- Re-exports
    path/
      index.ts            -- Path element handling
      utils/
        bezier.ts         -- Bezier curve utilities
        ellipse.ts        -- Ellipse path utilities
        path-to-points.ts -- Path command to point conversion
```

### The `svgToExcalidraw()` Function

The main entry point is in `src/shared/svgToExcalidraw/parser.ts`:

```typescript
export const svgToExcalidraw = (svgString: string): ConversionResult => {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");

  // Check for parsing errors
  const errorsElements = svgDOM.querySelectorAll("parsererror");
  const hasErrors = errorsElements.length > 0;

  if (!hasErrors) {
    const tw = createTreeWalker(svgDOM);
    const scene = new ExcalidrawScene();
    const groups: Group[] = [];
    walk({ tw, scene, groups, root: svgDOM }, tw.nextNode());

    // Fix opacity for elements
    const hasVisibleElements = Boolean(scene.elements.find((el) => el.opacity !== 0));
    if (!hasVisibleElements) {
      scene.elements.forEach((el) => { el.opacity = 100; });
    }
    scene.elements.forEach((el) => {
      if(el.opacity <= 1) el.opacity = 100;
    });

    content = scene.elements;
  }

  return { hasErrors, errors, content };
};
```

The return type:

```typescript
export type ConversionResult = {
  hasErrors: boolean;
  errors: string;
  content: any; // Array of Excalidraw elements
};
```

### Supported SVG Elements

The tree walker in `src/shared/svgToExcalidraw/walker.ts` (line 30) declares the list of supported SVG tags:

```typescript
const SUPPORTED_TAGS = [
  "svg",       // Root element -- recursively walks children
  "path",      // Converted to Excalidraw "line" elements with points
  "g",         // Group -- creates new group context, walks children
  "use",       // Reference to <defs> -- resolves and processes the referenced element
  "circle",    // Converted to Excalidraw "ellipse" element
  "ellipse",   // Converted to Excalidraw "ellipse" element
  "rect",      // Converted to Excalidraw "rectangle" element
  "polyline",  // Converted to Excalidraw "line" element
  "polygon",   // Converted to Excalidraw "line" element (closed)
  "switch",    // SVG switch element -- walks children
];
```

Elements not in this list are **rejected** by the tree walker's `nodeValidator`:

```typescript
const nodeValidator = (node: Element): number => {
  if (SUPPORTED_TAGS.includes(node.tagName)) {
    return NodeFilter.FILTER_ACCEPT;
  }
  return NodeFilter.FILTER_REJECT;
};
```

### How Each SVG Element Is Converted

#### Circles and Ellipses

Circles and ellipses are converted to Excalidraw ellipse elements. The conversion applies the element's transform matrix to compute final position and dimensions:

```typescript
// Circle conversion (walker.ts, line 189)
const r = getNum(el, "r", 0);
const d = r * 2;
const x = getNum(el, "x", 0) + getNum(el, "cx", 0) - r;
const y = getNum(el, "y", 0) + getNum(el, "cy", 0) - r;
const mat = getTransformMatrix(el, groups);
// Apply matrix multiplication to get final position and size
```

#### Rectangles

Rectangles become Excalidraw rectangle elements. If the SVG rect has `rx` or `ry` attributes (rounded corners), the resulting Excalidraw element gets `roundness: { type: ROUNDNESS.LEGACY }`:

```typescript
// Rect conversion (walker.ts, line 339)
const isRound = el.hasAttribute("rx") || el.hasAttribute("ry");
const rect: ExcalidrawRectangle = {
  ...createExRect(),
  ...presAttrs(el, groups),
  x: result[12], y: result[13],
  width: result[0], height: result[5],
  roundness: isRound ? { type: ROUNDNESS.LEGACY } : null,
};
```

#### Paths

SVG paths are the most complex conversion. The `pointsOnPath` library is used to sample points along the path, then those points are transformed and converted to Excalidraw line elements. The conversion handles two fill rules:

- **nonzero** (default) -- Uses winding order to determine fill. Counter-wound sub-paths get white fill to create "holes".
- **evenodd** -- Each sub-path alternates between filled and unfilled.

```typescript
// Path conversion (walker.ts, line 377)
const points = pointsOnPath(get(el, "d"));
const fillRule = get(el, "fill-rule", "nonzero");
```

#### Polygons and Polylines

Polygons are closed shapes (the last point connects back to the first). Polylines may or may not be closed depending on whether they have a fill:

```typescript
// Polyline (walker.ts, line 297)
const shouldFill = !hasFill || (hasFill && fill !== "none");
const line: ExcalidrawLine = {
  ...createExLine(),
  points: relativePoints.concat(shouldFill ? [[0, 0]] : []),
  // ...
};
```

#### The `<use>` Element

SVG `<use>` elements reference definitions in `<defs>`. The walker resolves these references:

```typescript
// Use conversion (walker.ts, line 148)
const id = useEl.getAttribute("href") || useEl.getAttribute("xlink:href");
const defEl = root.querySelector(id);
const finalEl = getDefElWithCorrectAttrs(defEl, useEl);
```

The attribute merging follows SVG spec rules: attributes on the `<use>` element only override `x`, `y`, `width`, `height`, and `href` on the referenced element. All other attributes from the `<defs>` element take precedence.

### SVG Attribute Mapping

The `attributes.ts` module maps SVG presentation attributes to Excalidraw element properties:

| SVG Attribute | Excalidraw Property | Notes |
|---------------|-------------------|-------|
| `stroke` | `strokeColor` | Handles `stroke-opacity` for alpha |
| `stroke-width` | `strokeWidth` | Direct numeric mapping |
| `stroke-opacity` | `strokeColor` (alpha) | Combined with stroke color |
| `fill` | `backgroundColor` | `"none"` maps to transparent `#00000000` |
| `fill-opacity` | `backgroundColor` (alpha) | Combined with fill color |
| `opacity` | `opacity` | Direct numeric mapping |

### Transform Handling

SVG transforms (translate, rotate, scale, skew, matrix) are converted to CSS transforms and then to `mat4` matrices using the `gl-matrix` library. The `getTransformMatrix()` function in `transform.ts` accumulates transforms from parent groups:

```typescript
export function getTransformMatrix(el: Element, groups: Group[]): mat4 {
  const accumMat = groups
    .map(({ element }) => getElementMatrix(element))
    .concat([getElementMatrix(el)])
    .reduce((acc, mat) => mat4.multiply(acc, acc, mat), mat4.create());
  return accumMat;
}
```

### Unsupported SVG Features

The following SVG features are **not** converted by the import module:

- `<text>` and `<tspan>` elements -- Text is not converted to Excalidraw text elements
- `<image>` elements -- Embedded images are not imported
- `<clipPath>` and `<mask>` -- Clipping and masking are not supported
- CSS `<style>` blocks -- Only inline presentation attributes are parsed
- Gradients (`<linearGradient>`, `<radialGradient>`) -- Solid colors only
- Filters (`<filter>`) -- SVG filters are ignored
- `<line>` elements -- Currently marked as "unimplemented" in the walker
- `<marker>` elements -- Arrow markers are not converted
- Complex path commands (arcs with specific flags) may not convert perfectly

### Using `ea.importSVG()`

The `importSVG()` method on `ExcalidrawAutomate` (line 4049) provides a convenient way to import SVG content:

```typescript
importSVG(svgString: string): boolean {
  const res: ConversionResult = svgToExcalidraw(svgString);
  if(res.hasErrors) {
    new Notice(`There were errors while parsing the given SVG:\n${res.errors}`);
    return false;
  }
  this.copyViewElementsToEAforEditing(res.content);
  return true;
}
```

Usage in a script:

```javascript
// Read an SVG file and import it
const file = app.vault.getAbstractFileByPath("icons/my-icon.svg");
const svgString = await app.vault.read(file);
const success = ea.importSVG(svgString);
if (success) {
  await ea.addElementsToView(true, true);
}
```

---

## Part 6: SVG Generation Under the Hood

### The `getSVG()` Function

The foundational SVG generation function lives in `src/utils/utils.ts` (line 331). It takes a scene object and export settings, and returns an `SVGSVGElement`:

```typescript
export async function getSVG(
  scene: any,
  exportSettings: ExportSettings,
  padding: number,
  srcFile: TFile | null,
  overrideFiles?: Record<ExcalidrawElement["id"], BinaryFileData>,
): Promise<SVGSVGElement>
```

The function performs these steps:

1. **Process embeddable elements** -- If the scene contains embeddable elements (iframes, websites), their links are transformed based on the theme.

2. **Update links** -- If `srcFile` is provided, internal markdown links (`[[link]]`) on elements are converted to Obsidian URLs (`obsidian://open?vault=...&file=...`) using the `updateElementLinksToObsidianLinks()` helper.

3. **Handle mask files** -- If `exportSettings.isMask` is true, a special `CropImage` class generates a cropped SVG instead of a normal export.

4. **Call Excalidraw's `exportToSvg()`** -- The core SVG generation is delegated to the Excalidraw library:

```typescript
svg = await exportToSvg({
  elements: elements.filter(el => el.isDeleted !== true),
  appState: {
    ...scene.appState,
    exportBackground: exportSettings.withBackground,
    exportWithDarkMode: exportSettings.withTheme
      ? scene.appState?.theme !== "light"
      : false,
    ...exportSettings.frameRendering
      ? { frameRendering: exportSettings.frameRendering }
      : {},
  },
  files,
  exportPadding: exportSettings.frameRendering?.enabled ? 0 : padding,
  exportingFrame: null,
  renderEmbeddables: true,
  skipInliningFonts: exportSettings.skipInliningFonts,
});
```

5. **Add CSS classes** -- The resulting SVG gets the `excalidraw-svg` class, plus any CSS classes from the source file's properties.

### The `createSVG()` Function

The higher-level `createSVG()` function in `src/utils/excalidrawAutomateUtils.ts` (line 511) adds template support, element concatenation, and post-processing on top of `getSVG()`:

```typescript
export async function createSVG(
  templatePath: string = undefined,
  embedFont: boolean = false,
  exportSettings: ExportSettings,
  loader: EmbeddedFilesLoader,
  forceTheme: string = undefined,
  canvasTheme: string = undefined,
  canvasBackgroundColor: string = undefined,
  automateElements: ExcalidrawElement[] = [],
  plugin: ExcalidrawPlugin,
  depth: number,
  padding?: number,
  imagesDict?: any,
  convertMarkdownLinksToObsidianURLs: boolean = false,
  includeInternalLinks: boolean = true,
  overrideFiles?: Record<ExcalidrawElement["id"], BinaryFileData>,
): Promise<SVGSVGElement>
```

Key post-processing steps:

1. **Template loading** -- If `templatePath` is provided, the template file is loaded and its elements are prepended to the output.

2. **Block/Section reference viewBox adjustment** -- For block or section references, the SVG's `viewBox` is adjusted to show only the referenced element's bounding box (lines 582-612):

```typescript
if (filenameParts.hasBlockref || filenameParts.hasSectionref) {
  let el = filenameParts.hasSectionref
    ? getTextElementsMatchingQuery(elements, ["# " + filenameParts.sectionref], true)
    : elements.filter(el => el.id === filenameParts.blockref);

  if (el.length > 0) {
    const elBB = plugin.ea.getBoundingBox(el);
    const drawingBB = plugin.ea.getBoundingBox(elements);
    svg.viewBox.baseVal.x = elBB.topX - drawingBB.topX;
    svg.viewBox.baseVal.y = elBB.topY - drawingBB.topY;
    svg.viewBox.baseVal.width = elBB.width + 2 * padding;
    svg.viewBox.baseVal.height = elBB.height + 2 * padding;
  }
}
```

3. **Dark mode foreign object filter** -- If exporting in dark theme, a filter is applied to `<foreignObject>` elements (which contain embedded markdown content):

```typescript
function addFilterToForeignObjects(svg: SVGSVGElement): void {
  const foreignObjects = svg.querySelectorAll("foreignObject");
  foreignObjects.forEach((foreignObject) => {
    foreignObject.setAttribute("filter", THEME_FILTER);
  });
}
```

4. **Bitmap detection flag** -- If the template contains SVGs with bitmaps, the output SVG gets a `hasbitmap` attribute.

### How `MarkdownPostProcessor` Renders SVG Previews

The `MarkdownPostProcessor` (`src/core/managers/MarkdownPostProcessor.ts`) is registered as an Obsidian markdown post-processor. When a page is rendered in reading mode, it processes all `.internal-embed` elements to check if they reference Excalidraw files.

The main flow:

1. **`markdownPostProcessor(el, ctx)`** (line 936) -- Entry point called by Obsidian for each block of rendered markdown.

2. **`processReadingMode(embeddedItems, ctx)`** (line 560) -- Iterates embedded items, checks if they reference Excalidraw files, and replaces them with image elements.

3. **`processInternalEmbed(internalEmbedEl, file)`** (line 595) -- Extracts attributes (filename, dimensions, CSS classes) from the embed element and creates an image div.

4. **`getIMG(imgAttributes, onCanvas)`** (line 324) -- The dispatcher that routes to the appropriate rendering function based on `plugin.settings.previewImageType`:

```typescript
switch (plugin.settings.previewImageType) {
  case PreviewImageType.PNG:
    return await _getPNG({...});
  case PreviewImageType.SVGIMG:
    return await _getSVGIMG({...});
  case PreviewImageType.SVG:
    return await _getSVGNative({...});
}
```

5. **`_getSVGNative()`** (line 251) -- For native SVG mode:
   - Checks the image cache first
   - Falls back to calling `createSVG()` to generate a fresh SVG
   - Caches the result for future use
   - Removes width/height attributes and appends the SVG to a container div

6. **`_getSVGIMG()`** (line 183) -- For SVG-as-image mode:
   - Similar to native but serializes the SVG to a blob URL
   - Sets the blob URL as the `src` of an `<img>` element
   - Manages blob URL lifecycle to prevent memory leaks

7. **`_getPNG()`** (line 73) -- For PNG mode:
   - Checks cache
   - Falls back to `createPNG()`
   - Determines scale factor based on display width

### Image Caching

The `ImageCache` class (`src/shared/ImageCache.ts`) uses IndexedDB to cache rendered images. The cache key (`ImageKey`) includes:

```typescript
export type ImageKey = {
  filepath: string;
  blockref: string;
  sectionref: string;
  isDark: boolean;
  previewImageType: PreviewImageType;
  scale: number;
  isTransparent: boolean;
  inlineFonts: boolean;
} & FILENAMEPARTS;
```

This means the same drawing cached in light/dark mode, at different scales, and with different block references are stored as separate cache entries. The cache automatically invalidates when the source file's `mtime` changes.

### EmbeddedFileLoader SVG Processing

When one Excalidraw drawing is embedded inside another, the `EmbeddedFilesLoader.getExcalidrawSVG()` method (line 332 of `EmbeddedFileLoader.ts`) generates the SVG for the embedded drawing. This is a complex process:

1. **Check cache** -- If the file has no color map and caching is enabled, check IndexedDB first.

2. **Generate SVG** -- Call `createSVG()` with the embedded file's path, export settings, and a `depth` parameter to prevent infinite recursion:

```typescript
const svg = replaceSVGColors(
  await createSVG(
    hasFilenameParts ? filenameParts.filepath + filenameParts.linkpartReference : file?.path,
    false,
    exportSettings,
    this, // the loader itself, for nested loading
    forceTheme,
    null, null,
    elements,
    this.plugin,
    depth + 1,  // increment depth to prevent infinite loops
    getExportPadding(this.plugin, file),
  ),
  inFile instanceof EmbeddedFile ? inFile.colorMap : null
) as SVGSVGElement;
```

3. **Detect bitmaps** -- Scan the SVG for non-SVG images and SVGs with the `-no-invert-svg` suffix:

```typescript
const imageList = svg.querySelectorAll("image:not([href^='data:image/svg'])");
if (imageList.length > 0) hasSVGwithBitmap = true;
```

4. **Apply dark mode filters** -- In dark mode, apply `THEME_FILTER` to bitmap images and non-invertible SVGs.

5. **Cache the result** -- Store the SVG in the image cache.

6. **Convert to data URL** -- Serialize the SVG and convert to a base64 data URL:

```typescript
const dURL = svgToBase64(svg.outerHTML) as DataURL;
```

#### Recursion Guard

The `loadSceneFiles()` method has a depth guard (line 619):

```typescript
if(depth > 7) {
  new Notice(t("INFINITE_LOOP_WARNING") + depth.toString(), 6000);
  return;
}
```

This prevents infinite loops when drawings are mutually embedded.

For markdown files embedded in Excalidraw drawings, a separate recursion guard uses a `Set<TFile>`:

```typescript
const markdownRendererRecursionWatcthdog = new Set<TFile>();
```

### Markdown-to-SVG Conversion

When a markdown file is embedded in an Excalidraw drawing, the `convertMarkdownToSVG()` method (line 972) creates an SVG with a `<foreignObject>` containing the rendered markdown:

1. **Get markdown content** -- Load and transclude the markdown text.
2. **Apply styles** -- Load font definitions and CSS from frontmatter (`excalidraw-font`, `excalidraw-font-color`, `excalidraw-css`, `excalidraw-border-color`).
3. **Render markdown** -- Use Obsidian's `MarkdownRenderer.render()` to convert markdown to HTML.
4. **Compute inline styles** -- Use an invisible iframe to compute CSS styles and inline them (necessary because SVG `<foreignObject>` doesn't inherit page styles).
5. **Size the SVG** -- Create a temporary SVG to measure the content height, then create the final SVG with correct dimensions.
6. **Handle embedded images** -- Convert blob URLs to base64 data URLs and handle internal embeds.

The resulting SVG structure:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="NNpx" height="NNpx">
  <style>/* inline CSS */</style>
  <foreignObject x="0" y="0" width="NNpx" height="NNpx">
    <div xmlns="http://www.w3.org/1999/xhtml" class="excalidraw-md-host">
      <!-- rendered markdown HTML -->
    </div>
    <div class="excalidraw-md-footer"></div>
  </foreignObject>
  <defs><style>/* font definitions */</style></defs>
</svg>
```

---

## Part 7: Working with SVG in Scripts

### 7a. Export Current View as SVG File

```javascript
// Export the current drawing view as an SVG file
const svg = await ea.createViewSVG({
  withBackground: true,
  theme: "light",
  padding: 10,
});

if (!svg) {
  new Notice("Failed to create SVG");
  return;
}

// Serialize the SVG to string
const svgString = svg.outerHTML;

// Generate a unique file path
const drawingFile = ea.targetView.file;
const folder = drawingFile.parent.path;
const baseName = drawingFile.basename.replace(".excalidraw", "");
const path = `${folder}/${baseName}-export.svg`;

// Write the file
await app.vault.create(path, svgString);
new Notice(`SVG exported to ${path}`);
```

### 7b. Export Selected Elements Only

```javascript
// Export only the selected elements as SVG
const svg = await ea.createViewSVG({
  withBackground: false,
  selectedOnly: true,
  padding: 20,
  skipInliningFonts: false,
});

if (!svg) {
  new Notice("Select elements first!");
  return;
}

const svgString = svg.outerHTML;

// Copy to clipboard
await navigator.clipboard.writeText(svgString);
new Notice("SVG copied to clipboard!");
```

### 7c. Import SVG and Convert to Editable Elements

```javascript
// Let the user pick an SVG file
const svgFiles = app.vault.getFiles().filter(f => f.extension === "svg");
const file = await utils.suggester(
  svgFiles.map(f => f.path),
  svgFiles,
  "Select SVG to import"
);

if (!file) return;

// Read the SVG content
const svgString = await app.vault.read(file);

// Import into EA workbench
const success = ea.importSVG(svgString);
if (!success) {
  new Notice("Failed to import SVG");
  return;
}

// Add the imported elements to the current view
await ea.addElementsToView(true, true);
new Notice("SVG imported successfully!");
```

### 7d. Batch Export Frames as Individual SVGs

```javascript
// Get all elements in the view
const elements = ea.getViewElements();
const frames = elements.filter(el => el.type === "frame");

if (frames.length === 0) {
  new Notice("No frames found in this drawing");
  return;
}

const drawingFile = ea.targetView.file;
const folder = drawingFile.parent.path;

for (const frame of frames) {
  // Export each frame using clipped frame reference
  const frameName = frame.name || frame.id;

  const svg = await ea.createViewSVG({
    withBackground: true,
    frameRendering: {
      enabled: true,
      name: false,
      outline: false,
      clip: true,
    },
    // Filter to only frame elements
    elementsOverride: elements.filter(el =>
      el.frameId === frame.id || el.id === frame.id
    ),
  });

  if (svg) {
    const path = `${folder}/${frameName}.svg`;
    try {
      const existing = app.vault.getAbstractFileByPath(path);
      if (existing) {
        await app.vault.modify(existing, svg.outerHTML);
      } else {
        await app.vault.create(path, svg.outerHTML);
      }
    } catch (e) {
      console.error(`Failed to export frame ${frameName}:`, e);
    }
  }
}

new Notice(`Exported ${frames.length} frames as SVG`);
```

### 7e. Color Map Manipulation via Script

```javascript
// Get the selected image element
const selected = ea.getViewSelectedElements();
const imgEl = selected.find(el => el.type === "image");

if (!imgEl) {
  new Notice("Select an image element first");
  return;
}

// Get the current color information
const colorInfo = await ea.getSVGColorInfoForImgElement(imgEl);
if (!colorInfo || colorInfo.size === 0) {
  new Notice("No colors found in this image (not an SVG or Excalidraw file)");
  return;
}

// Display current colors
let colorReport = "Colors found:\n";
colorInfo.forEach((info, color) => {
  colorReport += `  ${color} -> ${info.mappedTo} (fill: ${info.fill}, stroke: ${info.stroke})\n`;
});
console.log(colorReport);

// Example: remap all black fills to blue
colorInfo.forEach((info, color) => {
  if (color === "#000000" || color === "black") {
    info.mappedTo = "#0000ff";
  }
});

// Convert back to a ColorMap and apply
// Note: actual application requires updating the EmbeddedFile's colorMap
// and refreshing the view -- this is typically done through the Shade Master script
```

### 7f. Create SVG from Scratch with EA

```javascript
// Create elements in the EA workbench
ea.reset();
ea.style.strokeColor = "#1e1e1e";
ea.style.backgroundColor = "#a5d8ff";
ea.style.fillStyle = "solid";
ea.style.strokeWidth = 2;

// Add a rectangle
const rectId = ea.addRect(0, 0, 200, 100);

// Add an ellipse
const ellipseId = ea.addEllipse(250, 0, 150, 100);

// Add a connecting arrow
ea.style.strokeColor = "#e03131";
ea.addArrow([[200, 50], [250, 50]]);

// Generate SVG from the workbench elements
const svg = await ea.createSVG(
  undefined,  // no template
  true,       // embed fonts
  {
    withBackground: true,
    withTheme: false,
    isMask: false,
  },
);

// Save to file
const path = "exports/my-diagram.svg";
await app.vault.create(path, svg.outerHTML);
new Notice(`Diagram saved to ${path}`);
```

### 7g. Compare Light and Dark Mode SVGs

```javascript
// Generate both light and dark mode SVGs of the current view
const lightSVG = await ea.createViewSVG({
  withBackground: true,
  theme: "light",
});

const darkSVG = await ea.createViewSVG({
  withBackground: true,
  theme: "dark",
});

const drawingFile = ea.targetView.file;
const folder = drawingFile.parent.path;
const baseName = drawingFile.basename.replace(".excalidraw", "");

// Save both variants
await app.vault.create(`${folder}/${baseName}-light.svg`, lightSVG.outerHTML);
await app.vault.create(`${folder}/${baseName}-dark.svg`, darkSVG.outerHTML);

new Notice("Light and dark SVGs exported!");
```

---

## Part 8: SVG Manipulation Techniques

### Adding CSS to Exported SVGs

The `excalidraw-css` frontmatter property allows you to attach CSS to the drawing. While this is primarily used for styling embedded markdown content, it can also affect the SVG output:

```yaml
---
excalidraw-plugin: parsed
excalidraw-css: "[[my-styles.css]]"
---
```

The CSS file reference is resolved by `convertMarkdownToSVG()` in `EmbeddedFileLoader.ts` (lines 1046-1067). If the value is a file link, the file's content is loaded as CSS. If it is a raw string, it is used directly.

The CSS is injected into the SVG's `<style>` element:

```xml
<svg>
  <style>/* your CSS here */</style>
  <foreignObject>...</foreignObject>
</svg>
```

This is particularly useful for:
- Styling markdown embeds inside the drawing
- Controlling border appearance around embedded markdown
- Setting custom font styles

### Font Embedding in SVG Exports

Fonts are embedded in SVGs as base64-encoded `@font-face` definitions inside a `<defs><style>` block. The `skipInliningFonts` export setting controls this behavior:

- When `false` (default for preview rendering), fonts are embedded in the SVG, making it self-contained.
- When `true`, font inlining is skipped, reducing file size but requiring the fonts to be available in the rendering environment.

The font embedding is handled by the Excalidraw library's `exportToSvg()` function, which reads the font data from the global font registry.

For custom fonts used in markdown embeds, the `getCSSFontDefinition()` function provides base64-encoded font data for built-in fonts (Virgil, Cascadia, Assistant/Helvetica, Excalifont, Nunito, Lilita One, Comic Shanns, Liberation Sans), while custom fonts are loaded via `getFontDataURL()`.

### SVG Optimization for Web Use

When exporting SVGs for web use, consider these strategies:

1. **Skip font inlining** -- Use `skipInliningFonts: true` if the target environment has the fonts available. This can dramatically reduce file size.

2. **Transparent background** -- Use `withBackground: false` to remove the background rectangle, which is typically unnecessary for web embedding.

3. **Remove internal links** -- Use `includeInternalLinks: false` when exporting for external consumption, as Obsidian-style links are meaningless outside Obsidian.

4. **Optimize padding** -- Set `padding: 0` or a small value to minimize whitespace.

### Working with SVG `viewBox` and Dimensions

The plugin makes extensive use of SVG `viewBox` manipulation for block references. Understanding the relationship between `width`, `height`, and `viewBox` is key:

- `width` and `height` attributes control the **display size** of the SVG in the DOM.
- `viewBox` controls which portion of the SVG coordinate space is visible.

For area references, the `viewBox` is cropped to show only the referenced element:

```typescript
svg.viewBox.baseVal.x = elBB.topX - drawingBB.topX;
svg.viewBox.baseVal.y = elBB.topY - drawingBB.topY;
svg.viewBox.baseVal.width = elBB.width + 2 * padding;
svg.viewBox.baseVal.height = elBB.height + 2 * padding;
```

In the `MarkdownPostProcessor`, width and height attributes are often removed from preview SVGs to allow them to scale responsively:

```typescript
svg.removeAttribute("width");
svg.removeAttribute("height");
```

### The `svgToBase64()` Function

Converting SVG strings to base64 data URLs is a common operation. The `svgToBase64()` function in `src/utils/utils.ts` (line 296) handles this:

```typescript
export function svgToBase64(svg: string): string {
  const cleanSvg = svg.replaceAll("&nbsp;", " ");
  const encodedData = encodeURIComponent(cleanSvg)
    .replace(/%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(parseInt(p1, 16))
    );
  return `data:image/svg+xml;base64,${btoa(encodedData)}`;
}
```

Note the `&nbsp;` cleanup -- this prevents encoding issues with non-breaking spaces. The function uses `encodeURIComponent` followed by byte decoding to properly handle UTF-8 characters that `btoa` cannot handle directly.

### The `convertSVGStringToElement()` Function

Converting an SVG string back to a DOM element is done by `convertSVGStringToElement()` in `src/utils/utils.ts` (line 1093):

```typescript
export function convertSVGStringToElement(svg: string): SVGSVGElement {
  const divElement = document.createElement("div");
  divElement.innerHTML = svg;
  const firstChild = divElement.firstChild;
  if (firstChild instanceof SVGSVGElement) {
    return firstChild;
  }
  return;
}
```

This is used extensively in the `MarkdownPostProcessor` to convert SVG strings from the cache or from `createSVG()` into DOM elements that can be inserted into the page.

### Working with SVG `foreignObject`

`<foreignObject>` is the mechanism by which markdown content (HTML) is embedded inside SVG. This is used for markdown embeds in Excalidraw drawings:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300px" height="200px">
  <foreignObject x="0" y="0" width="300px" height="200px">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <!-- Rendered markdown HTML -->
    </div>
  </foreignObject>
</svg>
```

Key considerations:
- `foreignObject` content uses the XHTML namespace
- CSS styles must be inlined because external stylesheets are not loaded inside SVG
- In dark mode, `foreignObject` elements get the `THEME_FILTER` applied via `addFilterToForeignObjects()`
- Images inside `foreignObject` are detected as "SVG with bitmap" and trigger separate light/dark rendering

---

## Part 9: SVG and PDF Export

### How PDF Export Uses SVG

PDF export in the Excalidraw plugin works by generating SVGs and then printing them to PDF using Electron's print-to-PDF API. The core implementation is in `src/utils/exportUtils.ts`.

The high-level flow:

1. **Generate SVGs** -- The drawing (or individual frames) is exported as SVG elements.
2. **Calculate tiling** -- The `calculateDimensions()` function determines how to tile the SVG across pages.
3. **Create page divs** -- HTML `<div>` elements are created for each page, each containing a clone of the SVG with an adjusted `viewBox`.
4. **Print to PDF** -- The page divs are appended to the DOM and Electron's `print-to-pdf` IPC channel renders them.

### The `exportToPDF()` Function

Defined at `src/utils/exportUtils.ts` (line 412):

```typescript
export async function exportToPDF({
  SVG,
  scale = { fitToPage: 1, zoom: 1 },
  pageProps,
  filename
}: {
  SVG: SVGSVGElement[];
  scale: PDFExportScale;
  pageProps: PDFPageProperties;
  filename: string;
}): Promise<void>
```

The function accepts an array of SVG elements (for multi-page PDFs from frames) and page properties.

### PDF Page Configuration

#### Page Sizes

Standard page sizes are defined in `src/types/exportUtilTypes.ts` (lines 42-56):

```typescript
export const STANDARD_PAGE_SIZES = {
  A0: { width: 3179.52, height: 4494.96 },
  A1: { width: 2245.76, height: 3179.52 },
  A2: { width: 1587.76, height: 2245.76 },
  A3: { width: 1122.56, height: 1587.76 },
  A4: { width: 794.56, height: 1122.56 },
  A5: { width: 559.37, height: 794.56 },
  A6: { width: 397.28, height: 559.37 },
  Legal: { width: 816, height: 1344 },
  Letter: { width: 816, height: 1056 },
  Tabloid: { width: 1056, height: 1632 },
  Ledger: { width: 1056, height: 1632 },
  "HD Screen": { width: 1920, height: 1080 },
  "MATCH IMAGE": { width: 0, height: 0 },
} as const;
```

The special `"MATCH IMAGE"` size triggers the mixed-size mode, where each SVG gets its own page size matching its dimensions.

#### Orientation

```typescript
export type PageOrientation = "portrait" | "landscape";
```

#### Margins

```typescript
export function getMarginValue(margin: PDFPageMarginString): PDFMargin {
  switch(margin) {
    case "none": return { left: 0, right: 0, top: 0, bottom: 0 };
    case "tiny": return { left: 10, right: 10, top: 10, bottom: 10 };
    case "normal": return { left: 60, right: 60, top: 60, bottom: 60 };
  }
}
```

#### Scale and Fitting

The `PDFExportScale` interface controls how the drawing fits on pages:

```typescript
export interface PDFExportScale {
  fitToPage: number; // 0 = use zoom, >0 = fit to N pages
  zoom?: number;
}
```

- `fitToPage: 0` -- Manual zoom control
- `fitToPage: 1` -- Fit to a single page
- `fitToPage: N` -- Fit to at most N pages (uses binary search to find optimal zoom)

#### Alignment

```typescript
export type PDFPageAlignment =
  | "center"
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "center-left" | "center-right";
```

### The Tiling Algorithm

When a drawing is too large to fit on a single page, the `calculateDimensions()` function (line 207) tiles the SVG across multiple pages:

1. Compute available area (page dimensions minus margins).
2. If `fitToPage > 0`, use binary search to find the optimal zoom level.
3. If the content fits on one page, return a single tile.
4. Otherwise, compute the grid of tiles (columns x rows).
5. For each tile, calculate:
   - The `viewBox` string (which portion of the SVG to show)
   - The `width` and `height` of the tile on the page
   - The `x` and `y` position of the tile within the page margins

### Mixed-Size PDF Export

When `"MATCH IMAGE"` is selected as the page size (or when dimensions are zero), the function uses a mixed-size approach with CSS `@page` rules:

1. Each SVG gets its own page size based on its dimensions.
2. Named `@page` CSS rules are generated for each unique page size.
3. A dummy first page is inserted to "prime" Chromium's page box engine.
4. The `pageRanges: "2-"` option excludes the dummy page from the final PDF.

### Script-Based PDF Export

Using `ea.createPDF()` (line 1275 of `ExcalidrawAutomate.ts`):

```javascript
// First generate SVGs for each frame
const elements = ea.getViewElements();
const frames = elements.filter(el => el.type === "frame");
const svgs = [];

for (const frame of frames) {
  const svg = await ea.createViewSVG({
    withBackground: true,
    elementsOverride: elements.filter(el =>
      el.frameId === frame.id || el.id === frame.id
    ),
    frameRendering: {
      enabled: true,
      name: false,
      outline: false,
      clip: true,
    },
  });
  if (svg) svgs.push(svg);
}

// Export to PDF
await ea.createPDF({
  SVG: svgs,
  scale: { fitToPage: 1, zoom: 1 },
  pageProps: {
    dimensions: { width: 794.56, height: 1122.56 }, // A4
    backgroundColor: "#ffffff",
    margin: { left: 60, right: 60, top: 60, bottom: 60 },
    alignment: "center",
  },
  filename: "my-presentation.pdf",
});
```

### Clipboard Export Functions

The `exportUtils.ts` module also provides clipboard export functions:

```typescript
// Copy SVG to clipboard as text
export async function exportSVGToClipboard(svg: SVGSVGElement) {
  const svgString = svg.outerHTML;
  await navigator.clipboard.writeText(svgString);
}

// Copy PNG to clipboard as image
export async function exportPNGToClipboard(png: Blob) {
  await navigator.clipboard.write([
    new window.ClipboardItem({ "image/png": png }),
  ]);
}
```

---

## Part 10: Hybrid Markdown-Excalidraw Notes

### The Hybrid Note Concept

A hybrid note is an Obsidian markdown file that contains both a readable markdown section and an Excalidraw drawing. The drawing data is stored in the `# Excalidraw Data` section at the bottom, while the top of the file contains regular markdown content.

The key is that the file can be opened in either markdown view (showing the text content) or Excalidraw view (showing the drawing), and when embedded in other notes, it can show either the drawing as an image or the markdown content.

### Setting Up a Hybrid Note

The essential frontmatter properties:

```yaml
---
excalidraw-plugin: parsed
excalidraw-open-md: true
excalidraw-embed-md: true
excalidraw-autoexport: svg
---
```

| Property | Effect |
|----------|--------|
| `excalidraw-plugin: parsed` | Required -- marks this as an Excalidraw file |
| `excalidraw-open-md: true` | Opens the file in markdown view by default (instead of Excalidraw view) |
| `excalidraw-embed-md: true` | When embedded, shows markdown content instead of the drawing image |
| `excalidraw-autoexport: svg` | Auto-exports an SVG for embedding the drawing as an image |

### Using the `#^as-image` Reference

In a hybrid note, you might want to show the drawing image in one place and the text content in another. The `#^as-image` phantom block reference forces image rendering:

```markdown
<!-- This shows the markdown text content -->
![[hybrid-note.excalidraw]]

<!-- This forces the drawing image -->
![[hybrid-note.excalidraw#^as-image]]
```

### Embedding the Drawing's Markdown Content

When `excalidraw-embed-md: true` is set, the standard embed shows markdown content. The plugin's `tmpObsidianWYSIWYG` function checks for this property (line 760):

```typescript
if(ctx.frontmatter?.["excalidraw-embed-md"]) {
  return; // Let Obsidian handle the embed normally (as markdown)
}
```

### Practical Hybrid Note Workflow

1. Create a new Excalidraw drawing.
2. Add the hybrid frontmatter properties.
3. Write your markdown content above the `# Excalidraw Data` section.
4. The drawing is edited in Excalidraw view; the text in markdown view.
5. Auto-export generates an SVG alongside the file.
6. In other notes, embed normally for text: `![[note]]`
7. Use `#^as-image` for the drawing: `![[note#^as-image]]`

### Theme Matching for Previews

The plugin can match the Excalidraw theme to Obsidian's current theme. When `previewMatchObsidianTheme` is enabled in settings, the preview SVG/PNG is generated with the appropriate theme:

```typescript
const theme = forceTheme ??
  (plugin.settings.previewMatchObsidianTheme
    ? isObsidianThemeDark() ? "dark" : "light"
    : !plugin.settings.exportWithTheme
      ? "light"
      : undefined);
```

This ensures that drawings look appropriate in both light and dark Obsidian themes.

---

## Part 11: Troubleshooting SVG Issues

### SVG Not Rendering in Reading Mode

**Symptoms**: Excalidraw files show raw text or nothing when embedded in reading mode.

**Possible causes and solutions**:

1. **Plugin not initialized** -- The `markdownPostProcessor` calls `await plugin.awaitInit()` (line 372) and `await plugin.awaitSettings()` (line 940) before rendering. If the plugin hasn't finished loading, previews won't render. Wait for the plugin to fully initialize.

2. **`renderImageInMarkdownReadingMode` disabled** -- Check plugin settings. This setting controls whether images render in reading mode (line 777).

3. **`excalidraw-embed-md: true`** -- If this frontmatter property is set, the file is treated as markdown rather than rendered as an image. Remove or set to `false` if you want image rendering.

4. **Nesting depth exceeded** -- The `remainingNestLevel` check (line 765) prevents infinite recursion. If you have deeply nested embeds, some may not render.

5. **File not recognized as Excalidraw** -- The `plugin.isExcalidrawFile(file)` check must pass. Ensure the file has proper frontmatter with `excalidraw-plugin: parsed`.

### Color Mapping Not Working

**Symptoms**: Embedded SVGs or Excalidraw files don't change color despite having a color map.

**Possible causes**:

1. **File type check** -- Color maps are only applied to SVG files and Excalidraw files. The `EmbeddedFile` constructor checks (line 144):
   ```typescript
   if(this.file && (this.plugin.isExcalidrawFile(this.file) || this.file.extension.toLowerCase() === "svg"))
   ```
   PNG and other raster images do not support color mapping.

2. **Case sensitivity** -- Color maps are normalized to lowercase (line 146):
   ```typescript
   this.colorMap = colorMapJSON ? JSON.parse(colorMapJSON.toLocaleLowerCase()) : null;
   ```
   Ensure your source colors match the case-normalized versions.

3. **CSS colors vs. attributes** -- The `replaceSVGColors()` function handles both XML attributes (`fill="..."`) and CSS inline styles (`fill:...`). However, colors defined in `<style>` blocks or via CSS classes are NOT replaced.

4. **JSON parsing error** -- If the color map JSON is malformed, it silently falls back to `null` (line 147-149). Check for valid JSON syntax.

5. **Cache interference** -- If caching is enabled and the image was cached before the color map was applied, the cached version (without color changes) might be served. Color-mapped images skip the cache (line 361-362).

### Fonts Missing in Exported SVG

**Symptoms**: Text in exported SVGs displays in a default font instead of the intended font.

**Solutions**:

1. **Enable font inlining** -- When calling `createSVG()` or `createViewSVG()`, ensure `skipInliningFonts` is `false` (the default for preview rendering).

2. **Check export settings** -- The `ExportSettings.skipInliningFonts` property controls font embedding. In `createSVG()` (line 531-533):
   ```typescript
   if(typeof exportSettings.skipInliningFonts === "undefined") {
     exportSettings.skipInliningFonts = !embedFont;
   }
   ```

3. **Custom fonts** -- For custom fonts specified via `excalidraw-font` frontmatter, the font file must be accessible in the vault. The `getFontDataURL()` function attempts to load the font and convert it to a base64 data URL.

### Embedded Images Not Showing in SVG

**Symptoms**: Images embedded in the drawing appear as blank rectangles in the exported SVG.

**Possible causes**:

1. **Missing image files** -- If embedded image files have been moved or deleted, they cannot be loaded. The `EmbeddedFile` class shows a warning (line 191-195):
   ```typescript
   new Notice(`Excalidraw Warning: could not find image file: ${imgPath}`, 5000);
   ```

2. **Recursion depth exceeded** -- Nested Excalidraw files have a depth limit of 7 (line 619). Deeply nested structures may not fully render.

3. **Hyperlink images** -- Images loaded from URLs may fail if the URL is unreachable or returns an error.

4. **Local file links** -- `file://` protocol links require special handling and may not work on all platforms.

### SVG File Size Too Large

**Symptoms**: Exported SVGs are extremely large (megabytes).

**Causes and solutions**:

1. **Embedded bitmaps** -- If the drawing contains embedded raster images (PNG, JPG), these are stored as base64 data URLs inside the SVG, which adds ~33% overhead. Consider:
   - Using fewer or smaller embedded images
   - Exporting as PNG instead (the raster data is more efficiently stored)

2. **Inlined fonts** -- Font data can be significant. Use `skipInliningFonts: true` if the fonts are available in the rendering environment.

3. **Many elements** -- Drawings with thousands of elements produce large SVGs. Consider breaking the drawing into frames and exporting individually.

4. **Markdown embeds** -- Embedded markdown files with inline styles produce verbose SVG content due to computed style inlining.

### Block References Not Working with SVG

**Symptoms**: Using `#^area=...` or `#^group=...` shows the entire drawing instead of the referenced element.

**Possible causes**:

1. **Invalid element ID** -- The element ID in the reference must match an actual element in the drawing. IDs are case-sensitive.

2. **Preview mode mismatch** -- Area references use SVG `viewBox` manipulation, which works best in SVG and SVGIMG preview modes. In PNG mode, only group and frame references are fully supported (line 106-107 in `MarkdownPostProcessor.ts`):
   ```typescript
   // In case of PNG I cannot change the viewBox to select the area of the element
   // being referenced. For PNG only the group reference works
   ```

3. **Cache staleness** -- If the drawing was modified after the cache was populated, the cached image may not reflect the current element positions. The cache invalidates based on file mtime, but in some cases a manual refresh may be needed.

4. **Missing text container** -- For text elements, the area reference checks for the container element (line 598-601):
   ```typescript
   const containerId = el[0].containerId;
   if(containerId) {
     el = el.concat(elements.filter(el => el.id === containerId));
   }
   ```

### Theme Mismatch Between Drawing and Export

**Symptoms**: The exported SVG has a different theme (light/dark) than expected.

**Understanding theme resolution**:

The theme for SVG generation is resolved through a priority chain:

1. **Per-file frontmatter** -- `excalidraw-export-dark` overrides everything. Checked via `hasExportTheme()` and `getExportTheme()`.

2. **Obsidian theme matching** -- If `previewMatchObsidianTheme` is enabled, the preview uses Obsidian's current theme.

3. **Export settings** -- `exportWithTheme` in plugin settings controls whether the drawing's internal theme is respected.

4. **Drawing theme** -- The `theme` property in the scene's `appState` (either `"light"` or `"dark"`).

5. **Default** -- Falls back to `"light"`.

To ensure consistent exports, explicitly set the theme in frontmatter:

```yaml
---
excalidraw-export-dark: false
---
```

Or when using the scripting API:

```javascript
const svg = await ea.createViewSVG({
  theme: "light", // explicit theme
  withBackground: true,
});
```

### SVG Preview Flickering or Not Updating

**Symptoms**: The preview image flickers or shows stale content.

The `MarkdownPostProcessor` has a debounce mechanism to prevent flickering when attributes change (lines 907-921):

```typescript
let timer: number = null;
const markdownObserverFn: MutationCallback = (m) => {
  if (!["alt", "width", "height"].contains(m[0]?.attributeName)) return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(async () => {
    timer = null;
    internalEmbedDiv.empty();
    const imgDiv = await processInternalEmbed(internalEmbedDiv, file);
    internalEmbedDiv.appendChild(imgDiv);
  }, 500);
}
```

The 500ms debounce means rapid changes will only trigger one re-render. If the preview seems stuck, try:
- Switching to another file and back
- Toggling reading/editing mode
- Using the "Rerender all Excalidraw images" command (triggered by the `RERENDER_EVENT`)

### Memory Leaks with Blob URLs

When previews use blob URLs (for SVG-as-image and PNG modes), the plugin manages URL lifecycle to prevent memory leaks:

```typescript
if (!cacheReady) {
  const cleanup = () => URL.revokeObjectURL(blobUrl);
  img.addEventListener('load', cleanup, { once: true });
  img.addEventListener('error', cleanup, { once: true });
}
```

When caching is enabled, blob URLs are stored in the cache and revoked when the cache entry is evicted. If you notice increasing memory usage, clearing the image cache may help.

---

## Summary of Key Source Files

| File | Role in SVG |
|------|-------------|
| `src/shared/EmbeddedFileLoader.ts` | `replaceSVGColors()`, `getExcalidrawSVG()`, `convertMarkdownToSVG()`, `getSVGData()` |
| `src/shared/ExcalidrawAutomate.ts` | `createSVG()`, `createViewSVG()`, `createPNG()`, `createPDF()`, `importSVG()`, `getSVGColorInfoForImgElement()`, `getColorsFromSVGString()` |
| `src/utils/excalidrawAutomateUtils.ts` | `createSVG()` (low-level), `createPNG()`, `updateElementLinksToObsidianLinks()`, SVGColorInfo helpers |
| `src/utils/utils.ts` | `getSVG()`, `getPNG()`, `svgToBase64()`, `convertSVGStringToElement()`, `getEmbeddedFilenameParts()` |
| `src/utils/exportUtils.ts` | `exportToPDF()`, `exportSVGToClipboard()`, `exportPNGToClipboard()`, tiling/paging calculations |
| `src/core/managers/MarkdownPostProcessor.ts` | `_getSVGNative()`, `_getSVGIMG()`, `_getPNG()`, preview rendering pipeline |
| `src/shared/svgToExcalidraw/parser.ts` | `svgToExcalidraw()` -- SVG import conversion entry point |
| `src/shared/svgToExcalidraw/walker.ts` | SVG DOM tree walker with element-specific converters |
| `src/shared/svgToExcalidraw/attributes.ts` | SVG attribute to Excalidraw property mapping |
| `src/shared/svgToExcalidraw/transform.ts` | SVG transform matrix handling |
| `src/shared/ImageCache.ts` | IndexedDB-backed image cache with composite keys |
| `src/types/exportUtilTypes.ts` | `ExportSettings`, `PDFPageProperties`, `STANDARD_PAGE_SIZES`, `PageSize` |
| `src/types/utilTypes.ts` | `FILENAMEPARTS`, `PreviewImageType`, `FrameRenderingOptions` |
| `src/types/excalidrawAutomateTypes.ts` | `SVGColorInfo` type definition |
| `src/types/embeddedFileLoaderTypes.ts` | `ColorMap`, `MimeType`, `Size` |
| `src/constants/constants.ts` | `FRONTMATTER_KEYS`, `THEME_FILTER` |
| `src/shared/ExcalidrawData.ts` | `AutoexportPreference` enum |
