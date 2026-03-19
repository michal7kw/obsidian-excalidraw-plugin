# Guide 14: The Excalidraw Library API — The Foundation Beneath the Plugin

This guide covers the **core Excalidraw library API** — the `@excalidraw/excalidraw` npm package
(used in this plugin via the `@zsviczian/excalidraw` fork). This is the layer **below** the
plugin's ExcalidrawAutomate scripting API. Understanding it unlocks deeper control over
drawing creation, export, scene management, and programmatic element manipulation.

---

## Table of Contents

1. [Part 1: Library vs. Plugin — Understanding the Layers](#part-1-library-vs-plugin--understanding-the-layers)
2. [Part 2: ExcalidrawElementSkeleton — Simplified Element Creation](#part-2-excalidrawelementskeleton--simplified-element-creation)
3. [Part 3: ExcalidrawAPI — The Imperative React Interface](#part-3-excalidrawapi--the-imperative-react-interface)
4. [Part 4: Export Utilities](#part-4-export-utilities)
5. [Part 5: Restore Utilities](#part-5-restore-utilities)
6. [Part 6: JSON Schema Specification](#part-6-json-schema-specification)
7. [Part 7: Constants](#part-7-constants)
8. [Part 8: Frames — Ordering Constraint](#part-8-frames--ordering-constraint)
9. [Part 9: Mermaid-to-Excalidraw Conversion](#part-9-mermaid-to-excalidraw-conversion)
10. [Part 10: React Component Props Reference](#part-10-react-component-props-reference)
11. [Part 11: CSS Customization](#part-11-css-customization)
12. [Part 12: General Utility Functions](#part-12-general-utility-functions)
13. [Part 13: Accessing Library APIs from Plugin Scripts](#part-13-accessing-library-apis-from-plugin-scripts)
14. [Cross-References](#cross-references)

---

## Part 1: Library vs. Plugin — Understanding the Layers

The Obsidian Excalidraw plugin is built on top of the `@excalidraw/excalidraw` library (specifically
the `@zsviczian/excalidraw` fork maintained by the plugin author). Understanding where the library
ends and the plugin begins is essential for effective scripting and customization.

### What the Library Provides

The `@excalidraw/excalidraw` library is the core open-source drawing engine. It provides:

- **The drawing canvas** — the React component that renders the interactive drawing surface
- **Element types** — rectangles, ellipses, diamonds, lines, arrows, text, images, frames,
  freedraw, and embeddables
- **Rendering engine** — SVG and canvas rendering of elements with roughjs hand-drawn aesthetics
- **Export pipeline** — functions to export scenes to PNG, SVG, clipboard, and JSON
- **Scene management** — the imperative API for reading/updating elements, appState, and files
- **Element creation** — the ElementSkeleton API for programmatic element generation
- **Restore utilities** — validation and normalization of imported scene data
- **Constants** — font families, themes, MIME types
- **Coordinate utilities** — scene-to-viewport coordinate transformations
- **Collision/bounds** — bounding box queries and overlap detection

### What the Plugin Adds

The Obsidian plugin wraps this library and adds an extensive layer on top:

- **Markdown storage format** — drawings stored as `.md` files with frontmatter + embedded JSON
  scene data (optionally LZString-compressed), not `.excalidraw` JSON files
- **Obsidian integration** — workspace views, file management, vault events, settings, commands
- **ExcalidrawAutomate (EA)** — the high-level scripting API (~4000 lines) that provides a
  friendlier interface for element creation, scene manipulation, and file operations
- **Script Engine** — user automation scripts with a library of community scripts
- **Image caching** — `ImageCache` singleton for performance with embedded images
- **Embedded file loading** — resolution and rendering of images, PDFs, markdown embeds, and URLs
- **Link/transclusion support** — Obsidian-style `[[wikilinks]]` and block references within drawings
- **Package management** — runtime loading of React/Excalidraw from compressed strings (not
  normal imports)
- **LaTeX support** — MathJax rendering via the `MathjaxToSVG` sub-package

### The Layered Architecture

```
+------------------------------------------------------------------+
|                     User Scripts (.md scripts)                    |
+------------------------------------------------------------------+
|              ExcalidrawAutomate (EA) — scripting API              |
|       src/shared/ExcalidrawAutomate.ts (~4000 lines)             |
+------------------------------------------------------------------+
|              ExcalidrawView — Obsidian view wrapper               |
|         src/view/ExcalidrawView.ts (~6700 lines)                 |
+------------------------------------------------------------------+
|          Obsidian Plugin Infrastructure (managers, etc.)          |
|         src/core/main.ts, src/core/managers/*.ts                 |
+------------------------------------------------------------------+
|       @zsviczian/excalidraw (fork of @excalidraw/excalidraw)     |
|              The core drawing library ← THIS GUIDE               |
+------------------------------------------------------------------+
|              React 18 + ReactDOM (eval'd at runtime)             |
+------------------------------------------------------------------+
```

### How to Access Library APIs

There are two primary ways to access library-level APIs from within the plugin:

**1. The `excalidrawLib` global**

The PackageManager loads the Excalidraw library at runtime and exposes it via the `excalidrawLib`
global. This is available in Excalidraw scripts and provides direct access to all exported
library functions.

```javascript
// Available functions from excalidrawLib:
const {
  convertToExcalidrawElements,
  exportToCanvas,
  exportToBlob,
  exportToSvg,
  exportToClipboard,
  restoreElements,
  restoreAppState,
  restore,
  restoreLibraryItems,
  serializeAsJSON,
  serializeLibraryAsJSON,
  loadFromBlob,
  loadLibraryFromBlob,
  getSceneVersion,
  getNonDeletedElements,
  isLinearElement,
  isInvisiblySmallElement,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
  getCommonBounds,
  elementsOverlappingBBox,
  isElementInsideBBox,
  FONT_FAMILY,
  THEME,
  MIME_TYPES,
} = excalidrawLib;
```

**2. The `ea.getExcalidrawAPI()` method**

ExcalidrawAutomate provides a method to get the imperative API handle for the current view's
Excalidraw React component instance:

```javascript
const api = ea.getExcalidrawAPI();
// Now you can call: api.getSceneElements(), api.updateScene(), etc.
```

This gives you direct access to the React component's imperative methods — the same API
that the standalone `@excalidraw/excalidraw` library exposes via the `excalidrawAPI` callback
prop.

### When to Use Library APIs vs. EA

| Task | Use EA | Use Library API |
|------|--------|-----------------|
| Add a rectangle with text | `ea.addRect()` + `ea.addText()` | `convertToExcalidrawElements()` with label |
| Export to SVG | `ea.createSVG()` | `exportToSvg()` |
| Read current elements | `ea.getViewElements()` | `api.getSceneElements()` |
| Update the scene | `ea.addElementsToView()` | `api.updateScene()` |
| Create complex diagrams with bindings | Many EA calls | Single `convertToExcalidrawElements()` call |
| Check element bounds | Manual calculation | `getCommonBounds()`, `elementsOverlappingBBox()` |
| Coordinate transforms | Not available | `sceneCoordsToViewportCoords()` |

The general rule: **use EA for high-level operations** (it handles plugin-specific concerns
like markdown storage and caching) and **use library APIs for low-level scene queries, exports,
coordinate math, and bulk element creation** where the skeleton API is more concise.

---

## Part 2: ExcalidrawElementSkeleton — Simplified Element Creation

The `ExcalidrawElementSkeleton` API is one of the most powerful features of the library. It
provides a dramatically simplified way to create Excalidraw elements programmatically, compared
to specifying every single property of a full `ExcalidrawElement`.

### The Problem It Solves

A full `ExcalidrawElement` has dozens of required properties: `id`, `type`, `x`, `y`, `width`,
`height`, `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `strokeStyle`,
`roughness`, `opacity`, `groupIds`, `frameId`, `roundness`, `seed`, `version`, `versionNonce`,
`isDeleted`, `boundElements`, `updated`, `link`, `locked`, and more.

Creating elements by hand requires specifying all of these. The Skeleton API lets you specify
only what you care about — the rest gets sensible defaults.

### convertToExcalidrawElements()

This is the core function that transforms skeletons into fully-qualified elements.

**Signature:**

```typescript
convertToExcalidrawElements(
  elements: ExcalidrawElementSkeleton[],
  opts?: { regenerateIds: boolean }
): ExcalidrawElement[]
```

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `elements` | `ExcalidrawElementSkeleton[]` | — | Array of skeleton definitions |
| `opts` | `{ regenerateIds: boolean }` | `{ regenerateIds: true }` | Whether to regenerate element IDs. Set to `false` if you provide your own `id` values and want to preserve them. |

**Import:**

```javascript
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

// In Obsidian plugin scripts:
const { convertToExcalidrawElements } = excalidrawLib;
```

**Important:** You must call `convertToExcalidrawElements()` before passing skeletons to any
API that expects full elements (`initialData`, `updateScene`, etc.). Passing raw skeletons
will produce incorrect results.

### Basic Shapes: Rectangle, Ellipse, Diamond

The minimum required properties are `type`, `x`, and `y`. Everything else is optional.

```javascript
const elements = convertToExcalidrawElements([
  {
    type: "rectangle",
    x: 100,
    y: 250,
  },
  {
    type: "ellipse",
    x: 250,
    y: 250,
  },
  {
    type: "diamond",
    x: 380,
    y: 250,
  },
]);
```

This creates three shapes at the specified positions with default dimensions, colors, and styles.

**With additional styling properties:**

```javascript
convertToExcalidrawElements([
  {
    type: "rectangle",
    x: 50,
    y: 250,
    width: 200,
    height: 100,
    backgroundColor: "#c0eb75",
    strokeWidth: 2,
  },
  {
    type: "ellipse",
    x: 300,
    y: 250,
    width: 200,
    height: 100,
    backgroundColor: "#ffc9c9",
    strokeStyle: "dotted",
    fillStyle: "solid",
    strokeWidth: 2,
  },
  {
    type: "diamond",
    x: 550,
    y: 250,
    width: 200,
    height: 100,
    backgroundColor: "#a5d8ff",
    strokeColor: "#1971c2",
    strokeStyle: "dashed",
    fillStyle: "cross-hatch",
    strokeWidth: 2,
  },
]);
```

You can pass any standard `ExcalidrawElement` properties alongside the minimum required ones.
Common styling properties include:

- `width`, `height` — dimensions (defaults applied if omitted)
- `strokeColor` — outline color (default: `"#1e1e1e"`)
- `backgroundColor` — fill color (default: `"transparent"`)
- `fillStyle` — `"hachure"`, `"solid"`, `"cross-hatch"`, `"zigzag"` (default: `"hachure"`)
- `strokeWidth` — line thickness: `1`, `2`, `4` (default: `2`)
- `strokeStyle` — `"solid"`, `"dashed"`, `"dotted"` (default: `"solid"`)
- `roughness` — `0` (architect), `1` (artist), `2` (cartoonist) (default: `1`)
- `opacity` — `0` to `100` (default: `100`)
- `roundness` — `null` (sharp corners) or `{ type: 3 }` (rounded)
- `locked` — whether the element can be selected/moved
- `link` — URL or internal link
- `customData` — arbitrary `Record<string, any>` for your own metadata

### Text Elements

Text elements require the `text` property in addition to `type`, `x`, and `y`.

```javascript
convertToExcalidrawElements([
  {
    type: "text",
    x: 100,
    y: 100,
    text: "HELLO WORLD!",
  },
  {
    type: "text",
    x: 100,
    y: 150,
    text: "STYLED HELLO WORLD!",
    fontSize: 20,
    strokeColor: "#5f3dc4",
  },
]);
```

Text-specific properties:

- `text` — the text content (required, supports `\n` for line breaks)
- `fontSize` — pixel size (default: `20`)
- `fontFamily` — numeric font family ID: `1` (Excalifont/hand-drawn), `2` (Nunito/normal),
  `3` (Comic Shanns/code)
- `textAlign` — `"left"`, `"center"`, `"right"` (default: `"left"` for standalone, `"center"`
  for containers)
- `verticalAlign` — `"top"`, `"middle"` (default: `"middle"` for containers)

### Lines and Arrows

Lines and arrows require only `type`, `x`, and `y`. The default creates a horizontal line/arrow.

```javascript
convertToExcalidrawElements([
  {
    type: "arrow",
    x: 100,
    y: 20,
  },
  {
    type: "line",
    x: 100,
    y: 60,
  },
]);
```

**With additional properties:**

```javascript
convertToExcalidrawElements([
  {
    type: "arrow",
    x: 450,
    y: 20,
    startArrowhead: "circle",
    endArrowhead: "triangle",
    strokeColor: "#1971c2",
    strokeWidth: 2,
  },
  {
    type: "line",
    x: 450,
    y: 60,
    strokeColor: "#2f9e44",
    strokeWidth: 2,
    strokeStyle: "dotted",
  },
]);
```

Arrow/line-specific properties:

- `startArrowhead` — `null`, `"arrow"`, `"bar"`, `"circle"`, `"triangle"` (arrows only)
- `endArrowhead` — same values (arrows default to `"arrow"` at the end)
- `points` — array of `[x, y]` offsets from the element origin for multi-segment lines

### Text Containers — Shapes with Embedded Text

This is where the skeleton API truly shines. Creating a shape with centered text normally
requires creating two separate elements (the shape and the text) and setting up the binding
between them. With skeletons, you just add a `label` property.

The `label` property requires at minimum a `text` attribute. All other label attributes are
optional.

```javascript
convertToExcalidrawElements([
  {
    type: "rectangle",
    x: 300,
    y: 290,
    label: {
      text: "RECTANGLE TEXT CONTAINER",
    },
  },
  {
    type: "ellipse",
    x: 500,
    y: 100,
    label: {
      text: "ELLIPSE\n TEXT CONTAINER",
    },
  },
  {
    type: "diamond",
    x: 100,
    y: 100,
    label: {
      text: "DIAMOND\nTEXT CONTAINER",
    },
  },
]);
```

**Key behavior:** If you do not provide explicit dimensions (`width`/`height`) for the container,
the skeleton API **automatically calculates them** based on the label text dimensions. This is
extremely convenient for creating properly-sized boxes around text.

**With styling on both container and label:**

```javascript
convertToExcalidrawElements([
  {
    type: "diamond",
    x: -120,
    y: 100,
    width: 270,
    backgroundColor: "#fff3bf",
    strokeWidth: 2,
    label: {
      text: "STYLED DIAMOND TEXT CONTAINER",
      strokeColor: "#099268",
      fontSize: 20,
    },
  },
  {
    type: "rectangle",
    x: 180,
    y: 150,
    width: 200,
    strokeColor: "#c2255c",
    label: {
      text: "TOP LEFT ALIGNED RECTANGLE TEXT CONTAINER",
      textAlign: "left",
      verticalAlign: "top",
      fontSize: 20,
    },
  },
  {
    type: "ellipse",
    x: 400,
    y: 130,
    strokeColor: "#f08c00",
    backgroundColor: "#ffec99",
    width: 200,
    label: {
      text: "STYLED ELLIPSE TEXT CONTAINER",
      strokeColor: "#c2255c",
    },
  },
]);
```

The `label` object supports these properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | `string` | — | The label text (required) |
| `fontSize` | `number` | `20` | Font size in pixels |
| `fontFamily` | `number` | `1` | Font family ID |
| `strokeColor` | `string` | Inherits from parent | Text color |
| `textAlign` | `string` | `"center"` | Horizontal alignment |
| `verticalAlign` | `string` | `"middle"` | Vertical alignment |

### Labeled Arrows

Arrows can also have labels, using the same `label` property:

```javascript
convertToExcalidrawElements([
  {
    type: "arrow",
    x: 100,
    y: 100,
    label: {
      text: "LABELED ARROW",
    },
  },
  {
    type: "arrow",
    x: 100,
    y: 200,
    label: {
      text: "STYLED LABELED ARROW",
      strokeColor: "#099268",
      fontSize: 20,
    },
  },
  {
    type: "arrow",
    x: 100,
    y: 300,
    strokeColor: "#1098ad",
    strokeWidth: 2,
    label: {
      text: "ANOTHER STYLED LABELLED ARROW",
    },
  },
]);
```

The label is positioned at the midpoint of the arrow by default.

### Arrow Bindings — Connecting Elements

Arrow bindings are the most powerful skeleton feature. Normally, binding an arrow to shapes
requires manually calculating positions, setting `boundElements` on both ends, and managing
the `startBinding`/`endBinding` properties. The skeleton API handles all of this.

You specify `start` and `end` properties on an arrow. Each can contain either:
- A `type` property to create a new shape at that endpoint, or
- An `id` property to bind to an existing element

**Creating new shapes at endpoints:**

```javascript
convertToExcalidrawElements([
  {
    type: "arrow",
    x: 255,
    y: 239,
    label: {
      text: "HELLO WORLD!!",
    },
    start: {
      type: "rectangle",
    },
    end: {
      type: "ellipse",
    },
  },
]);
```

This single skeleton definition creates **three** elements: a rectangle, an arrow, and an
ellipse — all properly bound together. When positions for `start` and `end` are not specified,
they are computed automatically based on the arrow position.

**With text at endpoints:**

```javascript
convertToExcalidrawElements([
  {
    type: "arrow",
    x: 255,
    y: 239,
    label: {
      text: "HELLO WORLD!!",
    },
    start: {
      type: "text",
      text: "HEYYYYY",
    },
    end: {
      type: "text",
      text: "WHATS UP ?",
    },
  },
]);
```

**Binding to existing elements by ID:**

This is essential when you want to connect multiple arrows to the same shape, or bind arrows
to elements that already exist.

```javascript
convertToExcalidrawElements([
  {
    type: "ellipse",
    id: "ellipse-1",
    strokeColor: "#66a80f",
    x: 390,
    y: 356,
    width: 150,
    height: 150,
    backgroundColor: "#d8f5a2",
  },
  {
    type: "diamond",
    id: "diamond-1",
    strokeColor: "#9c36b5",
    width: 100,
    x: -30,
    y: 380,
  },
  {
    type: "arrow",
    x: 100,
    y: 440,
    width: 295,
    height: 35,
    strokeColor: "#1864ab",
    start: {
      type: "rectangle",
      width: 150,
      height: 150,
    },
    end: {
      id: "ellipse-1",
    },
  },
  {
    type: "arrow",
    x: 60,
    y: 420,
    width: 330,
    strokeColor: "#e67700",
    start: {
      id: "diamond-1",
    },
    end: {
      id: "ellipse-1",
    },
  },
]);
```

In this example:
- The first arrow creates a new rectangle at its start and binds its end to `"ellipse-1"`
- The second arrow binds its start to `"diamond-1"` and its end to `"ellipse-1"`
- Both arrows share the same endpoint (the ellipse), which is declared once with a stable `id`

**Important:** When using `id` references, set `opts.regenerateIds` to `false` to preserve
your custom IDs, OR define the target elements in the same `convertToExcalidrawElements()`
call so the API can resolve the references before regenerating.

### Frames

Frames group elements visually. The skeleton requires `type: "frame"` and a `children` array
of element IDs.

```typescript
// Frame skeleton type
{
  type: "frame";
  children: readonly ExcalidrawElement["id"][];
  name?: string;
} & Partial<ExcalidrawFrameElement>
```

**Example:**

```javascript
convertToExcalidrawElements([
  {
    type: "rectangle",
    x: 10,
    y: 10,
    strokeWidth: 2,
    id: "1",
  },
  {
    type: "diamond",
    x: 120,
    y: 20,
    backgroundColor: "#fff3bf",
    strokeWidth: 2,
    label: {
      text: "HELLO EXCALIDRAW",
      strokeColor: "#099268",
      fontSize: 30,
    },
    id: "2",
  },
  {
    type: "frame",
    children: ["1", "2"],
    name: "My frame",
  },
]);
```

**Critical ordering requirement:** Frame children MUST appear BEFORE the frame element in the
elements array. See [Part 8: Frames — Ordering Constraint](#part-8-frames--ordering-constraint)
for details.

### The `regenerateIds` Option

By default, `convertToExcalidrawElements()` regenerates IDs for all elements regardless of
whether you provide them. This is safe for most use cases.

Set `regenerateIds: false` when:
- You are updating existing elements and need to preserve their IDs
- You are referencing elements by ID in arrow bindings and defining them in separate calls
- You are serializing and deserializing elements and need stable identifiers

```javascript
const elements = convertToExcalidrawElements(skeletons, { regenerateIds: false });
```

### Complete Comparison: Manual EA Creation vs. Skeleton API

Here is the same diagram created both ways — a flowchart with two boxes connected by a
labeled arrow.

**Using ExcalidrawAutomate (EA):**

```javascript
// Step 1: Create the first box
ea.style.strokeColor = "#1e1e1e";
ea.style.backgroundColor = "#a5d8ff";
ea.style.fillStyle = "solid";
ea.style.strokeWidth = 2;
const box1Id = ea.addRect(0, 0, 200, 80);

// Step 2: Add text to the first box
ea.style.fontSize = 20;
const text1Id = ea.addText(100, 40, "Start Here", {
  textAlign: "center",
  textVerticalAlign: "middle",
  box: box1Id,
});

// Step 3: Create the second box
ea.style.backgroundColor = "#b2f2bb";
const box2Id = ea.addRect(400, 0, 200, 80);

// Step 4: Add text to the second box
const text2Id = ea.addText(500, 40, "End Here", {
  textAlign: "center",
  textVerticalAlign: "middle",
  box: box2Id,
});

// Step 5: Create the connecting arrow
ea.style.backgroundColor = "transparent";
const arrowId = ea.addArrow([
  [200, 40],
  [400, 40],
]);

// Step 6: Add to view
await ea.addElementsToView(false, false);
```

**Using the Skeleton API:**

```javascript
const { convertToExcalidrawElements } = excalidrawLib;

const elements = convertToExcalidrawElements([
  {
    type: "rectangle",
    id: "box1",
    x: 0, y: 0, width: 200, height: 80,
    backgroundColor: "#a5d8ff",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "Start Here" },
  },
  {
    type: "rectangle",
    id: "box2",
    x: 400, y: 0, width: 200, height: 80,
    backgroundColor: "#b2f2bb",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "End Here" },
  },
  {
    type: "arrow",
    x: 200, y: 40,
    width: 200,
    start: { id: "box1" },
    end: { id: "box2" },
    label: { text: "Next Step" },
  },
]);

// Then use the API or EA to add these to the view
const api = ea.getExcalidrawAPI();
api.updateScene({
  elements: [...api.getSceneElements(), ...elements],
  captureUpdate: CaptureUpdateAction.IMMEDIATELY,
});
```

The skeleton approach is:
- More declarative and easier to read
- Handles binding automatically (no manual binding setup)
- Creates text containers with a single property (`label`) instead of separate elements
- Calculates dimensions automatically when omitted

---

## Part 3: ExcalidrawAPI — The Imperative React Interface

The `ExcalidrawAPI` is the imperative interface to the Excalidraw React component. It provides
direct access to read and modify the scene, manage the library, control navigation, handle
events, and more.

### Obtaining the API

In the standalone library, you get it via a callback prop:

```jsx
const [excalidrawAPI, setExcalidrawAPI] = useState(null);
<Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
```

In the Obsidian plugin, you get it via ExcalidrawAutomate:

```javascript
const api = ea.getExcalidrawAPI();
```

The plugin's `ExcalidrawView` stores this internally as `this.excalidrawAPI` and uses it
extensively throughout the view lifecycle.

### API Methods Reference

| API | Signature | Description |
|-----|-----------|-------------|
| `updateScene` | `(scene: SceneData) => void` | Update elements, appState, and/or collaborators |
| `updateLibrary` | `(opts) => Promise<LibraryItems>` | Update the element library |
| `addFiles` | `(files: BinaryFileData) => void` | Add files to the scene cache |
| `resetScene` | `(opts?) => void` | Clear the scene |
| `getSceneElements` | `() => NonDeleted<ExcalidrawElement[]>` | Get all non-deleted elements |
| `getSceneElementsIncludingDeleted` | `() => ExcalidrawElement[]` | Get all elements including deleted |
| `getAppState` | `() => AppState` | Get current application state |
| `getFiles` | `() => BinaryFiles` | Get all files in the scene |
| `history` | `{ clear: () => void }` | History management |
| `scrollToContent` | `(target?, opts?) => void` | Scroll/zoom to elements |
| `refresh` | `() => void` | Recompute component offsets |
| `setToast` | `(toast) => void` | Show a toast notification |
| `setActiveTool` | `(tool) => void` | Set the active drawing tool |
| `setCursor` | `(cursor: string) => void` | Set custom cursor |
| `resetCursor` | `() => void` | Reset to default cursor |
| `toggleSidebar` | `(opts) => boolean` | Toggle sidebar visibility |
| `onChange` | `(callback) => () => void` | Subscribe to change events |
| `onPointerDown` | `(callback) => () => void` | Subscribe to pointer down events |
| `onPointerUp` | `(callback) => () => void` | Subscribe to pointer up events |
| `id` | `string` | Unique instance identifier |

### Scene Reading Methods

#### getSceneElements()

```typescript
() => NonDeleted<ExcalidrawElement[]>
```

Returns all elements in the scene that are **not** marked as deleted. This is the standard
way to read the current visible scene.

```javascript
const api = ea.getExcalidrawAPI();
const elements = api.getSceneElements();
console.log(`Scene has ${elements.length} visible elements`);
```

#### getSceneElementsIncludingDeleted()

```typescript
() => ExcalidrawElement[]
```

Returns **all** elements including those with `isDeleted: true`. Deleted elements are kept
in the scene data for undo/redo support. Use this when you need to inspect the full history
or find recently-deleted elements.

```javascript
const allElements = api.getSceneElementsIncludingDeleted();
const deletedElements = allElements.filter(el => el.isDeleted);
console.log(`${deletedElements.length} elements in trash`);
```

#### getAppState()

```typescript
() => AppState
```

Returns the current application state object. This includes:

- **View state:** `scrollX`, `scrollY`, `zoom`, `width`, `height`
- **Selection:** `selectedElementIds`, `selectedGroupIds`
- **Current tool:** `activeTool`
- **Styling defaults:** `currentItemStrokeColor`, `currentItemBackgroundColor`,
  `currentItemFillStyle`, `currentItemFontFamily`, `currentItemFontSize`, etc.
- **Mode flags:** `viewModeEnabled`, `zenModeEnabled`, `gridSize`
- **Theme:** `theme` (`"light"` or `"dark"`)
- **Export settings:** `exportBackground`, `exportWithDarkMode`, `exportEmbedScene`

```javascript
const appState = api.getAppState();
console.log(`Theme: ${appState.theme}`);
console.log(`Zoom: ${appState.zoom.value}`);
console.log(`Selected: ${Object.keys(appState.selectedElementIds).length} elements`);
```

#### getFiles()

```typescript
() => BinaryFiles
```

Returns all files (images) cached in the scene. The returned object maps file IDs (SHA-1
hashes) to `BinaryFileData` objects containing the `dataURL`, `mimeType`, `created`, and
`lastRetrieved` timestamps.

**Note:** The files collection may contain files that are not referenced by any current
element. If persisting files to storage, compare against scene elements first.

```javascript
const files = api.getFiles();
const fileIds = Object.keys(files);
console.log(`Scene has ${fileIds.length} cached files`);
```

### Scene Updating Methods

#### updateScene()

```typescript
(scene: {
  elements?: ImportedDataState["elements"];
  appState?: ImportedDataState["appState"];
  collaborators?: Map<string, Collaborator>;
  captureUpdate?: CaptureUpdateAction;
}) => void
```

The primary method for modifying the scene. All properties are optional — you can update just
elements, just appState, or both.

```javascript
const api = ea.getExcalidrawAPI();

// Update elements
api.updateScene({
  elements: [
    {
      type: "rectangle",
      version: 141,
      versionNonce: 361174001,
      isDeleted: false,
      id: "oDVXy8D6rom3H1-LLH2-f",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 100,
      y: 93,
      strokeColor: "#c92a2a",
      backgroundColor: "transparent",
      width: 186,
      height: 142,
      seed: 1968410350,
      groupIds: [],
      boundElements: null,
      locked: false,
      link: null,
      updated: 1,
      roundness: { type: 3, value: 32 },
    },
  ],
  appState: {
    viewBackgroundColor: "#edf2ff",
  },
  captureUpdate: CaptureUpdateAction.IMMEDIATELY,
});
```

**The `captureUpdate` parameter** controls undo/redo behavior and is critical to use correctly:

#### CaptureUpdateAction Enum

| Value | Constant | When to Use | Undo/Redo Behavior |
|-------|----------|-------------|-------------------|
| Immediately undoable | `CaptureUpdateAction.IMMEDIATELY` | Most local user-driven updates | Update appears on the undo stack immediately |
| Eventually undoable | `CaptureUpdateAction.EVENTUALLY` | Async multi-step processes | Update is captured with the next `IMMEDIATELY` update |
| Never undoable | `CaptureUpdateAction.NEVER` | Remote/collaboration updates, scene initialization | Never appears on undo/redo stacks |

**When to use each:**

- **`IMMEDIATELY`** — Default for most cases. The user performed an action and should be able
  to undo it. Example: adding elements programmatically in response to a user clicking a button.

- **`EVENTUALLY`** — For intermediate steps in a multi-step operation. Example: updating
  element positions during a drag animation — only the final position should be undoable, not
  every intermediate frame.

- **`NEVER`** — For scene initialization (loading saved data), remote collaboration updates,
  or any change that should not be undoable. Example: loading a scene from storage on startup.

**Note:** Some updates are never observed by the store regardless of `captureUpdate` — updates
to `collaborators` and non-observed parts of `AppState` will never make it to undo/redo stacks.

#### updateLibrary()

```typescript
(opts: {
  libraryItems: LibraryItemsSource;
  merge?: boolean;       // default: false
  prompt?: boolean;      // default: false
  openLibraryMenu?: boolean;  // default: false
  defaultStatus?: "unpublished" | "published";  // default: "unpublished"
}) => Promise<LibraryItems>
```

Updates the element library (the sidebar collection of reusable element groups).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `libraryItems` | `LibraryItemsSource` | — | The library items to set/merge |
| `merge` | `boolean` | `false` | If `true`, merges with existing items. If `false`, replaces them. |
| `prompt` | `boolean` | `false` | If `true`, shows a confirmation prompt to the user |
| `openLibraryMenu` | `boolean` | `false` | If `true`, opens the library sidebar after updating |
| `defaultStatus` | `"unpublished" \| "published"` | `"unpublished"` | Default status for items without an explicit status |

```javascript
const api = ea.getExcalidrawAPI();

const libraryItems = [
  {
    status: "published",
    id: "my-item-1",
    created: Date.now(),
    elements: [/* array of ExcalidrawElements */],
  },
];

await api.updateLibrary({
  libraryItems,
  merge: true,
  openLibraryMenu: true,
});
```

#### addFiles()

```typescript
(files: BinaryFileData[]) => void
```

Adds file data to the scene's file cache. Files are typically images referenced by `image`
type elements.

```javascript
api.addFiles([
  {
    id: "file-hash-123",
    mimeType: "image/png",
    dataURL: "data:image/png;base64,iVBORw0KGgo...",
    created: Date.now(),
    lastRetrieved: Date.now(),
  },
]);
```

### Navigation and UI Methods

#### scrollToContent()

```typescript
(
  target?: ExcalidrawElement | ExcalidrawElement[],
  opts?: {
    fitToContent?: boolean;
    animate?: boolean;
    duration?: number;
  } | {
    fitToViewport?: boolean;
    viewportZoomFactor?: number;
    animate?: boolean;
    duration?: number;
  }
) => void
```

Scrolls and optionally zooms to show the target elements. If no target is provided, scrolls
to show all scene elements.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fitToContent` | `boolean` | `false` | Auto-zoom to fit elements (zoom range: 10%-100%) |
| `fitToViewport` | `boolean` | `false` | Like `fitToContent` but zoom can exceed 100% |
| `viewportZoomFactor` | `number` | `0.7` | When `fitToViewport=true`, how much screen to fill (0.1 to 1.0) |
| `animate` | `boolean` | `false` | Animate the scroll/zoom transition |
| `duration` | `number` | `500` | Animation duration in milliseconds |

```javascript
const api = ea.getExcalidrawAPI();

// Scroll to show all elements, animated
api.scrollToContent(undefined, { fitToContent: true, animate: true });

// Scroll to a specific element
const elements = api.getSceneElements();
const target = elements.find(el => el.id === "my-element");
api.scrollToContent(target, { fitToViewport: true, viewportZoomFactor: 0.5 });
```

**Note:** For larger scenes, animation may not be smooth due to rendering performance.

#### refresh()

```typescript
() => void
```

Recomputes the offsets for the Excalidraw component. You do NOT need to call this for page
scroll or container resize (those are handled automatically). Call it when the component's
position changes due to parent container scrolling or layout changes.

#### setToast()

```typescript
({ message: string; closable?: boolean; duration?: number } | null) => void
```

Shows a toast notification at the bottom of the canvas.

| Attribute | Type | Description |
|-----------|------|-------------|
| `message` | `string` | The message to display |
| `closable` | `boolean` | Whether to show a dismiss button |
| `duration` | `number` | Auto-dismiss delay in ms. Pass `Infinity` to prevent auto-dismiss. |

```javascript
// Show a toast
api.setToast({ message: "Export complete!", closable: true, duration: 3000 });

// Dismiss an existing toast
api.setToast(null);
```

#### setActiveTool()

```typescript
(
  tool: (
    | { type: ToolType }
    | { type: "custom"; customType: string }
  ) & { locked?: boolean }
) => void
```

Sets the active drawing tool. `ToolType` includes: `"selection"`, `"rectangle"`, `"diamond"`,
`"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`,
`"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `ToolType` | `"selection"` | The tool to activate |
| `locked` | `boolean` | `false` | Whether to lock the tool (same as clicking the lock icon) |

```javascript
// Switch to rectangle tool
api.setActiveTool({ type: "rectangle" });

// Switch to arrow tool and lock it (draws multiple arrows without switching back)
api.setActiveTool({ type: "arrow", locked: true });

// Switch back to selection
api.setActiveTool({ type: "selection" });
```

#### setCursor() and resetCursor()

```typescript
setCursor(cursor: string): void
resetCursor(): void
```

Customize the mouse cursor on the canvas. The `cursor` parameter accepts any valid CSS
cursor value.

```javascript
api.setCursor("crosshair");
// ... later
api.resetCursor();
```

#### toggleSidebar()

```typescript
(opts: { name: string; tab?: string; force?: boolean }) => boolean
```

Toggles a sidebar panel. Returns `true` if the sidebar was toggled on, `false` if toggled off.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | The sidebar name (e.g., `"library"`) |
| `tab` | `string` | Optional tab within the sidebar |
| `force` | `boolean` | If provided, forces the sidebar on (`true`) or off (`false`) |

```javascript
// Toggle the library sidebar
api.toggleSidebar({ name: "library" });

// Force-open a custom sidebar
api.toggleSidebar({ name: "customSidebar", force: true });
```

### History

```typescript
history: {
  clear: () => void;
}
```

Currently exposes only `clear()`, which wipes the undo/redo history.

```javascript
api.history.clear();
```

### Scene Management

#### resetScene()

```typescript
(opts?: { resetLoadingState: boolean }) => void
```

Clears the scene entirely. If `resetLoadingState` is `true`, also forces the loading state
to `false` (useful if the scene got stuck in a loading state).

#### id

```typescript
id: string
```

A unique identifier for this Excalidraw component instance. Useful when you have multiple
Excalidraw components on the same page and need to distinguish between them (e.g., for library
import routing).

### Event Subscriptions

These methods subscribe to events and return an **unsubscribe function**. Always store the
return value and call it during cleanup to prevent memory leaks.

#### onChange()

```typescript
(
  callback: (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void
) => () => void
```

Subscribes to all scene change events. This is the imperative equivalent of the `onChange`
prop on the React component.

```javascript
const api = ea.getExcalidrawAPI();
const unsubscribe = api.onChange((elements, appState, files) => {
  console.log(`Scene changed: ${elements.length} elements`);
});

// Later, when done:
unsubscribe();
```

#### onPointerDown()

```typescript
(
  callback: (
    activeTool: AppState["activeTool"],
    pointerDownState: PointerDownState,
    event: React.PointerEvent<HTMLElement>,
  ) => void
) => () => void
```

Subscribes to canvas pointer-down events. Receives the active tool at the time of the event,
the internal pointer state, and the original React pointer event.

```javascript
const unsubscribe = api.onPointerDown((activeTool, state, event) => {
  console.log(`Pointer down with tool: ${activeTool.type}`);
});
```

#### onPointerUp()

```typescript
(
  callback: (
    activeTool: AppState["activeTool"],
    pointerDownState: PointerDownState,
    event: PointerEvent,
  ) => void
) => () => void
```

Subscribes to canvas pointer-up events. Similar to `onPointerDown` but fires when the
pointer is released.

```javascript
const unsubscribe = api.onPointerUp((activeTool, state, event) => {
  console.log(`Pointer up with tool: ${activeTool.type}`);
});
```

---

## Part 4: Export Utilities

The export utilities convert Excalidraw scenes into various output formats. These are
standalone functions that work independently of the React component.

### exportToCanvas()

```typescript
exportToCanvas({
  elements: ExcalidrawElement[],
  appState?: AppState,
  files?: BinaryFiles,
  getDimensions?: (width: number, height: number) => {
    width: number;
    height: number;
    scale?: number;
  },
  maxWidthOrHeight?: number,
  exportPadding?: number,
}): Promise<HTMLCanvasElement>
```

Returns a promise that resolves to an `HTMLCanvasElement` containing the rendered scene.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `elements` | `ExcalidrawElement[]` | — | Elements to render |
| `appState` | `AppState` | Default state | Scene state (theme, background, etc.) |
| `files` | `BinaryFiles` | — | Image files referenced by elements |
| `getDimensions` | `function` | — | Custom function to compute canvas dimensions and scale |
| `maxWidthOrHeight` | `number` | — | Maximum dimension; overrides `getDimensions` |
| `exportPadding` | `number` | `10` | Padding around the exported content in pixels |

**Import:**

```javascript
import { exportToCanvas } from "@excalidraw/excalidraw";
// In plugin scripts:
const { exportToCanvas } = excalidrawLib;
```

**Example:**

```javascript
const api = ea.getExcalidrawAPI();
const elements = api.getSceneElements();
const files = api.getFiles();

const canvas = await exportToCanvas({
  elements,
  appState: {
    exportWithDarkMode: false,
    exportBackground: true,
    viewBackgroundColor: "#ffffff",
  },
  files,
  getDimensions: (width, height) => ({
    width: 800,
    height: 600,
    scale: 2, // 2x resolution for retina displays
  }),
});

// The canvas can be further manipulated
const ctx = canvas.getContext("2d");
ctx.font = "30px Virgil";
ctx.strokeText("My watermark", 50, 60);

// Convert to data URL for display
const dataUrl = canvas.toDataURL();
```

**The `getDimensions` callback:**

```typescript
(width: number, height: number) => {
  width: number;   // desired output width
  height: number;  // desired output height
  scale?: number;  // pixel density multiplier (default: 1)
}
```

The `width` and `height` parameters passed to this function are the natural dimensions of
the scene content. Your function returns the desired output dimensions and optional scale
factor.

### exportToBlob()

```typescript
exportToBlob({
  elements: ExcalidrawElement[],
  appState?: AppState,
  files?: BinaryFiles,
  getDimensions?: Function,
  mimeType?: string,
  quality?: number,
  exportPadding?: number,
}): Promise<Blob>
```

Returns a promise resolving to a `Blob` object. Internally uses `exportToCanvas()` then
calls `canvas.toBlob()`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mimeType` | `string` | `"image/png"` | Output format: `"image/png"`, `"image/jpeg"`, `"image/webp"` |
| `quality` | `number` | `0.92` | Quality for JPEG/WebP (0 to 1). Ignored for PNG. |
| `exportPadding` | `number` | `10` | Padding in pixels |
| (all `exportToCanvas` params) | | | See above |

```javascript
const blob = await exportToBlob({
  elements: api.getSceneElements(),
  appState: api.getAppState(),
  files: api.getFiles(),
  mimeType: "image/png",
  exportPadding: 20,
});

// Use the blob
const url = URL.createObjectURL(blob);
// Or convert to array buffer for saving
const buffer = await blob.arrayBuffer();
```

### exportToSvg()

```typescript
exportToSvg({
  elements: ExcalidrawElement[],
  appState?: AppState,
  files?: BinaryFiles,
  exportPadding?: number,
  metadata?: string,
}): Promise<SVGSVGElement>
```

Returns a promise resolving to an `SVGSVGElement` — a DOM node containing the vector
representation of the scene.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `elements` | `ExcalidrawElement[]` | — | Elements to render |
| `appState` | `AppState` | Default state | Scene state |
| `files` | `BinaryFiles` | — | Image files |
| `exportPadding` | `number` | `10` | Padding in pixels |
| `metadata` | `string` | — | Metadata string to embed in the SVG |

```javascript
const svgElement = await exportToSvg({
  elements: api.getSceneElements(),
  appState: {
    ...api.getAppState(),
    exportWithDarkMode: false,
    exportBackground: true,
  },
  files: api.getFiles(),
  exportPadding: 10,
});

// Convert to string
const svgString = svgElement.outerHTML;

// Or manipulate the DOM node
const textNodes = svgElement.querySelectorAll("text");
```

### exportToClipboard()

```typescript
exportToClipboard({
  elements: ExcalidrawElement[],
  appState?: AppState,
  files?: BinaryFiles,
  getDimensions?: Function,
  mimeType?: string,
  quality?: number,
  type: "png" | "svg" | "json",
}): Promise<void>
```

Copies the scene to the system clipboard in the specified format.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `"png" \| "svg" \| "json"` | — | The clipboard format |
| `mimeType` | `string` | `"image/png"` | Image format for PNG export |
| `quality` | `number` | `0.92` | Quality for JPEG/WebP |

```javascript
await exportToClipboard({
  elements: api.getSceneElements(),
  appState: api.getAppState(),
  files: api.getFiles(),
  type: "png",
});
```

### AppState Export Properties

These `appState` properties specifically control export behavior across all export functions:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `exportBackground` | `boolean` | `true` | Whether to include the background in the export |
| `viewBackgroundColor` | `string` | `"#ffffff"` | The background color when `exportBackground` is `true` |
| `exportWithDarkMode` | `boolean` | `false` | Whether to export in dark mode |
| `exportEmbedScene` | `boolean` | `false` | Whether to embed the full scene JSON in SVG/PNG metadata (increases file size but allows re-importing) |

---

## Part 5: Restore Utilities

Restore utilities validate, normalize, and fill in missing values for scene data. They are
essential when loading data from external sources, importing from clipboard, or migrating
between versions.

### restoreElements()

```typescript
restoreElements(
  elements: ImportedDataState["elements"],
  localElements: ExcalidrawElement[] | null | undefined,
  opts?: {
    refreshDimensions?: boolean;
    repairBindings?: boolean;
    normalizeIndices?: boolean;
  }
): ExcalidrawElement[]
```

Validates and fills in default values for all element properties. If any attribute is missing,
it will be set to its default.

| Parameter | Type | Description |
|-----------|------|-------------|
| `elements` | `ImportedDataState["elements"]` | The elements to restore |
| `localElements` | `ExcalidrawElement[] \| null` | Existing local elements (see below) |
| `opts.refreshDimensions` | `boolean` | Recalculate text element dimensions (costly, disable in tight loops) |
| `opts.repairBindings` | `boolean` | Fix broken container/text bindings |
| `opts.normalizeIndices` | `boolean` | Normalize fractional indices for ordering |

**The `localElements` parameter:**

When `localElements` are supplied, restored elements that already exist locally will reuse
the local element's `version` (incremented) and get a regenerated `versionNonce`. This is
important in collaboration scenarios — it prevents imported elements from being discarded
by version-based conflict resolution.

```javascript
const { restoreElements } = excalidrawLib;

// Basic restoration
const restoredElements = restoreElements(rawElements, null, {
  refreshDimensions: true,
  repairBindings: true,
});

// Restoration with local elements (collaboration scenario)
const currentElements = api.getSceneElements();
const restoredElements = restoreElements(importedElements, currentElements, {
  normalizeIndices: true,
});
```

### restoreAppState()

```typescript
restoreAppState(
  appState: ImportedDataState["appState"],
  localAppState: Partial<AppState> | null
): AppState
```

Validates appState and fills in defaults for any missing keys.

When `localAppState` is supplied, its values are used instead of defaults for any keys that
are `undefined` in the imported `appState`. This lets you preserve user preferences (like
theme, grid mode, etc.) when importing scene data.

```javascript
const { restoreAppState } = excalidrawLib;

// Basic restoration
const restoredState = restoreAppState(importedAppState, null);

// Preserve local user preferences
const currentState = api.getAppState();
const restoredState = restoreAppState(importedAppState, currentState);
```

### restore()

```typescript
restore(
  data: ImportedDataState,
  localAppState: Partial<AppState> | null | undefined,
  localElements: ExcalidrawElement[] | null | undefined,
  opts?: {
    refreshDimensions?: boolean;
    repairBindings?: boolean;
    normalizeIndices?: boolean;
  }
): DataState
```

Combined restoration of both elements and appState. This is a convenience function that
calls `restoreElements()` and `restoreAppState()` internally.

```javascript
const { restore } = excalidrawLib;

const restoredData = restore(
  { elements: rawElements, appState: rawAppState },
  currentAppState,  // local app state for defaults
  currentElements,  // local elements for version resolution
  { refreshDimensions: true, repairBindings: true }
);

// restoredData.elements — restored elements
// restoredData.appState — restored appState
```

### restoreLibraryItems()

```typescript
restoreLibraryItems(
  libraryItems: ImportedDataState["libraryItems"],
  defaultStatus: "published" | "unpublished"
): LibraryItems
```

Normalizes library items, adding missing values when needed.

```javascript
const { restoreLibraryItems } = excalidrawLib;

const normalizedItems = restoreLibraryItems(rawLibraryItems, "unpublished");
```

---

## Part 6: JSON Schema Specification

### The .excalidraw File Format

When saving an Excalidraw scene to a file, the JSON schema follows this structure:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",

  "elements": [
    {
      "id": "pologsyG-tAraPgiN9xP9b",
      "type": "rectangle",
      "x": 928,
      "y": 319,
      "width": 134,
      "height": 90
    }
  ],

  "appState": {
    "gridSize": 20,
    "viewBackgroundColor": "#ffffff"
  },

  "files": {
    "3cebd7720911620a3938ce77243696149da03861": {
      "mimeType": "image/png",
      "id": "3cebd7720911620a3938ce77243696149da03861",
      "dataURL": "data:image/png;base64,iVBORw0KGgo...",
      "created": 1690295874454,
      "lastRetrieved": 1690295874454
    }
  }
}
```

### Top-Level Attributes

| Attribute | Description | Example Value |
|-----------|-------------|---------------|
| `type` | Schema type identifier | `"excalidraw"` |
| `version` | Schema version number | `2` |
| `source` | Source application URL | `"https://excalidraw.com"` |
| `elements` | Array of element objects | `[...]` |
| `appState` | Application state/configuration | `{...}` |
| `files` | Map of file ID to file data | `{...}` |

### Element Properties

Every element has these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier (nanoid) |
| `type` | `string` | Element type: `"rectangle"`, `"ellipse"`, `"diamond"`, `"line"`, `"arrow"`, `"text"`, `"image"`, `"freedraw"`, `"frame"`, `"magicframe"`, `"embeddable"` |
| `x` | `number` | X position |
| `y` | `number` | Y position |
| `width` | `number` | Width |
| `height` | `number` | Height |
| `angle` | `number` | Rotation angle in radians |
| `strokeColor` | `string` | Outline/stroke color (hex) |
| `backgroundColor` | `string` | Fill color (hex or `"transparent"`) |
| `fillStyle` | `string` | `"hachure"`, `"solid"`, `"cross-hatch"`, `"zigzag"` |
| `strokeWidth` | `number` | Line thickness (1, 2, 4) |
| `strokeStyle` | `string` | `"solid"`, `"dashed"`, `"dotted"` |
| `roughness` | `number` | Hand-drawn roughness: 0 (architect), 1 (artist), 2 (cartoonist) |
| `opacity` | `number` | 0-100 |
| `groupIds` | `string[]` | IDs of groups this element belongs to |
| `frameId` | `string \| null` | ID of the containing frame |
| `roundness` | `object \| null` | Roundness config: `null` (sharp) or `{ type: 3 }` (round) |
| `seed` | `number` | Random seed for roughjs rendering (ensures consistent hand-drawn look) |
| `version` | `number` | Incremented on each modification |
| `versionNonce` | `number` | Random nonce for conflict resolution |
| `isDeleted` | `boolean` | Soft-delete flag (kept for undo) |
| `boundElements` | `Array \| null` | Elements bound to this one (text labels, arrows) |
| `updated` | `number` | Timestamp of last update |
| `link` | `string \| null` | URL or element link |
| `locked` | `boolean` | Whether element is locked from editing |
| `customData` | `Record<string, any>` | Optional custom metadata |

**Text elements additionally have:**

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | The text content |
| `fontSize` | `number` | Font size in pixels |
| `fontFamily` | `number` | Font family ID (1=Excalifont, 2=Nunito, 3=Comic Shanns) |
| `textAlign` | `string` | `"left"`, `"center"`, `"right"` |
| `verticalAlign` | `string` | `"top"`, `"middle"` |
| `containerId` | `string \| null` | ID of the container element (for text inside shapes) |
| `originalText` | `string` | The original unwrapped text |
| `autoResize` | `boolean` | Whether text auto-resizes |

**Linear elements (arrows, lines) additionally have:**

| Property | Type | Description |
|----------|------|-------------|
| `points` | `[number, number][]` | Array of `[x, y]` offsets from origin |
| `startBinding` | `object \| null` | Binding info for start point |
| `endBinding` | `object \| null` | Binding info for end point |
| `startArrowhead` | `string \| null` | `"arrow"`, `"bar"`, `"circle"`, `"triangle"`, or `null` |
| `endArrowhead` | `string \| null` | Same options |
| `lastCommittedPoint` | `[number, number] \| null` | Last committed point during drawing |

**Image elements additionally have:**

| Property | Type | Description |
|----------|------|-------------|
| `fileId` | `string` | Reference to a file in the `files` map |
| `status` | `string` | `"pending"`, `"saved"`, `"error"` |
| `scale` | `[number, number]` | Scale factors `[scaleX, scaleY]` |

### Files Map Structure

The `files` object maps file IDs (typically SHA-1 hashes) to file data:

```json
{
  "files": {
    "sha1-hash-here": {
      "mimeType": "image/png",
      "id": "sha1-hash-here",
      "dataURL": "data:image/png;base64,iVBORw0KGgo...",
      "created": 1690295874454,
      "lastRetrieved": 1690295874454
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `string` | MIME type: `"image/png"`, `"image/jpeg"`, `"image/svg+xml"`, `"image/gif"`, `"image/webp"`, etc. |
| `id` | `string` | File identifier (matches the key) |
| `dataURL` | `string` | Base64-encoded data URL |
| `created` | `number` | Unix timestamp of creation |
| `lastRetrieved` | `number` | Unix timestamp of last access |

### Clipboard Format

When copying selected elements to the clipboard, the format differs slightly:

| Attribute | Value |
|-----------|-------|
| `type` | `"excalidraw/clipboard"` (not `"excalidraw"`) |
| `elements` | Array of the selected elements |
| `files` | Files referenced by the selected elements |

Note: The clipboard format does NOT include `version`, `source`, or `appState`.

### How the Obsidian Plugin Stores This Data

The Obsidian plugin does NOT use `.excalidraw` files directly. Instead, it stores drawings as
`.md` (markdown) files with a special structure:

```markdown
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
# Excalidraw Data
## Text Elements
[text content for each text element]
## Element Links
[element links for searchability]
## Embedded Files
[file references]
## Drawing
```compressed-or-raw-json-here```
```

The JSON scene data (matching the schema above) is stored in the `## Drawing` section, either
as raw JSON or LZString-compressed. The other sections are derived data maintained for
Obsidian search integration. See [Guide 03: Data Layer](03-data-layer.md) for full details.

---

## Part 7: Constants

The library exports several constant objects for use in element creation and configuration.

### FONT_FAMILY

```javascript
import { FONT_FAMILY } from "@excalidraw/excalidraw";
// In plugin scripts: const { FONT_FAMILY } = excalidrawLib;
```

| Font Family | ID | Description |
|-------------|-----|-------------|
| `Excalifont` | `1` | The hand-drawn font (default) |
| `Nunito` | `2` | The normal/clean font |
| `Comic Shanns` | `3` | The code/monospace font |

The default font is `FONT_FAMILY.Excalifont` (1) unless overridden via
`initialData.appState.currentItemFontFamily`.

```javascript
// Create text with a specific font
const elements = convertToExcalidrawElements([
  {
    type: "text",
    x: 0, y: 0,
    text: "Code example",
    fontFamily: FONT_FAMILY["Comic Shanns"], // or just 3
  },
]);
```

### THEME

```javascript
import { THEME } from "@excalidraw/excalidraw";
// In plugin scripts: const { THEME } = excalidrawLib;
```

| Theme | Value | Description |
|-------|-------|-------------|
| `LIGHT` | `"light"` | Light theme (default) |
| `DARK` | `"dark"` | Dark theme |

Defaults to `THEME.LIGHT` unless passed in `initialData.appState.theme`.

```javascript
// Check current theme
const isDark = api.getAppState().theme === THEME.DARK;

// Set theme via updateScene
api.updateScene({
  appState: { theme: THEME.DARK },
  captureUpdate: CaptureUpdateAction.NEVER,
});
```

### MIME_TYPES

```javascript
import { MIME_TYPES } from "@excalidraw/excalidraw";
// In plugin scripts: const { MIME_TYPES } = excalidrawLib;
```

Contains all MIME types supported by Excalidraw. Key values include:

| Key | Value | Description |
|-----|-------|-------------|
| `excalidraw` | `"application/vnd.excalidraw+json"` | Excalidraw scene files |
| `excalidrawlib` | `"application/vnd.excalidrawlib+json"` | Excalidraw library files |
| `json` | `"application/json"` | Generic JSON |
| `png` | `"image/png"` | PNG images |
| `svg` | `"image/svg+xml"` | SVG images |
| `gif` | `"image/gif"` | GIF images |
| `webp` | `"image/webp"` | WebP images |
| `jpg` | `"image/jpeg"` | JPEG images |
| `binary` | `"application/octet-stream"` | Binary data |

These constants are useful for file type checking:

```javascript
const contents = await loadSceneOrLibraryFromBlob(file, null, null);
if (contents.type === MIME_TYPES.excalidraw) {
  api.updateScene(contents.data);
} else if (contents.type === MIME_TYPES.excalidrawlib) {
  api.updateLibrary(contents.data);
}
```

---

## Part 8: Frames — Ordering Constraint

Frames are container elements that visually group and clip their children. There is a
**critical ordering constraint** that must be respected.

### The Rule

**Frame children MUST come BEFORE the frame element in the elements array.**

```javascript
// CORRECT ordering:
[
  other_element,
  frame1_child1,   // child first
  frame1_child2,   // child first
  frame1,          // frame comes AFTER its children
  other_element,
  frame2_child1,   // child first
  frame2_child2,   // child first
  frame2,          // frame comes AFTER its children
  other_element,
]
```

### Why This Matters

1. **Rendering correctness** — The renderer clips frame children to the frame boundary. If
   children come after the frame in the array, they may not be clipped correctly or may
   render on top of the frame border.

2. **Performance optimizations** — The renderer relies on this ordering to efficiently
   determine which elements need clipping. It can stop processing frame children when it
   encounters the frame element itself.

3. **The editor tolerates incorrect ordering** — The editor will still function if elements
   are out of order, but visual artifacts and clipping errors will occur. Do not rely on
   the editor fixing this for you.

### Practical Implications

When creating frames programmatically:

```javascript
// CORRECT: children before frame
const elements = convertToExcalidrawElements([
  { type: "rectangle", id: "child1", x: 10, y: 10 },
  { type: "rectangle", id: "child2", x: 50, y: 10 },
  { type: "frame", children: ["child1", "child2"], name: "My Frame" },
]);

// The convertToExcalidrawElements() function handles ordering for you when
// using the skeleton API. But if you're manually constructing elements arrays,
// you must maintain this ordering yourself.
```

When modifying elements arrays directly (e.g., via `updateScene()`), ensure you preserve
this ordering:

```javascript
// When adding a new child to an existing frame, insert it BEFORE the frame element
const elements = api.getSceneElements();
const frameIndex = elements.findIndex(el => el.id === "my-frame");
const newChild = { /* ... */ frameId: "my-frame" };

const newElements = [
  ...elements.slice(0, frameIndex),
  newChild,           // insert before the frame
  ...elements.slice(frameIndex),
];
```

---

## Part 9: Mermaid-to-Excalidraw Conversion

The `@excalidraw/mermaid-to-excalidraw` package converts Mermaid diagram syntax into
Excalidraw elements. It works in two steps.

### parseMermaidToExcalidraw()

```typescript
parseMermaidToExcalidraw(
  mermaidSyntax: string,
  opts?: { fontSize?: number }
): Promise<{ elements: ExcalidrawElementSkeleton[]; files: BinaryFiles }>
```

Parses a Mermaid syntax string and returns skeleton elements and any generated files (for
diagram types rendered as images).

### Two-Step Process

The conversion requires two steps because the Excalidraw library is a UMD build that cannot
be tree-shaken:

```javascript
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

try {
  const { elements, files } = await parseMermaidToExcalidraw(mermaidSyntax, {
    fontSize: 16,
  });
  const excalidrawElements = convertToExcalidrawElements(elements);
  // Render elements and files on Excalidraw
} catch (e) {
  // Parse error — display error message to users
}
```

### Supported Diagram Types

#### Flowcharts (Full Support)

Flowcharts are the primary supported diagram type. Regular shapes are converted to native
Excalidraw elements:

- **Rectangles** — fully supported
- **Circles** — fully supported (mapped to ellipses)
- **Diamonds** — fully supported (decision nodes)
- **Arrows** — fully supported with labels

```
flowchart TD
  A[Christmas] -->|Get money| B(Go shopping)
  B --> C{Let me think}
  C -->|One| D[Laptop]
  C -->|Two| E[iPhone]
  C -->|Three| F[Car]
```

**Subgraphs** are supported — they are converted to grouped elements:

```
flowchart TB
  c1-->a2
  subgraph one
  a1-->a2
  end
  subgraph two
  b1-->b2
  end
  subgraph three
  c1-->c2
  end
```

#### Shapes That Fall Back to Rectangles

These Mermaid shapes do not have direct Excalidraw equivalents and are rendered as
rectangles:

- Subroutine (`[[...]]`)
- Cylindrical (`[(... )]`)
- Asymmetric (`>...]`)
- Hexagon (`{{...}}`)
- Parallelogram (`[/... /]`)
- Trapezoid (`[/...\]`)

#### Text Limitations

- Markdown strings (`` `Hello **World**` ``) fall back to regular text (no rich formatting)
- FontAwesome icons (`fa:fa-camera-retro`) are not rendered
- Cross arrowheads (`x--x`) fall back to bar arrowheads

### Unsupported Diagram Types (Rendered as Images)

All diagram types other than flowcharts are **rendered as rasterized images** embedded in
Excalidraw, not as native vector elements. This includes:

- ER diagrams
- Git graphs
- Sequence diagrams
- Gantt charts
- State diagrams
- Pie charts
- Journey maps
- Class diagrams (partial support — may work for simple diagrams)

The generated image is returned in the `files` object and referenced by an `image` element
in the skeletons array.

---

## Part 10: React Component Props Reference

The `<Excalidraw />` React component accepts the following props. All props are **optional**.

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `object \| Promise<object \| null>` | `null` | Initial scene data (elements, appState, files, libraryItems, scrollToContent) |
| `excalidrawAPI` | `(api: ExcalidrawAPI) => void` | — | Callback to receive the imperative API handle |
| `onChange` | `(elements, appState, files) => void` | — | Called on every scene change |
| `onPointerUpdate` | `({x, y}, button, pointersMap) => void` | — | Called when pointer moves |

### Event Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPointerDown` | `(activeTool, pointerDownState) => void` | — | Canvas pointer-down event |
| `onScrollChange` | `(scrollX, scrollY) => void` | — | Canvas scroll event |
| `onPaste` | `(data, event) => boolean` | — | Paste event; return `false` to prevent default paste behavior |
| `onLibraryChange` | `(items) => void \| Promise<any>` | — | Library update event |

### Link Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `generateLinkForSelection` | `(id, type) => string` | — | Override URL generation for element/group links |
| `onLinkOpen` | `(element, event) => void` | — | Link click handler; call `event.preventDefault()` to handle navigation yourself |

### Rendering Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderTopRightUI` | `function` | — | Render custom UI in top-right corner |
| `renderCustomStats` | `function` | — | Render custom stats in the stats dialog |
| `renderEmbeddable` | `function` | — | Override the built-in `<iframe>` for embeddable elements |
| `renderScrollbars` | `boolean` | `false` | Whether to render scrollbars |

### Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewModeEnabled` | `boolean` | — | Read-only view mode; when set, takes precedence over initialData |
| `zenModeEnabled` | `boolean` | — | Zen mode (minimal UI); when set, takes precedence over initialData |
| `gridModeEnabled` | `boolean` | — | Show grid; when set, takes precedence over initialData |
| `isCollaborating` | `boolean` | — | Indicates collaboration mode |

### Appearance Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `"light" \| "dark"` | `"light"` | Theme; takes precedence over initialData when set |
| `name` | `string` | — | Drawing name (used in export); takes precedence over initialData |
| `langCode` | `string` | `"en"` | UI language code |

### Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `UIOptions` | `object` | Default UI options | Customize canvas actions, toolbar, etc. |
| `autoFocus` | `boolean` | `false` | Focus component on page load |
| `detectScroll` | `boolean` | `true` | Listen for scroll events on ancestor containers |
| `handleKeyboardGlobally` | `boolean` | `false` | Bind keyboard events to `document` instead of component |
| `libraryReturnUrl` | `string` | `window.location.origin + pathname` | URL for library installation from libraries.excalidraw.com |

### Validation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `validateEmbeddable` | `boolean \| string[] \| RegExp \| RegExp[] \| ((link: string) => boolean \| undefined)` | — | Custom validation for embeddable URLs |
| `generateIdForFile` | `(file: File) => string \| Promise<string>` | SHA-1 digest | Override file ID generation |

### Storing Custom Data on Elements

Elements support a `customData` property of type `Record<string, any>`:

```javascript
{
  type: "rectangle",
  id: "oDVXy8D6rom3H1-LLH2-f",
  customData: { customId: "162", myField: "value" },
}
```

This can be set via `initialData`, `updateScene()`, or `updateLibrary()`. It is preserved
through serialization and restoration, making it useful for integrations that need to
attach metadata to elements.

### Key Behavior Notes

**Controlled vs. Uncontrolled Props:**

Several props (`viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `theme`, `name`) act
as **controlled props** when provided. When set:
- They take precedence over `initialData.appState` values
- The feature is fully controlled by the host app
- Users cannot toggle the feature from within the Excalidraw UI
  (except `theme` when `UIOptions.canvasActions.toggleTheme` is `true`)

**The `onChange` callback:**

This fires on every component update, not just element changes. It receives the full elements
array, appState, and files. Be cautious about expensive operations in this callback — it can
fire very frequently during drawing interactions.

**The `onPaste` callback:**

Must return a boolean (or a Promise resolving to a boolean). Return `false` to prevent the
default Excalidraw paste behavior. Return `true` to allow it.

```javascript
onPaste={(data, event) => {
  // Intercept paste and handle custom clipboard content
  if (data.text && data.text.startsWith("custom:")) {
    handleCustomPaste(data.text);
    return false; // prevent default
  }
  return true; // allow default paste
}}
```

---

## Part 11: CSS Customization

Excalidraw uses CSS custom properties (variables) for theming. You can override them to
customize the appearance.

### Selector Requirements

Override variables on the `.excalidraw` selector, with higher specificity by prefixing with
your app's selector:

```css
.your-app .excalidraw {
  --color-primary: red;
}
.your-app .excalidraw.theme--dark {
  --color-primary: pink;
}
```

**The specificity prefix is important.** Without it, your overrides may be defeated by the
library's own styles.

### Primary Color Variables

These are the most commonly customized variables:

| Variable | Description |
|----------|-------------|
| `--color-primary` | Primary UI color (buttons, selections, accents) |
| `--color-primary-darker` | Darker variant of primary color |
| `--color-primary-darkest` | Darkest variant of primary color |
| `--color-primary-light` | Light variant of primary color |
| `--color-primary-contrast-offset` | Slightly darker (light mode) or lighter (dark mode) variant to fix contrast issues (Chubb illusion). Falls back to `--color-primary` if not set. |

### Example: Custom Pink Theme

```css
.custom-styles .excalidraw {
  --color-primary: #fcc6d9;
  --color-primary-darker: #f783ac;
  --color-primary-darkest: #e64980;
  --color-primary-light: #f2a9c4;
}

.custom-styles .excalidraw.theme--dark {
  --color-primary: #d494aa;
  --color-primary-darker: #d64c7e;
  --color-primary-darkest: #e86e99;
  --color-primary-light: #dcbec9;
}
```

### Complete Variable List

For the full list of CSS variables, refer to the
[theme.scss](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/css/theme.scss)
file in the Excalidraw source. Most variables are internal implementation details and do not
make sense to override. Stick to the primary color variables listed above unless you have a
specific need.

### How the Obsidian Plugin Uses CSS Customization

The plugin manages CSS via its `StylesManager` (`src/core/managers/StylesManager.ts`), which
dynamically injects CSS including Excalidraw's own styles. The plugin merges Excalidraw's CSS
with its own `styles.css` at build time (via the rollup configuration and cssnano). If you
want to customize the appearance within Obsidian, you would use an Obsidian CSS snippet
targeting the `.excalidraw` class with appropriate specificity.

---

## Part 12: General Utility Functions

The library exports numerous utility functions for serialization, file loading, element
queries, geometry, and coordinate transformations.

### Serialization

#### serializeAsJSON()

```typescript
serializeAsJSON({
  elements: ExcalidrawElement[],
  appState: AppState,
}): string
```

Converts scene elements and state to a JSON string suitable for saving. Deleted elements and
most internal appState properties are stripped from the output.

**Tip:** You can set `window.EXCALIDRAW_EXPORT_SOURCE` to customize the `source` field in
the output JSON.

```javascript
const { serializeAsJSON } = excalidrawLib;

const json = serializeAsJSON({
  elements: api.getSceneElements(),
  appState: api.getAppState(),
});

// json is a string you can save to a file
```

#### serializeLibraryAsJSON()

```typescript
serializeLibraryAsJSON(libraryItems: LibraryItems[]): string
```

Converts library items to a JSON string for persistence.

```javascript
const { serializeLibraryAsJSON } = excalidrawLib;
const json = serializeLibraryAsJSON(libraryItems);
```

### File Loading

#### loadFromBlob()

```typescript
loadFromBlob(
  blob: Blob,
  localAppState: AppState | null,
  localElements: ExcalidrawElement[] | null,
  fileHandle?: FileSystemHandle | null
): Promise<RestoredDataState>
```

Loads scene data from a Blob (or File). Throws if the blob does not contain valid scene data.

When `localAppState` is provided, it is preferred over the `appState` derived from the blob
(preserving user preferences).

```javascript
const { loadFromBlob } = excalidrawLib;

const scene = await loadFromBlob(file, null, null);
api.updateScene(scene);
```

#### loadLibraryFromBlob()

```typescript
loadLibraryFromBlob(
  blob: Blob,
  defaultStatus: "published" | "unpublished"
): Promise<LibraryItems>
```

Loads library data from a Blob. The `defaultStatus` parameter sets the default status for
items that don't have one.

```javascript
const { loadLibraryFromBlob } = excalidrawLib;
const items = await loadLibraryFromBlob(file, "unpublished");
```

#### loadSceneOrLibraryFromBlob()

```typescript
loadSceneOrLibraryFromBlob(
  blob: Blob,
  localAppState: AppState | null,
  localElements: ExcalidrawElement[] | null,
  fileHandle?: FileSystemHandle | null
): Promise<{ type: string; data: RestoredDataState | ImportedLibraryState }>
```

Auto-detects whether the blob contains scene data or library data and loads accordingly.
Throws if the blob contains neither.

```javascript
const { loadSceneOrLibraryFromBlob, MIME_TYPES } = excalidrawLib;

const contents = await loadSceneOrLibraryFromBlob(file, null, null);
if (contents.type === MIME_TYPES.excalidraw) {
  api.updateScene(contents.data);
} else if (contents.type === MIME_TYPES.excalidrawlib) {
  api.updateLibrary({ libraryItems: contents.data });
}
```

### Element Query Functions

#### isInvisiblySmallElement()

```typescript
isInvisiblySmallElement(element: ExcalidrawElement): boolean
```

Returns `true` if the element is too small to be visible (e.g., zero width and height). Useful
for filtering out accidentally-created elements.

```javascript
const { isInvisiblySmallElement } = excalidrawLib;

const visibleElements = elements.filter(el => !isInvisiblySmallElement(el));
```

#### isLinearElement()

```typescript
isLinearElement(element?: ExcalidrawElement): boolean
```

Returns `true` if the element is a linear type (`"arrow"` or `"line"`).

```javascript
const { isLinearElement } = excalidrawLib;

const arrows = elements.filter(el => isLinearElement(el) && el.type === "arrow");
const lines = elements.filter(el => isLinearElement(el) && el.type === "line");
```

#### getNonDeletedElements()

```typescript
getNonDeletedElements(
  elements: readonly ExcalidrawElement[]
): readonly NonDeletedExcalidrawElement[]
```

Filters out elements where `isDeleted` is `true`. This is the same filtering that
`getSceneElements()` does internally.

```javascript
const { getNonDeletedElements } = excalidrawLib;

const allElements = api.getSceneElementsIncludingDeleted();
const activeElements = getNonDeletedElements(allElements);
// Equivalent to api.getSceneElements()
```

### Geometry and Bounds

#### getCommonBounds()

```typescript
getCommonBounds(
  elements: readonly ExcalidrawElement[]
): readonly [minX: number, minY: number, maxX: number, maxY: number]
```

Returns the bounding rectangle that encloses all the provided elements.

```javascript
const { getCommonBounds } = excalidrawLib;

const elements = api.getSceneElements();
const [minX, minY, maxX, maxY] = getCommonBounds(elements);

const totalWidth = maxX - minX;
const totalHeight = maxY - minY;
console.log(`Scene bounds: ${totalWidth} x ${totalHeight}`);
```

#### elementsOverlappingBBox()

```typescript
elementsOverlappingBBox(
  elements: readonly NonDeletedExcalidrawElement[],
  bounds: Bounds | ExcalidrawElement,
  errorMargin?: number,
  type: "overlap" | "contain" | "inside"
): NonDeletedExcalidrawElement[]
```

Filters elements based on their spatial relationship to a bounding rectangle.

| `type` | Behavior |
|--------|----------|
| `"overlap"` | Elements that overlap with or are inside the bounds |
| `"contain"` | Elements inside bounds OR bounds inside elements |
| `"inside"` | Elements that are fully inside the bounds |

The `errorMargin` parameter expands the bounds rectangle by that amount (useful for imprecise
selections).

**Note:** The bounds check is approximate and does not precisely follow curved element shapes.

```javascript
const { elementsOverlappingBBox } = excalidrawLib;

// Find all elements within a specific region
const region = [100, 100, 500, 400]; // [minX, minY, maxX, maxY]
const elementsInRegion = elementsOverlappingBBox(
  api.getSceneElements(),
  region,
  5,       // 5px error margin
  "inside" // only fully contained elements
);
```

#### isElementInsideBBox()

```typescript
isElementInsideBBox(
  element: NonDeletedExcalidrawElement,
  bounds: Bounds,
  eitherDirection?: boolean  // default: false
): boolean
```

Lower-level check for a single element against a bounding box.

- `eitherDirection = false` (default): returns `true` only if the element is fully inside bounds
- `eitherDirection = true`: returns `true` if element is inside bounds OR bounds is inside element

```javascript
const { isElementInsideBBox } = excalidrawLib;

const bounds = [0, 0, 500, 500];
const isInside = isElementInsideBBox(element, bounds);
```

#### elementPartiallyOverlapsWithOrContainsBBox()

```typescript
elementPartiallyOverlapsWithOrContainsBBox(
  element: NonDeletedExcalidrawElement,
  bounds: Bounds
): boolean
```

Checks if an element overlaps with or is fully inside the bounds rectangle.

### Coordinate Transformations

These functions convert between two coordinate systems:

- **Scene coordinates** — the logical coordinate space where elements are positioned
- **Viewport coordinates** — the screen/pixel coordinate space affected by scroll and zoom

#### sceneCoordsToViewportCoords()

```typescript
sceneCoordsToViewportCoords(
  { sceneX: number; sceneY: number },
  appState: AppState
): { x: number; y: number }
```

Converts scene coordinates to viewport (screen) coordinates, accounting for scroll position
and zoom level.

```javascript
const { sceneCoordsToViewportCoords } = excalidrawLib;

const appState = api.getAppState();
const viewportPos = sceneCoordsToViewportCoords(
  { sceneX: element.x, sceneY: element.y },
  appState
);
console.log(`Element is at screen position: ${viewportPos.x}, ${viewportPos.y}`);
```

#### viewportCoordsToSceneCoords()

```typescript
viewportCoordsToSceneCoords(
  { clientX: number; clientY: number },
  appState: AppState
): { x: number; y: number }
```

Converts viewport (screen/mouse) coordinates to scene coordinates. Commonly used to determine
where in the scene a user clicked.

```javascript
const { viewportCoordsToSceneCoords } = excalidrawLib;

const appState = api.getAppState();
const scenePos = viewportCoordsToSceneCoords(
  { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY },
  appState
);
console.log(`Clicked at scene position: ${scenePos.x}, ${scenePos.y}`);
```

### Scene Version

#### getSceneVersion()

```typescript
getSceneVersion(elements: ExcalidrawElement[]): number
```

Returns a version number for the current scene state. This is computed from element versions
and can be used to detect when the scene has changed (e.g., for auto-save triggers).

```javascript
const { getSceneVersion } = excalidrawLib;

let lastVersion = getSceneVersion(api.getSceneElements());

// Check periodically or on events
const currentVersion = getSceneVersion(api.getSceneElements());
if (currentVersion !== lastVersion) {
  console.log("Scene changed, saving...");
  lastVersion = currentVersion;
}
```

The plugin uses this in `ExcalidrawView` to track scene changes:

```typescript
// From ExcalidrawView.ts
this.excalidrawGetSceneVersion = this.packages.excalidrawLib.getSceneVersion;
```

### Library Utilities

#### mergeLibraryItems()

```typescript
mergeLibraryItems(
  localItems: LibraryItems,
  otherItems: LibraryItems
): LibraryItems
```

Merges two library item arrays. Unique items from `otherItems` are sorted first in the
returned array.

#### parseLibraryTokensFromUrl()

```typescript
parseLibraryTokensFromUrl(): {
  libraryUrl: string;
  idToken: string | null;
} | null
```

Parses library installation parameters from the URL hash (expects `#addLibrary`). Returns
`null` if the hash key is not found.

#### useHandleLibrary()

```typescript
useHandleLibrary(opts: {
  excalidrawAPI: ExcalidrawAPI;
  getInitialLibraryItems?: () => LibraryItemsSource;
}): void
```

A React hook that automatically handles library imports from URLs and initial library loading.

### Miscellaneous

#### getFreeDrawSvgPath()

```typescript
getFreeDrawSvgPath(element: ExcalidrawFreeDrawElement): string
```

Returns the SVG path string for a freedraw element. Useful for custom SVG rendering.

#### useEditorInterface()

```typescript
useEditorInterface(): EditorInterface
```

A React hook (must be used inside `<Excalidraw>` children) that returns device/viewport info:

| Property | Type | Description |
|----------|------|-------------|
| `formFactor` | `"phone" \| "tablet" \| "desktop"` | Device type based on screen size |
| `desktopUIMode` | `"compact" \| "full"` | UI mode for desktop |
| `userAgent.raw` | `string` | Raw user agent string |
| `userAgent.isMobileDevice` | `boolean` | Whether device is mobile |
| `userAgent.platform` | `"ios" \| "android" \| "other" \| "unknown"` | Platform |
| `isTouchScreen` | `boolean` | Whether touch events are detected |
| `canFitSidebar` | `boolean` | Whether sidebar fits in viewport |
| `isLandscape` | `boolean` | Whether viewport is landscape |

### i18n Exports

| Export | Type | Description |
|--------|------|-------------|
| `defaultLang` | `string` | Default language code (`"en"`) |
| `languages` | `Language[]` | List of supported language codes |
| `useI18n` | `() => { langCode, t }` | Hook for translations (use inside `<Excalidraw>`) |

---

## Part 13: Accessing Library APIs from Plugin Scripts

This section bridges the gap between the library-level APIs documented above and practical
use within Obsidian Excalidraw scripts.

### The excalidrawLib Global

In Excalidraw scripts (the `.md` scripts you run from the Excalidraw toolbar), the
`excalidrawLib` global is available. It provides access to all exported functions from the
`@zsviczian/excalidraw` package.

```javascript
// In an Excalidraw script:

// Destructure the functions you need
const {
  convertToExcalidrawElements,
  exportToSvg,
  exportToBlob,
  exportToCanvas,
  restoreElements,
  getCommonBounds,
  getNonDeletedElements,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
  getSceneVersion,
  serializeAsJSON,
  FONT_FAMILY,
  THEME,
  MIME_TYPES,
} = excalidrawLib;
```

### Getting the Imperative API

```javascript
// Get the ExcalidrawAPI for the current view
const api = ea.getExcalidrawAPI();

// Now you can use all imperative methods:
const elements = api.getSceneElements();
const appState = api.getAppState();
const files = api.getFiles();
```

### Practical Example: Creating a Flowchart with Skeletons

```javascript
// In an Excalidraw script:
const { convertToExcalidrawElements } = excalidrawLib;

const skeletons = [
  {
    type: "rectangle",
    id: "start",
    x: 0, y: 0, width: 200, height: 80,
    backgroundColor: "#a5d8ff",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "Start" },
  },
  {
    type: "diamond",
    id: "decision",
    x: 250, y: 150, width: 200, height: 120,
    backgroundColor: "#fff3bf",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "Is it\nworking?" },
  },
  {
    type: "rectangle",
    id: "yes-action",
    x: 0, y: 350, width: 200, height: 80,
    backgroundColor: "#b2f2bb",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "Ship it!" },
  },
  {
    type: "rectangle",
    id: "no-action",
    x: 500, y: 350, width: 200, height: 80,
    backgroundColor: "#ffc9c9",
    fillStyle: "solid",
    strokeWidth: 2,
    label: { text: "Debug" },
  },
  {
    type: "arrow",
    x: 100, y: 80,
    start: { id: "start" },
    end: { id: "decision" },
  },
  {
    type: "arrow",
    x: 250, y: 270,
    start: { id: "decision" },
    end: { id: "yes-action" },
    label: { text: "Yes" },
  },
  {
    type: "arrow",
    x: 450, y: 270,
    start: { id: "decision" },
    end: { id: "no-action" },
    label: { text: "No" },
  },
  {
    type: "arrow",
    x: 600, y: 350,
    start: { id: "no-action" },
    end: { id: "decision" },
    label: { text: "Try again" },
  },
];

const fullElements = convertToExcalidrawElements(skeletons);

// Add to the current view
const api = ea.getExcalidrawAPI();
const existingElements = api.getSceneElements();
api.updateScene({
  elements: [...existingElements, ...fullElements],
  captureUpdate: CaptureUpdateAction.IMMEDIATELY,
});

// Scroll to show the new elements
api.scrollToContent(fullElements, { fitToContent: true, animate: true });
```

### Practical Example: Exporting the Current Scene

```javascript
// Export the current drawing as SVG
const { exportToSvg } = excalidrawLib;
const api = ea.getExcalidrawAPI();

const svgElement = await exportToSvg({
  elements: api.getSceneElements(),
  appState: {
    ...api.getAppState(),
    exportBackground: true,
    exportWithDarkMode: false,
  },
  files: api.getFiles(),
  exportPadding: 20,
});

const svgString = svgElement.outerHTML;

// Save to a file in the vault
const file = await app.vault.create(
  "exports/my-drawing.svg",
  svgString
);
new Notice(`Exported to ${file.path}`);
```

### Practical Example: Querying Element Bounds

```javascript
const { getCommonBounds, elementsOverlappingBBox } = excalidrawLib;
const api = ea.getExcalidrawAPI();
const elements = api.getSceneElements();

// Get the bounding box of all elements
const [minX, minY, maxX, maxY] = getCommonBounds(elements);
console.log(`Scene spans from (${minX}, ${minY}) to (${maxX}, ${maxY})`);
console.log(`Total size: ${maxX - minX} x ${maxY - minY}`);

// Find elements in the top-left quadrant
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
const topLeftElements = elementsOverlappingBBox(
  elements,
  [minX, minY, centerX, centerY],
  0,
  "inside"
);
console.log(`${topLeftElements.length} elements in top-left quadrant`);
```

### Practical Example: Coordinate Conversion for Custom Overlays

```javascript
const { sceneCoordsToViewportCoords, viewportCoordsToSceneCoords } = excalidrawLib;
const api = ea.getExcalidrawAPI();
const appState = api.getAppState();

// Find where a specific element appears on screen
const element = api.getSceneElements().find(el => el.type === "text");
if (element) {
  const screenPos = sceneCoordsToViewportCoords(
    { sceneX: element.x, sceneY: element.y },
    appState
  );
  console.log(`"${element.text}" is at screen position (${screenPos.x}, ${screenPos.y})`);
}

// Convert a mouse click to scene coordinates
// (useful in onPointerDown/onPointerUp handlers)
const scenePos = viewportCoordsToSceneCoords(
  { clientX: 500, clientY: 300 },
  appState
);
console.log(`Screen (500, 300) maps to scene (${scenePos.x}, ${scenePos.y})`);
```

### Practical Example: Scene Version Monitoring

```javascript
const { getSceneVersion } = excalidrawLib;
const api = ea.getExcalidrawAPI();

// Track scene changes (useful for auto-save scripts)
const initialVersion = getSceneVersion(api.getSceneElements());

// Subscribe to changes
const unsubscribe = api.onChange((elements, appState, files) => {
  const currentVersion = getSceneVersion(elements);
  if (currentVersion !== initialVersion) {
    console.log(`Scene version changed: ${initialVersion} -> ${currentVersion}`);
    // Trigger auto-save, sync, or other logic
  }
});

// Clean up when done
// unsubscribe();
```

### Practical Example: Using restoreElements for Data Migration

```javascript
const { restoreElements } = excalidrawLib;

// Suppose you have raw element data from an older format or external source
const rawElements = [
  {
    type: "rectangle",
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    // Missing many required properties...
  },
];

// restoreElements fills in all missing properties with defaults
const validElements = restoreElements(rawElements, null, {
  refreshDimensions: true,
  repairBindings: true,
  normalizeIndices: true,
});

// Now validElements has all required properties and can be safely used
const api = ea.getExcalidrawAPI();
api.updateScene({
  elements: [...api.getSceneElements(), ...validElements],
  captureUpdate: CaptureUpdateAction.IMMEDIATELY,
});
```

### Important Caveats When Mixing EA and Library APIs

1. **EA manages its own element list.** When you use `ea.addRect()`, `ea.addText()`, etc.,
   the elements are added to EA's internal `elementsDict`. When you use
   `convertToExcalidrawElements()`, the elements are standalone arrays. Do not mix the two
   creation methods and expect them to be automatically merged.

2. **Use `ea.addElementsToView()` for EA-created elements** and
   `api.updateScene()` for library-created elements. Or convert library elements to EA format
   first.

3. **The `CaptureUpdateAction` import** — In plugin scripts, `CaptureUpdateAction` may need
   to be accessed from `excalidrawLib.CaptureUpdateAction` depending on the version. Check
   what is available:

   ```javascript
   // Try these approaches:
   const CaptureUpdateAction = excalidrawLib.CaptureUpdateAction;
   // or it may be available as a global
   ```

4. **Saving after direct API updates** — When you use `api.updateScene()` directly, the
   plugin's auto-save mechanism will pick up the changes. But if you need to force an
   immediate save, call `ea.targetView.save()` or use the plugin's save command.

5. **Element versions matter** — When updating existing elements via `api.updateScene()`,
   increment the `version` and regenerate `versionNonce`. Otherwise, the update may not be
   detected by components that track element versions.

---

## Cross-References

- **[Guide 06: Scripting API](06-scripting-api.md)** — The ExcalidrawAutomate (EA) API that
  wraps many library functions with higher-level abstractions
- **[Guide 12: Custom Scripts Guide](12-custom-scripts-guide.md)** — How to write and run
  scripts that can use both EA and library APIs
- **[Guide 13: Working with SVG](13-working-with-svg.md)** — Deep dive into SVG export and
  manipulation, building on `exportToSvg()` from this guide
- **[Guide 03: Data Layer](03-data-layer.md)** — How the plugin's markdown storage format
  relates to the JSON schema documented here

---

## Summary

The `@excalidraw/excalidraw` library API is a powerful foundation that provides:

- **ElementSkeleton** — Declarative, minimal-property element creation with automatic binding,
  labeling, and dimension calculation
- **ExcalidrawAPI** — Full imperative control over the React drawing component: read/write
  scene data, manage the library, handle events, control the UI
- **Export utilities** — Convert scenes to Canvas, Blob (PNG/JPEG/WebP), SVG, and clipboard
- **Restore utilities** — Validate and normalize imported data with version conflict resolution
- **Geometry utilities** — Bounding box queries, overlap detection, coordinate transformations
- **Constants** — Font families, themes, MIME types

Within the Obsidian plugin, these APIs are available via `excalidrawLib` (for utility functions)
and `ea.getExcalidrawAPI()` (for the imperative interface). They complement the higher-level
ExcalidrawAutomate API, giving you low-level access when you need precise control over element
creation, scene management, or export.
