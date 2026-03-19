# 12 - Custom Scripts Guide: A Practical Handbook for Creating Excalidraw Scripts

This is a comprehensive, hands-on guide for creating your own Excalidraw scripts in
Obsidian. It covers everything from your first "Hello World" script to advanced
patterns like hooks, sidepanel tabs, and custom modals. Every code example is
derived from real patterns found in the repository source code and the community
script library (`ea-scripts/`).

---

## Table of Contents

- [Part 1: Getting Started with Script Development](#part-1-getting-started-with-script-development)
- [Part 2: The Script Environment](#part-2-the-script-environment)
- [Part 3: Script Template and Boilerplate](#part-3-script-template-and-boilerplate)
- [Part 4: Working with Elements](#part-4-working-with-elements)
- [Part 5: User Interaction Patterns](#part-5-user-interaction-patterns)
- [Part 6: Persistent Settings Pattern](#part-6-persistent-settings-pattern)
- [Part 7: File Operations in Scripts](#part-7-file-operations-in-scripts)
- [Part 8: Hooks and Event-Driven Scripts](#part-8-hooks-and-event-driven-scripts)
- [Part 9: Advanced Patterns](#part-9-advanced-patterns)
- [Part 10: Ten Complete Script Examples](#part-10-ten-complete-script-examples)
- [Part 11: Script Development Tips and Debugging](#part-11-script-development-tips-and-debugging)
- [Part 12: Script Publishing](#part-12-script-publishing)

---

## Part 1: Getting Started with Script Development

### Where Scripts Live

Scripts are stored in a folder you configure in Excalidraw plugin settings. The
setting is called **Excalidraw Scripts folder** and you can find it in:

```
Settings -> Community Plugins -> Excalidraw -> scroll to Excalidraw Scripts section
```

A typical value might be `Excalidraw/Scripts`. This folder lives inside your
Obsidian vault. Every `.md` file placed in this folder (or its subfolders) is
automatically registered as an Excalidraw script command.

### Script File Format

Scripts are **Markdown files** (`.md`). The actual JavaScript code is the body of
the file. You can optionally include YAML frontmatter at the top of the file, but
it will be stripped before execution. You can also include documentation in a
comment block at the top.

The standard format used by community scripts is:

```markdown
/*
Description of what the script does.
Can include images, links, etc.

```javascript
*/

// Your JavaScript code starts here
const elements = ea.getViewSelectedElements();
// ...
```

The key point: the engine calls `stripYamlFrontmatter()` on the file content
before executing it. This removes any YAML frontmatter block (`---` ... `---`)
from the beginning. The remaining text is then executed as an async function
body.

### Adding a Toolbar Icon

To add a toolbar icon for your script, create an **SVG file** with the exact
same name as your script (but with `.svg` extension) in the same folder.

For example:
- Script: `My Script.md`
- Icon: `My Script.svg`

The SVG file should contain a simple SVG icon. When present, a button for your
script will appear in the Excalidraw tools panel. If no SVG companion file
exists, the script is still available from the Command Palette.

### Subdirectories for Organization

You can organize scripts into subdirectories within your script folder. The
subdirectory name becomes a group name in the tools panel. For example:

```
Excalidraw/Scripts/
  My Script.md            -> appears as "My Script" in top-level
  My Script.svg
  Layout/
    Grid Layout.md        -> appears as "Layout/Grid Layout"
    Grid Layout.svg
  Colors/
    Darken.md             -> appears as "Colors/Darken"
    Darken.svg
```

The script engine uses the path relative to the script folder root to derive the
command name. Scripts in subdirectories show their group prefix in the command
palette.

### The Script Store

Excalidraw includes a built-in command **"Install or update Excalidraw scripts"**
accessible from the command palette. This downloads community scripts from the
official `ea-scripts/` directory in the plugin's GitHub repository. Each community
script includes both the `.md` script file and an `.svg` icon.

You are not limited to community scripts. Any `.md` file you create in your
script folder becomes a script. The Script Store is simply a convenient way to
get pre-built scripts.

---

## Part 2: The Script Environment

When a script executes, it runs inside an `AsyncFunction` with two parameters:
`ea` and `utils`. Several global objects are also available.

### The `ea` Object (ExcalidrawAutomate)

This is the primary API. It is an instance of `ExcalidrawAutomate` that has already
been configured with `targetView` set to the currently active Excalidraw view.

Key categories of functionality:

| Category | Examples |
|----------|----------|
| **Element creation** | `addRect()`, `addEllipse()`, `addDiamond()`, `addText()`, `addLine()`, `addArrow()`, `addImage()`, `addFrame()`, `addBlob()` |
| **Element manipulation** | `getElement()`, `getElements()`, `copyViewElementsToEAforEditing()`, `addElementsToView()` |
| **View access** | `getViewElements()`, `getViewSelectedElements()`, `deleteViewElements()`, `selectElementsInView()` |
| **Connections** | `connectObjects()`, `addLabelToLine()` |
| **Grouping** | `addToGroup()`, `addElementsToFrame()`, `getMaximumGroups()`, `getLargestElement()` |
| **Measurement** | `measureText()`, `wrapText()`, `getBoundingBox()` |
| **File operations** | `create()`, `openFileInNewOrAdjacentLeaf()`, `createSVG()`, `createPNG()`, `createPDF()` |
| **Settings** | `getScriptSettings()`, `setScriptSettings()` |
| **Scene access** | `getExcalidrawAPI()`, `viewUpdateScene()` |
| **Hooks** | `onDropHook`, `onPasteHook`, `onLinkClickHook`, `onLinkHoverHook`, `onViewUnloadHook` |
| **Style** | `ea.style.*` (strokeColor, backgroundColor, fontSize, fontFamily, etc.) |
| **Utilities** | `verifyMinimumPluginVersion()`, `getCM()`, `colorNameToHex()`, `cloneElement()`, `generateElementId()` |

### The `utils` Object

The `utils` object provides three members:

```javascript
utils.inputPrompt(header, placeholder?, value?, buttons?, lines?,
                  displayEditorButtons?, customComponents?,
                  blockPointerInputOutsideModal?, controlsOnTop?,
                  draggable?)
// Returns: Promise<string | undefined>  (undefined if cancelled)

utils.suggester(displayItems, items, hint?, instructions?)
// Returns: Promise<any | undefined>  (undefined if cancelled)

utils.scriptFile
// The TFile object of the currently running script
```

`inputPrompt` can also accept a single options object as its first argument:
```javascript
const result = await utils.inputPrompt({
  header: "Enter a value",
  placeholder: "type here...",
  value: "default",
  buttons: [{caption: "OK", action: () => "ok"}],
  lines: 3,
});
```

### Global Objects

These are available without any import:

| Global | What It Is |
|--------|-----------|
| `app` | The Obsidian `App` instance. Access vault, workspace, metadata cache, etc. |
| `Notice` | The Obsidian `Notice` class for toast notifications: `new Notice("Hello!")` |
| `moment` | The moment.js library for date/time manipulation. |

### The `ea.obsidian` Module

All of the Obsidian API is available through `ea.obsidian`. This gives you access
to classes like:

```javascript
ea.obsidian.TFile
ea.obsidian.TFolder
ea.obsidian.normalizePath("some/path")
ea.obsidian.Setting
ea.obsidian.Modal
ea.obsidian.TextComponent
ea.obsidian.ButtonComponent
ea.obsidian.ToggleComponent
ea.obsidian.DropdownComponent
ea.obsidian.getIcon("lucide-star")
ea.obsidian.AbstractInputSuggest  // for building custom suggesters
```

This is essential when you need to build custom UI beyond what `utils.inputPrompt`
provides.

### async/await in Scripts

Scripts are executed as the body of an `AsyncFunction`. This means you can use
`await` at the top level:

```javascript
const name = await utils.inputPrompt("What is your name?");
if (!name) return;  // User cancelled

const file = await app.vault.read(someFile);
await ea.addElementsToView(true, true);
```

The `return` statement exits the script. You can return a value, which becomes
the return value of `executeScript()`.

### Error Handling

Wrap risky operations in try/catch and notify the user:

```javascript
try {
  const data = JSON.parse(someInput);
  // work with data...
} catch (e) {
  new Notice("Invalid JSON input: " + e.message);
  return;
}
```

---

## Part 3: Script Template and Boilerplate

Here is a complete, annotated script template that demonstrates all the standard
patterns:

```javascript
/*
My Custom Script

Description of what the script does.
Include screenshots or links to documentation as needed.

```javascript
*/

// ============================================================
// 1. VERSION CHECK
// ============================================================
// Always verify the plugin version if you use newer API features.
// This prevents cryptic errors for users on older versions.
if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.0.0")) {
  new Notice("This script requires Excalidraw plugin version 2.0.0 or later.");
  return;
}

// ============================================================
// 2. SETTINGS (persistent across runs)
// ============================================================
let settings = ea.getScriptSettings();
// Initialize defaults on first run
if (!settings["My Setting"]) {
  settings = {
    "My Setting": {
      value: "default value",
      description: "Explanation shown in plugin settings"
    },
    "Number Setting": {
      value: 10,
      description: "A numeric parameter"
    },
    "Choice Setting": {
      value: "option1",
      valueset: ["option1", "option2", "option3"],
      description: "Pick one of these values"
    },
  };
  ea.setScriptSettings(settings);
}

const mySettingValue = settings["My Setting"].value;
const numberValue = settings["Number Setting"].value;

// ============================================================
// 3. USER INPUT
// ============================================================
const userInput = await utils.inputPrompt(
  "Enter something:",      // header
  "placeholder text...",   // placeholder
  mySettingValue            // default value from settings
);
if (!userInput) return;  // User cancelled the dialog

// ============================================================
// 4. GET SELECTED ELEMENTS (if needed)
// ============================================================
const selectedElements = ea.getViewSelectedElements();
if (selectedElements.length === 0) {
  new Notice("Please select at least one element.");
  return;
}

// ============================================================
// 5. WORK WITH ELEMENTS
// ============================================================

// Option A: Create new elements
ea.style.strokeColor = "#e03131";
ea.style.backgroundColor = "#fff3bf";
ea.style.fillStyle = "solid";
ea.style.fontSize = 20;
ea.style.fontFamily = 1;  // 1=Virgil, 2=Helvetica, 3=Cascadia

const textId = ea.addText(0, 0, userInput, {
  wrapAt: 30,
  textAlign: "center",
  box: "rectangle",
  boxPadding: 10,
});

// Option B: Modify existing elements
// Copy view elements to EA workbench for editing
ea.copyViewElementsToEAforEditing(selectedElements);
for (const el of ea.getElements()) {
  el.strokeColor = "#e03131";
}

// ============================================================
// 6. COMMIT CHANGES TO VIEW
// ============================================================
await ea.addElementsToView(
  false,   // repositionToCursor: place at original coordinates
  true,    // save: save the file after adding
  false    // newElementsOnTop: add behind existing elements
);

// ============================================================
// 7. OPTIONAL: Select the new elements
// ============================================================
ea.selectElementsInView([ea.getElement(textId)]);

// ============================================================
// 8. FEEDBACK
// ============================================================
new Notice("Script completed successfully!");
```

### Key Lifecycle Points

1. **Version check** -- prevents the script from running on older plugin versions
   that lack APIs you depend on.
2. **Settings** -- are persisted in the plugin's settings JSON. The user can also
   edit them in the Excalidraw settings tab (scroll to the bottom).
3. **User input** -- `utils.inputPrompt` and `utils.suggester` return `undefined`
   when the user cancels. Always check for this.
4. **Element creation** -- elements are created in the EA "workbench"
   (`ea.elementsDict`), not directly in the scene.
5. **Commit** -- `ea.addElementsToView()` pushes workbench elements into the
   live Excalidraw scene. Until this is called, nothing is visible.

---

## Part 4: Working with Elements

### 4a. Creating Elements from Scratch

#### Rectangles

```javascript
// addRect(topX, topY, width, height, id?)
// Returns the element ID
ea.style.strokeColor = "#1e1e1e";
ea.style.backgroundColor = "#a5d8ff";
ea.style.fillStyle = "solid";       // "hachure" | "cross-hatch" | "solid"
ea.style.strokeWidth = 2;
ea.style.roughness = 1;             // 0=architect, 1=artist, 2=cartoonist
ea.style.roundness = { type: 3 };   // rounded corners (null for sharp)

const rectId = ea.addRect(100, 100, 200, 150);
await ea.addElementsToView(false, true);
```

#### Ellipses

```javascript
// addEllipse(topX, topY, width, height, id?)
ea.style.strokeColor = "#2f9e44";
ea.style.backgroundColor = "#b2f2bb";
ea.style.fillStyle = "hachure";

const ellipseId = ea.addEllipse(0, 0, 180, 120);
await ea.addElementsToView(false, true);
```

#### Diamonds

```javascript
// addDiamond(topX, topY, width, height, id?)
ea.style.strokeColor = "#e8590c";
ea.style.backgroundColor = "#ffe8cc";
ea.style.fillStyle = "cross-hatch";

const diamondId = ea.addDiamond(0, 0, 150, 150);
await ea.addElementsToView(false, true);
```

#### Text Elements

The `addText()` method is the most versatile element creator. It can produce
standalone text or text inside a container (rectangle, ellipse, diamond, or blob).

```javascript
// Simple text
ea.style.fontSize = 24;
ea.style.fontFamily = 2; // Helvetica
ea.style.strokeColor = "#1e1e1e";

const textId = ea.addText(50, 50, "Hello, World!");

// Text with wrapping
const wrappedId = ea.addText(50, 150, "This is a long text that will wrap", {
  wrapAt: 20,         // wrap at 20 characters
  textAlign: "center",
});

// Text inside a rectangle container (a "sticky note")
const stickyId = ea.addText(50, 300, "Sticky Note Content", {
  wrapAt: 25,
  textAlign: "center",
  textVerticalAlign: "middle",
  box: "rectangle",   // or "ellipse", "diamond", "blob", true (=rectangle)
  boxPadding: 10,
});

// Text inside a container with fixed width
const fixedWidthId = ea.addText(50, 500, "Fixed width text", {
  width: 200,
  textAlign: "left",
  box: "rectangle",
  boxPadding: 0,
});

await ea.addElementsToView(false, true);
```

The `box` parameter creates a container element and binds the text to it
automatically. The returned ID is the container ID (not the text element ID)
when `box` is set.

#### Lines

```javascript
// addLine(points, id?)
// points is an array of [x, y] coordinate pairs
// The first point is the line's origin position

ea.style.strokeColor = "#1971c2";
ea.style.strokeWidth = 2;
ea.style.strokeStyle = "solid";  // "solid" | "dashed" | "dotted"

// A simple straight line
const lineId = ea.addLine([[0, 0], [200, 100]]);

// A multi-point line (polyline)
const polyId = ea.addLine([
  [0, 0],
  [100, 50],
  [200, 0],
  [300, 50],
]);

await ea.addElementsToView(false, true);
```

#### Arrows

```javascript
// addArrow(points, formatting?)
ea.style.strokeColor = "#e03131";
ea.style.strokeWidth = 2;

// Simple arrow from point A to point B
const arrowId = ea.addArrow(
  [[0, 0], [200, 0]],
  {
    startArrowHead: null,       // no head at start
    endArrowHead: "triangle",   // triangle head at end
    // Other arrowhead options: "arrow", "bar", "circle",
    //   "circle_outline", "triangle_outline",
    //   "diamond", "diamond_outline"
  }
);

await ea.addElementsToView(false, true);
```

#### Connected Elements (using connectObjects)

`connectObjects()` creates an arrow between two existing elements in the
EA workbench. Both elements must exist in `ea.elementsDict`.

```javascript
// Create two boxes
ea.style.strokeColor = "#1e1e1e";
ea.style.backgroundColor = "#d0bfff";
ea.style.fillStyle = "solid";

const box1 = ea.addRect(0, 0, 150, 80);
const box2 = ea.addRect(300, 0, 150, 80);

// Connect them with an arrow
// connectObjects(objectA, connectionA, objectB, connectionB, formatting?)
// connectionA/B: "top" | "bottom" | "left" | "right" | null (auto)
ea.connectObjects(
  box1,
  "right",    // connect from right side of box1
  box2,
  "left",     // connect to left side of box2
  {
    startArrowHead: null,
    endArrowHead: "triangle",
    numberOfPoints: 0,   // 0 = straight line, >0 = intermediate points
    padding: 10,         // gap between arrow and shape edge
  }
);

await ea.addElementsToView(false, true);
```

Using `null` for the connection point lets the engine auto-calculate the
best connection position:

```javascript
ea.connectObjects(box1, null, box2, null, {
  endArrowHead: "triangle",
});
```

#### Images and Embedded Files

```javascript
// addImage(topX, topY, file, shouldScale?, shouldAnchor?)
// file can be a TFile or a string path
const imageFile = app.vault.getAbstractFileByPath("path/to/image.png");
if (imageFile) {
  await ea.addImage(0, 0, imageFile, false);
  await ea.addElementsToView(false, true);
}
```

#### Frames

Frames are visual grouping containers in Excalidraw.

```javascript
// addFrame(topX, topY, width, height, name?)
const frameId = ea.addFrame(0, 0, 500, 400, "My Frame");

// Create elements inside the frame
const rect1 = ea.addRect(20, 20, 100, 80);
const rect2 = ea.addRect(140, 20, 100, 80);

// Assign elements to the frame
ea.addElementsToFrame(frameId, [rect1, rect2]);

await ea.addElementsToView(false, true);
```

#### Setting Styles Before Creation

All style properties are set on `ea.style` before creating elements.
The element inherits the current style at creation time:

```javascript
ea.style.strokeColor = "#e03131";      // stroke/border color
ea.style.backgroundColor = "#ffc9c9";  // fill color
ea.style.fillStyle = "solid";          // "hachure" | "cross-hatch" | "solid"
ea.style.strokeWidth = 2;             // border width in pixels
ea.style.strokeStyle = "dashed";       // "solid" | "dashed" | "dotted"
ea.style.roughness = 0;               // 0=architect, 1=artist, 2=cartoonist
ea.style.opacity = 80;                // 0-100
ea.style.angle = 0;                   // rotation in radians
ea.style.roundness = { type: 3 };     // rounded corners (null for sharp)
ea.style.fontFamily = 1;              // 1=Virgil, 2=Helvetica, 3=Cascadia, 4=LocalFont
ea.style.fontSize = 20;               // font size in pixels
ea.style.textAlign = "left";          // "left" | "center" | "right"
ea.style.verticalAlign = "top";       // "top" | "middle" | "bottom"
ea.style.startArrowHead = null;       // arrowhead at start of lines
ea.style.endArrowHead = "arrow";      // arrowhead at end of lines
```

### 4b. Manipulating Existing Elements

The fundamental workflow for modifying elements already on the canvas is:

1. **Get** elements from the view
2. **Copy** them into the EA workbench
3. **Modify** them
4. **Commit** changes back to the view

#### Getting Selected Elements

```javascript
// Get what the user has selected
const selected = ea.getViewSelectedElements();

// Get all elements in the view
const allElements = ea.getViewElements();

// Get the single selected element (first if multiple)
const one = ea.getViewSelectedElement();
```

#### The Copy-Modify-Commit Workflow

This is the most important pattern in script development:

```javascript
// 1. Get selected elements from the view
const elements = ea.getViewSelectedElements();
if (elements.length === 0) {
  new Notice("Select something first!");
  return;
}

// 2. Copy them into the EA workbench for editing
ea.copyViewElementsToEAforEditing(elements);

// 3. Modify them (now they are in ea.elementsDict)
for (const el of ea.getElements()) {
  el.strokeColor = "#e03131";
  el.backgroundColor = "#ffc9c9";
  el.strokeWidth = 3;
}

// 4. Commit changes back to the view
await ea.addElementsToView(false, false);
// First arg: repositionToCursor (false = keep original position)
// Second arg: save (false = don't auto-save, true = save immediately)
```

This pattern is used by virtually every community script that modifies elements.
The key insight: Excalidraw scene elements are immutable. You cannot mutate them
in place. You must copy to EA, modify, then push back.

#### Filtering Elements by Type

```javascript
const elements = ea.getViewSelectedElements();

// Filter by type
const textElements = elements.filter(el => el.type === "text");
const rectangles = elements.filter(el => el.type === "rectangle");
const arrows = elements.filter(el => el.type === "arrow");
const images = elements.filter(el => el.type === "image");
const lines = elements.filter(el => el.type === "line");

// All possible types:
// "rectangle", "ellipse", "diamond", "text", "arrow", "line",
// "freedraw", "image", "frame", "embeddable"
```

#### Moving Elements

```javascript
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  el.x += 100;  // move right by 100
  el.y += 50;   // move down by 50
}

await ea.addElementsToView(false, false);
```

#### Resizing Elements

```javascript
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  el.width *= 1.5;   // scale width by 150%
  el.height *= 1.5;  // scale height by 150%
}

await ea.addElementsToView(false, false);
```

#### Rotating Elements

```javascript
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  el.angle = Math.PI / 4;  // rotate to 45 degrees (radians)
}

await ea.addElementsToView(false, false);
```

#### Changing Colors and Styles

```javascript
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  el.strokeColor = "#1971c2";
  el.backgroundColor = "#a5d8ff";
  el.fillStyle = "solid";
  el.strokeWidth = 2;
  el.opacity = 80;
  el.roughness = 0;
}

await ea.addElementsToView(false, false);
```

#### Grouping and Ungrouping

```javascript
// Group selected elements
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);

const groupId = ea.addToGroup(elements.map(el => el.id));
await ea.addElementsToView(false, false);

// Ungrouping: clear the groupIds array
ea.copyViewElementsToEAforEditing(elements);
for (const el of ea.getElements()) {
  el.groupIds = [];
}
await ea.addElementsToView(false, false);
```

#### Deleting Elements

There are two approaches:

```javascript
// Approach 1: Mark as deleted and commit
const elements = ea.getViewSelectedElements();
ea.copyViewElementsToEAforEditing(elements);
for (const el of ea.getElements()) {
  el.isDeleted = true;
}
await ea.addElementsToView(false, true);

// Approach 2: Use deleteViewElements (removes from scene entirely)
const toDelete = ea.getViewSelectedElements();
ea.deleteViewElements(toDelete);
```

### 4c. Working with Text

#### Creating Text

```javascript
ea.style.fontSize = 20;
ea.style.fontFamily = 1; // 1=Virgil, 2=Helvetica, 3=Cascadia

// Simple text
const id1 = ea.addText(0, 0, "Simple text");

// Wrapped text inside a rectangle
const id2 = ea.addText(0, 100, "This text will be wrapped and placed in a box", {
  wrapAt: 25,
  textAlign: "center",
  textVerticalAlign: "middle",
  box: "rectangle",
  boxPadding: 10,
});
```

#### Measuring Text

`measureText()` calculates the pixel dimensions of text based on current style:

```javascript
ea.style.fontSize = 20;
ea.style.fontFamily = 2;

const size = ea.measureText("Hello, World!");
console.log(`Width: ${size.width}, Height: ${size.height}`);

// Useful for calculating layout
const text = "My centered text";
const { width } = ea.measureText(text);
const textId = ea.addText(
  centerX - width / 2,  // center horizontally
  centerY,
  text
);
```

#### Wrapping Text

```javascript
// Wrap text at a specific character count
const wrapped = ea.wrapText("This is a long text that needs wrapping", 20);
// Returns a string with newlines inserted at appropriate points
```

#### Modifying Text of Existing Elements

```javascript
const textElements = ea.getViewSelectedElements()
  .filter(el => el.type === "text");
ea.copyViewElementsToEAforEditing(textElements);

for (const el of ea.getElements()) {
  el.text = el.text.toUpperCase();
  el.originalText = el.originalText.toUpperCase();
  el.rawText = el.rawText.toUpperCase();
  // Refresh dimensions after changing text
  ea.refreshTextElementSize(el.id);
}

await ea.addElementsToView(false, false);
```

### 4d. Working with Arrows and Connections

#### Creating Connected Diagrams

```javascript
// A simple flowchart: Start -> Process -> End
ea.style.strokeColor = "#1e1e1e";
ea.style.fillStyle = "solid";

// Create the nodes
ea.style.backgroundColor = "#b2f2bb";
const startId = ea.addText(0, 0, "Start", {
  box: "ellipse", boxPadding: 15, textAlign: "center",
});

ea.style.backgroundColor = "#a5d8ff";
const processId = ea.addText(0, 150, "Process Data", {
  box: "rectangle", boxPadding: 15, textAlign: "center",
});

ea.style.backgroundColor = "#ffc9c9";
const endId = ea.addText(0, 300, "End", {
  box: "ellipse", boxPadding: 15, textAlign: "center",
});

// Connect them
ea.connectObjects(startId, "bottom", processId, "top", {
  endArrowHead: "triangle",
});

ea.connectObjects(processId, "bottom", endId, "top", {
  endArrowHead: "triangle",
});

await ea.addElementsToView(true, true);  // repositionToCursor=true
```

#### Arrow Connection Points

The connection point parameter accepts:
- `"top"` -- center of top edge
- `"bottom"` -- center of bottom edge
- `"left"` -- center of left edge
- `"right"` -- center of right edge
- `null` -- auto-calculate best connection point

```javascript
// Connect from right side to left side (horizontal flow)
ea.connectObjects(boxA, "right", boxB, "left", {
  endArrowHead: "triangle",
});

// Connect from bottom to top (vertical flow)
ea.connectObjects(boxA, "bottom", boxB, "top", {
  endArrowHead: "arrow",
});

// Let Excalidraw decide the best points
ea.connectObjects(boxA, null, boxB, null, {
  endArrowHead: "triangle",
});
```

#### Arrow Formatting Options

```javascript
ea.connectObjects(boxA, null, boxB, null, {
  startArrowHead: null,          // no head at start
  endArrowHead: "triangle",      // triangle at end
  numberOfPoints: 0,             // 0 = straight, 1+ = intermediate points
  padding: 10,                   // gap between arrow and element
});

// Arrowhead options:
// null, "arrow", "bar", "circle", "circle_outline",
// "triangle", "triangle_outline", "diamond", "diamond_outline"
```

#### Reversing Arrows

This pattern comes from the "Reverse arrows" community script:

```javascript
const arrows = ea.getViewSelectedElements()
  .filter(el => el.type === "arrow");
if (!arrows || arrows.length === 0) return;

arrows.forEach(el => {
  const start = el.startArrowhead;
  el.startArrowhead = el.endArrowhead;
  el.endArrowhead = start;
});

ea.copyViewElementsToEAforEditing(arrows);
await ea.addElementsToView(false, false);
```

#### Adding Labels to Lines

```javascript
const lineId = ea.addLine([[0, 0], [300, 0]]);
const labelId = ea.addLabelToLine(lineId, "Flow");

await ea.addElementsToView(false, true);
```

---

## Part 5: User Interaction Patterns

### 5a. Simple Input Dialog

```javascript
const name = await utils.inputPrompt("Enter your name:", "Type here...");
if (!name) return;  // user cancelled or closed the dialog
new Notice(`Hello, ${name}!`);
```

### 5b. Multi-line Input

Pass a `lines` parameter to create a multi-line text area:

```javascript
const notes = await utils.inputPrompt(
  "Enter notes:",     // header
  "Write here...",    // placeholder
  "",                 // default value
  null,               // buttons (null = default)
  5                   // number of lines for textarea
);
if (!notes) return;
```

### 5c. Selection from List (Suggester)

The suggester shows a filterable list of options:

```javascript
// Simple list
const colors = ["Red", "Blue", "Green", "Yellow"];
const choice = await utils.suggester(colors, colors, "Pick a color");
if (!choice) return;  // user cancelled
new Notice(`You chose: ${choice}`);
```

When display labels differ from values:

```javascript
// Display labels differ from returned values
const labels = ["--- line", "circle ellipse", "box rectangle", "diamond diamond"];
const values = ["line", "ellipse", "rectangle", "diamond"];
const type = await utils.suggester(labels, values, "Select element type");
```

### 5d. File Selection

```javascript
// Let user select a markdown file
const files = app.vault.getMarkdownFiles();
const file = await utils.suggester(
  files.map(f => f.basename),
  files,
  "Select a file"
);
if (!file) return;
new Notice(`Selected: ${file.path}`);
```

```javascript
// Select from Excalidraw files only
const allFiles = app.vault.getFiles();
const excalidrawFiles = allFiles.filter(f => ea.isExcalidrawFile(f));
const selected = await utils.suggester(
  excalidrawFiles.map(f => f.basename),
  excalidrawFiles,
  "Select a drawing"
);
```

### 5e. Custom Buttons

Buttons appear below the input field and return values when clicked:

```javascript
const result = await utils.inputPrompt(
  "Choose an action:",
  "",
  "",
  [
    { caption: "Option A", action: () => "A" },
    { caption: "Option B", action: () => "B" },
    { caption: "Option C", action: () => "C" },
  ]
);
if (!result) return;
new Notice(`You chose: ${result}`);
```

### 5f. Confirmation Pattern

```javascript
const confirmOptions = ["Yes", "No"];
const confirm = await utils.suggester(confirmOptions, confirmOptions,
  "Are you sure you want to continue?");
if (confirm !== "Yes") return;
```

### 5g. Numeric Input with Validation

```javascript
const input = await utils.inputPrompt("Enter padding:", "number", "10");
const padding = parseInt(input);
if (isNaN(padding)) {
  new Notice("Please enter a valid number.");
  return;
}
```

### 5h. Using the Options Object Form

```javascript
const result = await utils.inputPrompt({
  header: "Configure Layout",
  placeholder: "columns,rows,gap",
  value: "3,3,10",
  buttons: [
    { caption: "Apply", action: () => "apply" },
    { caption: "Preview", action: () => "preview" },
  ],
  lines: 1,
  draggable: true,
});
```

---

## Part 6: Persistent Settings Pattern

Script settings are stored in the Excalidraw plugin's settings JSON, under a
key derived from the script name. Users can view and edit these settings in the
Excalidraw Settings tab (scroll to the bottom to find the Script Engine Settings
section).

### Basic Settings Pattern

```javascript
let settings = ea.getScriptSettings();

// Check if settings need initialization (first run)
if (!settings["Default Color"]) {
  settings = {
    "Default Color": {
      value: "#ff0000",
      description: "Default color for shapes created by this script"
    },
    "Padding": {
      value: 10,
      description: "Padding between elements in pixels"
    },
    "Auto-save": {
      value: true,
      description: "Automatically save after running the script"
    },
  };
  ea.setScriptSettings(settings);
}

// Read current values
const color = settings["Default Color"].value;
const padding = settings["Padding"].value;
const autoSave = settings["Auto-save"];  // boolean without .value for simple booleans
```

### Settings with Value Sets (Dropdown)

When a setting has a `valueset` array, the plugin settings UI renders it as a
dropdown selector:

```javascript
if (!settings["Arrowhead Style"]) {
  settings = {
    "Arrowhead Style": {
      value: "triangle",
      valueset: ["none", "arrow", "triangle", "bar", "dot"],
      description: "Style of arrowhead for connections"
    },
    "Line Style": {
      value: "solid",
      valueset: ["solid", "dashed", "dotted"],
      description: "Style of connecting lines"
    },
  };
  ea.setScriptSettings(settings);
}
```

### Incremental Settings Updates

You can add new settings without resetting existing ones:

```javascript
let settings = ea.getScriptSettings();

// Initialize core settings
if (!settings["Core Setting"]) {
  settings = {
    "Core Setting": {
      value: "default",
      description: "A core setting"
    },
  };
  ea.setScriptSettings(settings);
}

// Add a new setting in a later version without resetting existing ones
if (!settings["New Feature"]) {
  settings["New Feature"] = {
    value: false,
    description: "Enable the new feature (added in v2)"
  };
  ea.setScriptSettings(settings);
}
```

### The Prompt-for-Override Pattern

Many community scripts combine settings with optional user prompts:

```javascript
let settings = ea.getScriptSettings();
if (!settings["Default padding"]) {
  settings = {
    "Prompt for padding?": true,
    "Default padding": {
      value: 10,
      description: "Default padding value"
    },
  };
  ea.setScriptSettings(settings);
}

let padding = settings["Default padding"].value;

// Only ask the user if the setting says to prompt
if (settings["Prompt for padding?"]) {
  padding = parseInt(
    await utils.inputPrompt("Padding?", "number", padding.toString())
  );
}

if (isNaN(padding)) {
  new Notice("Invalid number");
  return;
}
```

---

## Part 7: File Operations in Scripts

### Creating New Drawings

```javascript
// ea.create() creates a new Excalidraw file and optionally opens it
const newFilePath = await ea.create({
  filename: "My New Drawing.md",
  foldername: "Drawings",
  templatePath: "Templates/my-template.md",  // optional
  onNewPane: true,   // open in new pane
  silent: false,     // false = open the file, true = create silently
  frontmatterKeys: {
    "excalidraw-plugin": "parsed",
    "excalidraw-export-dark": false,
    "excalidraw-export-padding": 20,
  },
  plaintext: "Some text above the drawing data section",
});

new Notice(`Created: ${newFilePath}`);
```

### Opening Files

```javascript
// Open a file in a new or adjacent leaf
const file = app.vault.getAbstractFileByPath("path/to/file.md");
if (file) {
  ea.openFileInNewOrAdjacentLeaf(file);
}

// Open with specific state
ea.openFileInNewOrAdjacentLeaf(file, { active: true });
```

### Reading Vault Files

```javascript
// Read a file's content
const file = app.vault.getAbstractFileByPath("Notes/my-note.md");
if (file) {
  const content = await app.vault.read(file);
  console.log(content);
}

// Get all markdown files
const mdFiles = app.vault.getMarkdownFiles();

// Get file by link path (resolves wikilinks)
const resolved = app.metadataCache.getFirstLinkpathDest("my-note", "");

// Read file metadata/frontmatter
const cache = app.metadataCache.getCache(file.path);
const tags = cache?.tags?.map(t => t.tag) || [];
const frontmatter = cache?.frontmatter;
```

### Exporting Drawings

```javascript
// Export to SVG
const svg = await ea.createSVG();  // returns SVGSVGElement

// Export to PNG
const png = await ea.createPNG();  // returns Blob

// Export to PNG as base64 string (useful for AI/LLM workflows)
const base64 = await ea.createPNGBase64();

// Export to PDF
await ea.createPDF({
  // PDF export options
});
```

### Working with Attachments

```javascript
// Get a unique filepath in the attachments folder
const attachmentPath = await ea.getAttachmentFilepath("my-image.png");
// Returns a path like "Attachments/my-image.png" or
// "Attachments/my-image 1.png" if it already exists
```

### Loading Scene from Another File

```javascript
// Load elements from another Excalidraw file
const file = app.vault.getAbstractFileByPath("Templates/shapes.md");
if (file && ea.isExcalidrawFile(file)) {
  const scene = await ea.getSceneFromFile(file);
  // scene.elements contains all the ExcalidrawElements
  // scene.appState contains the AppState
}
```

---

## Part 8: Hooks and Event-Driven Scripts

### Startup Scripts (onload-script)

You can make a script run automatically when a specific drawing opens by adding
the `excalidraw-onload-script` frontmatter key to that drawing file:

```yaml
---
excalidraw-plugin: parsed
excalidraw-onload-script: "Scripts/my-startup-script.md"
---
```

When this drawing opens, the script specified in the frontmatter will execute
automatically.

### Hook Properties

Hooks are callback functions on the `ea` object. To use them in a persistent way,
you need to use `registerThisAsViewEA()` to make your EA instance the "hook
server" for the current view.

Available hooks:

```javascript
// Called when the user drops something on the canvas
ea.onDropHook = (data) => {
  // data.ea: ExcalidrawAutomate instance
  // data.event: the DragEvent
  // data.type: "file" | "text" | "unknown"
  // data.payload.files: TFile[] (dropped files)
  // data.payload.text: string (dropped text)
  // data.excalidrawFile: TFile (the drawing receiving the drop)
  // data.view: ExcalidrawView
  // data.pointerPosition: {x, y}
  //
  // Return false to prevent default drop behavior
  // Return true to allow default behavior
  return true;
};

// Called when the user pastes into the canvas
ea.onPasteHook = (data) => {
  // data.ea, data.payload (ClipboardData), data.event,
  // data.excalidrawFile, data.view, data.pointerPosition
  return true;  // false to prevent default paste
};

// Called when a link in the drawing is clicked
ea.onLinkClickHook = (element, linkText, event, view, ea) => {
  // Return false to prevent default link handling
  // Return true to allow it
  return true;
};

// Called when a link in the drawing is hovered
ea.onLinkHoverHook = (element, linkText, view, ea) => {
  return true;
};

// Called when the view is closed
ea.onViewUnloadHook = (view) => {
  // Clean up resources here
};

// Called when view mode changes (view mode vs edit mode)
ea.onViewModeChangeHook = (isViewModeEnabled, view, ea) => {
  // React to mode changes
};

// Called when an image is being saved (customize path/name)
ea.onImageFilePathHook = (data) => {
  // data.currentImageName, data.drawingFilePath
  // Return a new filepath string or null for default
  return null;
};
```

### Using registerThisAsViewEA

To make your EA instance the hook server for a view:

```javascript
// Register this EA to handle hooks for the current view
ea.registerThisAsViewEA();

// Set up hooks
ea.onDropHook = (data) => {
  if (data.type === "file") {
    new Notice(`Dropped file: ${data.payload.files[0].name}`);
    // Custom drop handling here
    return false;  // prevent default
  }
  return true;  // allow default for non-file drops
};

// When done, deregister (restores default hook handling)
ea.deregisterThisAsViewEA();
```

### Example: Custom Drop Handler as a Startup Script

This is a complete pattern for a startup script that customizes drop behavior
for a specific drawing:

```javascript
/*
Custom Drop Handler - Startup Script

Set this as excalidraw-onload-script in your drawing's frontmatter:
excalidraw-onload-script: "Scripts/Custom Drop Handler.md"

```javascript
*/

ea.registerThisAsViewEA();

ea.onDropHook = (data) => {
  const { type, payload, pointerPosition, view, ea: dropEA } = data;

  if (type === "file" && payload.files.length > 0) {
    const file = payload.files[0];

    // Custom handling for markdown files
    if (file.extension === "md" && !dropEA.isExcalidrawFile(file)) {
      // Create a styled text element with the file name
      dropEA.style.strokeColor = "#1e1e1e";
      dropEA.style.backgroundColor = "#e7f5ff";
      dropEA.style.fillStyle = "solid";

      dropEA.addText(
        pointerPosition.x,
        pointerPosition.y,
        `[[${file.basename}]]`,
        {
          box: "rectangle",
          boxPadding: 12,
          textAlign: "center",
        }
      );
      dropEA.addElementsToView(false, true);
      return false;  // prevent default drop handling
    }
  }
  return true;  // allow default for everything else
};

// Clean up when view closes
ea.onViewUnloadHook = (view) => {
  ea.onDropHook = null;
  ea.onViewUnloadHook = null;
};
```

---

## Part 9: Advanced Patterns

### Working with the Excalidraw API Directly

`ea.getExcalidrawAPI()` returns the raw Excalidraw React component's imperative
API. This gives you low-level control:

```javascript
const api = ea.getExcalidrawAPI();

// Get current app state (zoom, scroll, theme, colors, etc.)
const appState = api.getAppState();
console.log(`Zoom: ${appState.zoom.value}`);
console.log(`Theme: ${appState.theme}`);
console.log(`Background: ${appState.viewBackgroundColor}`);

// Get all scene elements
const sceneElements = api.getSceneElements();

// Update the scene directly
api.updateScene({
  appState: {
    zoom: { value: 1.5 },  // set zoom to 150%
  },
});

// Bring elements to front / send to back
const selected = ea.getViewSelectedElements();
api.bringToFront(selected);
api.sendToBack(selected);

// Select elements programmatically
api.selectElements(selected);

// Clear undo history
api.history.clear();

// Refresh container sizes (e.g., after changing bound text)
const containers = ea.getViewElements()
  .filter(el => ["rectangle", "ellipse", "diamond"].includes(el.type));
api.updateContainerSize(containers);
```

### Scene Manipulation

```javascript
// Get view center position
const center = ea.getViewCenterPosition();
// { x: number, y: number }

// Get last pointer position on canvas
const pointer = ea.getViewLastPointerPosition();
// { x: number, y: number }

// Zoom to fit specific elements
const elements = ea.getViewSelectedElements();
ea.viewZoomToElements(true, elements);  // true = also select them

// Toggle fullscreen
ea.viewToggleFullScreen();

// Update scene with new appState
ea.viewUpdateScene({
  appState: {
    viewBackgroundColor: "#1e1e1e",
    theme: "dark",
  },
  storeAction: "capture",  // adds to undo history
});
```

### Color Manipulation with ColorMaster

Excalidraw includes the ColorMaster library via `ea.getCM()`:

```javascript
// Get a ColorMaster instance from any color string
const cm = ea.getCM("#ff5733");

// Access color properties
console.log(cm.red, cm.green, cm.blue);
console.log(cm.hue, cm.saturation, cm.lightness);
console.log(cm.alpha);
console.log(cm.format);  // "hex", "rgb", "hsl", etc.

// Transform colors
const darker = cm.darkerBy(20);   // darken by 20%
const lighter = cm.lighterBy(20); // lighten by 20%
const inverted = ea.getCM(cm.stringHEX());
inverted.lightnessTo(Math.abs(cm.lightness - 100));  // invert lightness

// Output in different formats
const hex = cm.stringHEX();    // "#ff5733"
const rgb = cm.stringRGB();    // "rgb(255, 87, 51)"
const hsl = cm.stringHSL();    // "hsl(11, 100%, 60%)"

// Convert color names to hex
const hexColor = ea.colorNameToHex("gold");  // "#ffd700"
```

Real-world example from the "Darken background color" script:

```javascript
const step = 2; // darken by 2%

const elements = ea.getViewSelectedElements()
  .filter(el => ["rectangle", "ellipse", "diamond", "image",
                  "line", "freedraw"].includes(el.type));

ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  const color = ea.colorNameToHex(el.backgroundColor);
  const cm = ea.getCM(color);
  if (cm) {
    const darker = cm.darkerBy(step);
    if (Math.floor(darker.lightness) > 0) {
      el.backgroundColor = darker.stringHSL();
    }
  }
}

await ea.addElementsToView(false, false);
```

### Custom Data on Elements

Elements can carry arbitrary custom data:

```javascript
// Add custom data to an element in the EA workbench
const rectId = ea.addRect(0, 0, 200, 100);
ea.addAppendUpdateCustomData(rectId, {
  myScript: {
    category: "process",
    priority: "high",
    timestamp: Date.now(),
  }
});

await ea.addElementsToView(false, true);

// Later, read custom data from view elements
const elements = ea.getViewElements();
for (const el of elements) {
  if (el.customData?.myScript) {
    console.log(`Category: ${el.customData.myScript.category}`);
  }
}
```

### Bounding Box Calculations

```javascript
const elements = ea.getViewSelectedElements();
const box = ea.getBoundingBox(elements);
// box.topX, box.topY: top-left corner
// box.width, box.height: dimensions

// Use bounding box to create an enclosing shape
const padding = 20;
const enclosingRect = ea.addRect(
  box.topX - padding,
  box.topY - padding,
  box.width + 2 * padding,
  box.height + 2 * padding
);
```

### Z-Index Manipulation

```javascript
// Move an element to a specific z-index
const elements = ea.getViewElements();
const targetElement = elements.find(el => el.type === "text");
if (targetElement) {
  // Move to front (use a large number)
  ea.moveViewElementToZIndex(targetElement.id, elements.length);

  // Move to back (use 0 or negative)
  ea.moveViewElementToZIndex(targetElement.id, 0);

  // Move to specific position
  ea.moveViewElementToZIndex(targetElement.id, 5);
}
```

### Working with Groups

```javascript
// Get maximum groups from elements (identifies distinct groups)
const elements = ea.getViewSelectedElements();
const groups = ea.getMaximumGroups(elements);
// Returns an array of arrays, each inner array is a group of elements

// Find the largest element in each group
for (const group of groups) {
  const largest = ea.getLargestElement(group);
  console.log(`Largest: ${largest.type} (${largest.width}x${largest.height})`);
}
```

### Frame Operations

```javascript
// Create a frame and add existing elements to it
const frameId = ea.addFrame(0, 0, 600, 400, "My Frame");

const text1 = ea.addText(20, 20, "Item 1", { box: "rectangle", boxPadding: 8 });
const text2 = ea.addText(20, 100, "Item 2", { box: "rectangle", boxPadding: 8 });

ea.addElementsToFrame(frameId, [text1, text2]);

await ea.addElementsToView(false, true);
```

### The FloatingModal

For complex UIs beyond what `utils.inputPrompt` offers, use `ea.FloatingModal`:

```javascript
const modal = new ea.FloatingModal(ea.plugin.app);
modal.titleEl.setText("My Custom Dialog");

modal.onOpen = () => {
  const content = modal.contentEl;
  content.empty();

  // Add form elements using Obsidian's Setting API
  new ea.obsidian.Setting(content)
    .setName("Color")
    .addColorPicker(cp => cp
      .setValue("#ff0000")
      .onChange(value => {
        // handle color change
      })
    );

  new ea.obsidian.Setting(content)
    .setName("Size")
    .addSlider(slider => slider
      .setLimits(10, 200, 10)
      .setValue(100)
      .setDynamicTooltip()
    );

  // Add buttons
  const btnContainer = content.createDiv({
    style: "display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;"
  });

  new ea.obsidian.ButtonComponent(btnContainer)
    .setButtonText("Cancel")
    .onClick(() => modal.close());

  new ea.obsidian.ButtonComponent(btnContainer)
    .setButtonText("Apply")
    .setCta()
    .onClick(async () => {
      modal.close();
      // Apply the changes
    });
};

modal.open();
```

### Custom Suggester Classes

You can build autocomplete suggesters using `ea.obsidian.AbstractInputSuggest`,
as demonstrated in the "Deconstruct" script:

```javascript
class FolderSuggest extends ea.obsidian.AbstractInputSuggest {
  constructor(app, inputEl) {
    super(app, inputEl);
    this.inputEl = inputEl;
  }

  getSuggestions(query) {
    const folders = app.vault.getAllLoadedFiles()
      .filter(f => f instanceof ea.obsidian.TFolder);
    const lowerQuery = query.toLowerCase();
    return folders
      .filter(f => f.path.toLowerCase().includes(lowerQuery))
      .map(f => f.path)
      .sort();
  }

  renderSuggestion(value, el) {
    el.setText(value);
  }

  selectSuggestion(value) {
    this.inputEl.value = value;
    this.inputEl.dispatchEvent(new Event("input"));
    this.close();
  }
}

// Usage with a text input:
const folderInput = new ea.obsidian.TextComponent(containerEl);
new FolderSuggest(ea.plugin.app, folderInput.inputEl);
```

### Sidepanel Tabs

Scripts can create persistent sidepanel tabs for always-visible UI:

```javascript
// Check if a tab already exists for this script
let tab = ea.checkForActiveSidepanelTabForScript();
if (tab) {
  // Tab exists, reuse it
  tab.reveal();
} else {
  // Create a new sidepanel tab
  tab = await ea.createSidepanelTab(
    "My Panel",    // title
    true,          // persist across restarts
    true           // reveal immediately
  );
}

if (!tab) return;

// Build the tab's UI
const container = tab.containerEl;
container.empty();
container.createEl("h3", { text: "My Custom Panel" });
container.createEl("p", { text: "This panel persists in the sidebar." });

new ea.obsidian.ButtonComponent(container)
  .setButtonText("Do Something")
  .onClick(() => {
    new Notice("Button clicked!");
  });
```

---

## Part 10: Ten Complete Script Examples

### Script 1: Hello World

Creates a simple text element at the cursor position or center of the view.

```javascript
/*
Hello World Script

Creates a "Hello, World!" text element with a colored background.

```javascript
*/

ea.style.fontSize = 28;
ea.style.fontFamily = 1;  // Virgil
ea.style.strokeColor = "#1e1e1e";
ea.style.backgroundColor = "#d0bfff";
ea.style.fillStyle = "solid";

ea.addText(0, 0, "Hello, World!", {
  textAlign: "center",
  textVerticalAlign: "middle",
  box: "rectangle",
  boxPadding: 20,
});

await ea.addElementsToView(true, true);
// repositionToCursor=true places it at the cursor position
```

### Script 2: Color Changer

Changes the stroke and/or background color of selected elements.

```javascript
/*
Color Changer

Select elements, then run this script to change their colors.

```javascript
*/

const elements = ea.getViewSelectedElements();
if (elements.length === 0) {
  new Notice("Please select at least one element.");
  return;
}

// Define color options
const colorOptions = [
  { label: "Red",    stroke: "#e03131", bg: "#ffc9c9" },
  { label: "Blue",   stroke: "#1971c2", bg: "#a5d8ff" },
  { label: "Green",  stroke: "#2f9e44", bg: "#b2f2bb" },
  { label: "Yellow", stroke: "#e8590c", bg: "#fff3bf" },
  { label: "Purple", stroke: "#7048e8", bg: "#d0bfff" },
  { label: "Gray",   stroke: "#495057", bg: "#dee2e6" },
];

const choice = await utils.suggester(
  colorOptions.map(c => c.label),
  colorOptions,
  "Pick a color scheme"
);
if (!choice) return;

// What to change?
const target = await utils.suggester(
  ["Stroke only", "Background only", "Both"],
  ["stroke", "bg", "both"],
  "What to change?"
);
if (!target) return;

ea.copyViewElementsToEAforEditing(elements);

for (const el of ea.getElements()) {
  if (target === "stroke" || target === "both") {
    el.strokeColor = choice.stroke;
  }
  if (target === "bg" || target === "both") {
    if (el.type !== "text" && el.type !== "arrow" && el.type !== "line") {
      el.backgroundColor = choice.bg;
      el.fillStyle = "solid";
    }
  }
}

await ea.addElementsToView(false, false);
new Notice(`Applied ${choice.label} color scheme to ${elements.length} elements.`);
```

### Script 3: Auto-Label

Adds a numbered label to each selected shape.

```javascript
/*
Auto-Label

Adds sequential number labels to selected shapes.

```javascript
*/

const elements = ea.getViewSelectedElements()
  .filter(el => ["rectangle", "ellipse", "diamond"].includes(el.type));

if (elements.length === 0) {
  new Notice("Select some shapes (rectangles, ellipses, or diamonds).");
  return;
}

const prefix = await utils.inputPrompt(
  "Label prefix (e.g., 'Step '):",
  "prefix",
  "Step "
);
if (prefix === undefined) return;  // cancelled

const startNum = parseInt(
  await utils.inputPrompt("Start numbering at:", "number", "1")
);
if (isNaN(startNum)) {
  new Notice("Invalid number");
  return;
}

// Sort elements left-to-right, top-to-bottom
elements.sort((a, b) => {
  const rowDiff = Math.round((a.y - b.y) / 50);  // group into rows
  if (rowDiff !== 0) return rowDiff;
  return a.x - b.x;
});

ea.style.fontSize = 16;
ea.style.fontFamily = 2;  // Helvetica
ea.style.strokeColor = "#1e1e1e";

for (let i = 0; i < elements.length; i++) {
  const el = elements[i];
  const label = `${prefix}${startNum + i}`;
  const size = ea.measureText(label);

  ea.addText(
    el.x + el.width / 2 - size.width / 2,
    el.y - size.height - 5,
    label
  );
}

await ea.addElementsToView(false, true);
new Notice(`Added ${elements.length} labels.`);
```

### Script 4: Grid Layout

Arranges selected elements in a grid pattern.

```javascript
/*
Grid Layout

Arranges selected elements into a neat grid.

```javascript
*/

if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.5.21")) {
  new Notice("This script requires a newer version of Excalidraw.");
  return;
}

let settings = ea.getScriptSettings();
if (!settings["Columns"]) {
  settings = {
    "Columns": {
      value: 3,
      description: "Number of columns in the grid"
    },
    "Gap": {
      value: 20,
      description: "Gap between elements in pixels"
    },
    "Uniform Size": {
      value: true,
      description: "Make all cells the same size (based on largest element)"
    },
  };
  ea.setScriptSettings(settings);
}

const columns = settings["Columns"].value;
const gap = settings["Gap"].value;
const uniformSize = settings["Uniform Size"];

const elements = ea.getViewSelectedElements()
  .filter(el => el.type !== "arrow" && el.type !== "line");

if (elements.length < 2) {
  new Notice("Select at least 2 elements to arrange in a grid.");
  return;
}

ea.copyViewElementsToEAforEditing(elements);

// Calculate cell size
let cellWidth, cellHeight;
if (uniformSize) {
  cellWidth = Math.max(...elements.map(el => el.width));
  cellHeight = Math.max(...elements.map(el => el.height));
} else {
  cellWidth = 0;
  cellHeight = 0;
}

// Get starting position from the bounding box
const bb = ea.getBoundingBox(elements);
const startX = bb.topX;
const startY = bb.topY;

// Arrange elements
const eaElements = ea.getElements();
for (let i = 0; i < eaElements.length; i++) {
  const col = i % columns;
  const row = Math.floor(i / columns);
  const el = eaElements[i];

  if (uniformSize) {
    el.x = startX + col * (cellWidth + gap) + (cellWidth - el.width) / 2;
    el.y = startY + row * (cellHeight + gap) + (cellHeight - el.height) / 2;
  } else {
    el.x = startX + col * (el.width + gap);
    el.y = startY + row * (el.height + gap);
  }
}

await ea.addElementsToView(false, true);
new Notice(`Arranged ${elements.length} elements in a ${columns}-column grid.`);
```

### Script 5: Sticky Note Creator

Creates a styled sticky note from user input.

```javascript
/*
Sticky Note Creator

Creates a colorful sticky note at the cursor position.

```javascript
*/

let settings = ea.getScriptSettings();
if (!settings["Note Color"]) {
  settings = {
    "Note Color": {
      value: "yellow",
      valueset: ["yellow", "pink", "blue", "green", "orange", "purple"],
      description: "Default sticky note color"
    },
    "Width": {
      value: 200,
      description: "Sticky note width"
    },
  };
  ea.setScriptSettings(settings);
}

const colorSchemes = {
  yellow: { bg: "#fff3bf", stroke: "#e8590c" },
  pink:   { bg: "#fcc2d7", stroke: "#c2255c" },
  blue:   { bg: "#a5d8ff", stroke: "#1971c2" },
  green:  { bg: "#b2f2bb", stroke: "#2f9e44" },
  orange: { bg: "#ffe8cc", stroke: "#e8590c" },
  purple: { bg: "#d0bfff", stroke: "#7048e8" },
};

const noteColor = settings["Note Color"].value;
const noteWidth = settings["Width"].value;

const text = await utils.inputPrompt("Sticky note text:", "Type here...", "", null, 3);
if (!text) return;

const scheme = colorSchemes[noteColor];
ea.style.strokeColor = scheme.stroke;
ea.style.backgroundColor = scheme.bg;
ea.style.fillStyle = "solid";
ea.style.fontSize = 16;
ea.style.fontFamily = 1;
ea.style.roughness = 0;
ea.style.roundness = { type: 3 };

const wrapAt = Math.floor(noteWidth / 10);  // approximate characters per line

const id = ea.addText(0, 0, text, {
  wrapAt: wrapAt,
  textAlign: "center",
  textVerticalAlign: "middle",
  box: "rectangle",
  boxPadding: 12,
  width: noteWidth,
});

await ea.addElementsToView(true, true);
ea.selectElementsInView([ea.getElement(id)]);
```

### Script 6: Link Explorer

Lists all links in the current drawing and offers to navigate to them.

```javascript
/*
Link Explorer

Shows all links in the current drawing and lets you navigate to one.

```javascript
*/

const allElements = ea.getViewElements();

// Collect all links
const links = [];

for (const el of allElements) {
  // Check element links (set via link property)
  if (el.link) {
    links.push({
      label: `[${el.type}] ${el.link}`,
      link: el.link,
      element: el,
    });
  }

  // Check text elements for wiki links
  if (el.type === "text" && el.text) {
    const wikiLinks = el.text.match(/\[\[([^\]]+)\]\]/g);
    if (wikiLinks) {
      for (const wl of wikiLinks) {
        const linkText = wl.replace(/\[\[|\]\]/g, "");
        links.push({
          label: `[text] [[${linkText}]]`,
          link: linkText,
          element: el,
        });
      }
    }
  }
}

if (links.length === 0) {
  new Notice("No links found in this drawing.");
  return;
}

const selected = await utils.suggester(
  links.map(l => l.label),
  links,
  `Found ${links.length} links. Select one to navigate:`
);
if (!selected) return;

// Try to open the linked file
const linkedFile = app.metadataCache.getFirstLinkpathDest(
  selected.link.split("|")[0].split("#")[0],  // strip alias and heading
  ea.targetView.file.path
);

if (linkedFile) {
  ea.openFileInNewOrAdjacentLeaf(linkedFile);
} else {
  // Not an internal link, try opening as URL
  if (selected.link.startsWith("http")) {
    window.open(selected.link);
  } else {
    new Notice(`Could not resolve: ${selected.link}`);
  }
}

// Highlight the source element
ea.selectElementsInView([selected.element]);
```

### Script 7: Element Stats

Shows statistics about the current drawing.

```javascript
/*
Element Stats

Displays statistics about the elements in the current drawing.

```javascript
*/

const allElements = ea.getViewElements();

if (allElements.length === 0) {
  new Notice("This drawing has no elements.");
  return;
}

// Count elements by type
const typeCounts = {};
for (const el of allElements) {
  typeCounts[el.type] = (typeCounts[el.type] || 0) + 1;
}

// Calculate bounding box of all elements
const bb = ea.getBoundingBox(allElements);

// Count unique colors
const strokeColors = new Set();
const bgColors = new Set();
for (const el of allElements) {
  if (el.strokeColor) strokeColors.add(el.strokeColor);
  if (el.backgroundColor && el.backgroundColor !== "transparent") {
    bgColors.add(el.backgroundColor);
  }
}

// Count text characters
let totalChars = 0;
let totalWords = 0;
for (const el of allElements) {
  if (el.type === "text" && el.text) {
    totalChars += el.text.length;
    totalWords += el.text.split(/\s+/).filter(w => w.length > 0).length;
  }
}

// Build the report
const lines = [
  `Drawing Statistics`,
  ``,
  `Total elements: ${allElements.length}`,
  ``,
  `By type:`,
];

for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`  ${type}: ${count}`);
}

lines.push(``);
lines.push(`Canvas area: ${Math.round(bb.width)} x ${Math.round(bb.height)} px`);
lines.push(`Unique stroke colors: ${strokeColors.size}`);
lines.push(`Unique background colors: ${bgColors.size}`);

if (totalChars > 0) {
  lines.push(``);
  lines.push(`Text: ${totalWords} words, ${totalChars} characters`);
}

// Show as multi-line notice
const report = lines.join("\n");
await utils.inputPrompt("Drawing Statistics", "", report, null, lines.length);
```

### Script 8: Batch Styler

Applies consistent styling across all selected elements.

```javascript
/*
Batch Styler

Applies consistent styling to all selected elements of a given type.

```javascript
*/

const elements = ea.getViewSelectedElements();
if (elements.length === 0) {
  new Notice("Select elements to style.");
  return;
}

// Determine what to style
const styleTarget = await utils.suggester(
  [
    "Stroke color",
    "Background color",
    "Stroke width",
    "Font size",
    "Roughness (Architect/Artist/Cartoonist)",
    "Opacity",
    "Fill style",
  ],
  ["strokeColor", "backgroundColor", "strokeWidth", "fontSize",
   "roughness", "opacity", "fillStyle"]
);
if (!styleTarget) return;

let newValue;

switch (styleTarget) {
  case "strokeColor":
  case "backgroundColor": {
    const presets = [
      "#1e1e1e", "#e03131", "#1971c2", "#2f9e44",
      "#e8590c", "#7048e8", "#0c8599", "#f08c00",
      "transparent",
    ];
    newValue = await utils.suggester(presets, presets, "Select a color");
    if (!newValue) return;
    break;
  }
  case "strokeWidth": {
    newValue = parseFloat(
      await utils.inputPrompt("Stroke width:", "1-10", "2")
    );
    if (isNaN(newValue)) return;
    break;
  }
  case "fontSize": {
    newValue = parseInt(
      await utils.inputPrompt("Font size:", "12-72", "20")
    );
    if (isNaN(newValue)) return;
    break;
  }
  case "roughness": {
    newValue = await utils.suggester(
      ["Architect (0)", "Artist (1)", "Cartoonist (2)"],
      [0, 1, 2],
      "Select roughness"
    );
    if (newValue === undefined) return;
    break;
  }
  case "opacity": {
    newValue = parseInt(
      await utils.inputPrompt("Opacity (0-100):", "0-100", "100")
    );
    if (isNaN(newValue)) return;
    newValue = Math.max(0, Math.min(100, newValue));
    break;
  }
  case "fillStyle": {
    newValue = await utils.suggester(
      ["Hachure", "Cross-hatch", "Solid"],
      ["hachure", "cross-hatch", "solid"],
      "Select fill style"
    );
    if (!newValue) return;
    break;
  }
}

ea.copyViewElementsToEAforEditing(elements);

let count = 0;
for (const el of ea.getElements()) {
  if (styleTarget === "fontSize" && el.type !== "text") continue;
  if (el[styleTarget] !== undefined || styleTarget === "backgroundColor") {
    el[styleTarget] = newValue;
    count++;
    // Refresh text dimensions if font size changed
    if (styleTarget === "fontSize" && el.type === "text") {
      ea.refreshTextElementSize(el.id);
    }
  }
}

await ea.addElementsToView(false, true);
new Notice(`Applied ${styleTarget} = ${newValue} to ${count} elements.`);
```

### Script 9: Template Stamper

Loads elements from a template drawing and stamps them at the cursor position.

```javascript
/*
Template Stamper

Select a template drawing and stamp its elements at the current cursor position.

```javascript
*/

if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.8.0")) {
  new Notice("This script requires a newer version of Excalidraw.");
  return;
}

// Get list of Excalidraw files that can serve as templates
const allFiles = app.vault.getFiles();
const excalidrawFiles = allFiles
  .filter(f => ea.isExcalidrawFile(f))
  .sort((a, b) => a.basename.localeCompare(b.basename));

if (excalidrawFiles.length === 0) {
  new Notice("No Excalidraw files found to use as templates.");
  return;
}

// Let user pick a template
const templateFile = await utils.suggester(
  excalidrawFiles.map(f => f.basename),
  excalidrawFiles,
  "Select a template to stamp"
);
if (!templateFile) return;

// Load the template scene
const scene = await ea.getSceneFromFile(templateFile);
if (!scene || !scene.elements || scene.elements.length === 0) {
  new Notice("Template has no elements.");
  return;
}

// Copy template elements into EA workbench
for (const el of scene.elements) {
  const cloned = ea.cloneElement(el);  // gives it a new ID
  ea.elementsDict[cloned.id] = cloned;
}

// Stamp at cursor position
await ea.addElementsToView(true, true);
// repositionToCursor=true moves all elements to the cursor position

new Notice(`Stamped ${scene.elements.length} elements from "${templateFile.basename}".`);
```

### Script 10: Kanban Board

Creates a simple kanban board structure with columns and cards.

```javascript
/*
Kanban Board

Creates a kanban board with configurable columns.

```javascript
*/

let settings = ea.getScriptSettings();
if (!settings["Column Names"]) {
  settings = {
    "Column Names": {
      value: "To Do,In Progress,Done",
      description: "Comma-separated column names"
    },
    "Column Width": {
      value: 250,
      description: "Width of each column in pixels"
    },
    "Column Height": {
      value: 500,
      description: "Height of each column in pixels"
    },
    "Gap": {
      value: 20,
      description: "Gap between columns"
    },
  };
  ea.setScriptSettings(settings);
}

const columnNames = settings["Column Names"].value.split(",").map(s => s.trim());
const colWidth = settings["Column Width"].value;
const colHeight = settings["Column Height"].value;
const gap = settings["Gap"].value;

const headerHeight = 50;
const totalWidth = columnNames.length * colWidth + (columnNames.length - 1) * gap;

// Create the board frame
const frameId = ea.addFrame(
  -gap, -gap,
  totalWidth + 2 * gap,
  colHeight + headerHeight + 2 * gap,
  "Kanban Board"
);

const elementIds = [];

for (let i = 0; i < columnNames.length; i++) {
  const x = i * (colWidth + gap);

  // Column header background
  ea.style.strokeColor = "#495057";
  ea.style.backgroundColor = "#e9ecef";
  ea.style.fillStyle = "solid";
  ea.style.roughness = 0;
  ea.style.roundness = { type: 3 };

  const headerBgId = ea.addRect(x, 0, colWidth, headerHeight);
  elementIds.push(headerBgId);

  // Column header text
  ea.style.fontSize = 18;
  ea.style.fontFamily = 2;  // Helvetica
  ea.style.strokeColor = "#1e1e1e";

  const headerSize = ea.measureText(columnNames[i]);
  const headerTextId = ea.addText(
    x + colWidth / 2 - headerSize.width / 2,
    headerHeight / 2 - headerSize.height / 2,
    columnNames[i]
  );
  elementIds.push(headerTextId);

  // Column body (lighter background)
  ea.style.strokeColor = "#ced4da";
  ea.style.backgroundColor = "#f8f9fa";
  ea.style.fillStyle = "solid";
  ea.style.strokeWidth = 1;

  const bodyId = ea.addRect(x, headerHeight, colWidth, colHeight);
  elementIds.push(bodyId);

  // Add a sample card to the first column
  if (i === 0) {
    ea.style.strokeColor = "#868e96";
    ea.style.backgroundColor = "#ffffff";
    ea.style.fillStyle = "solid";
    ea.style.fontSize = 14;
    ea.style.fontFamily = 2;

    const cardId = ea.addText(
      x + 10,
      headerHeight + 10,
      "Sample task\nClick to edit",
      {
        textAlign: "left",
        box: "rectangle",
        boxPadding: 8,
        width: colWidth - 20,
      }
    );
    elementIds.push(cardId);
  }
}

// Add all elements to the frame
ea.addElementsToFrame(frameId, elementIds);

await ea.addElementsToView(true, true);
new Notice(`Created kanban board with ${columnNames.length} columns.`);
```

---

## Part 11: Script Development Tips and Debugging

### Using console.log with DevTools

Open DevTools in Obsidian with `Ctrl+Shift+I` (or `Cmd+Opt+I` on Mac).
All `console.log()` output from your scripts appears in the Console tab.

```javascript
const elements = ea.getViewSelectedElements();
console.log("Selected elements:", elements);
console.log("Element count:", elements.length);
console.log("First element:", JSON.stringify(elements[0], null, 2));
```

### Using Notice for Quick Feedback

`new Notice()` is the quickest way to show feedback:

```javascript
new Notice("Script started!");
new Notice(`Found ${elements.length} elements`);
new Notice("Done!", 4000);  // show for 4 seconds
```

### Common Errors and How to Fix Them

**"targetView not set"**
This means the script tried to access view-related functions (like
`getViewSelectedElements()`) but there is no active Excalidraw view. Make sure
an Excalidraw drawing is open and focused when you run the script.

**"Cannot read property of undefined"**
Usually means you are trying to access a property on a null element. Always check
return values:
```javascript
const elements = ea.getViewSelectedElements();
if (!elements || elements.length === 0) {
  new Notice("Select something first");
  return;
}
```

**Elements do not appear after `addElementsToView()`**
Make sure you are calling `await` on async operations and that you have actually
added elements to the EA workbench before committing:
```javascript
// Wrong: forgot to create elements
await ea.addElementsToView(false, true);  // nothing happens

// Correct:
ea.addRect(0, 0, 100, 100);  // add to workbench first
await ea.addElementsToView(false, true);
```

**Script modifies wrong elements**
Remember that `copyViewElementsToEAforEditing` copies elements into the workbench.
If you then create new elements, `getElements()` returns both the copied and the
new elements. Filter carefully:
```javascript
ea.copyViewElementsToEAforEditing(selectedElements);
// ea.getElements() now includes copies of selectedElements
```

**Text dimensions are wrong after modification**
After changing text content, font size, or font family, call
`ea.refreshTextElementSize(elementId)` to recalculate dimensions.

### Performance Considerations

- **Large drawings**: Scripts that iterate over all elements (e.g.,
  `ea.getViewElements()`) can be slow on drawings with thousands of elements.
  Filter early and work with minimal sets.
- **Multiple addElementsToView calls**: Each call triggers a scene update and
  potential re-render. Batch all your changes and call `addElementsToView()` once.
- **Image operations**: `addImage()` and related functions are async and involve
  file I/O. They are slower than adding shapes.
- **Save wisely**: Passing `save: true` (second arg to `addElementsToView`) writes
  to disk. For iterative operations, use `false` and save once at the end.

### Testing Scripts Safely

- **Use a test vault**: When developing complex scripts, use a dedicated test vault
  or a test drawing that you do not mind corrupting.
- **Ctrl+Z works**: Excalidraw supports undo. If your script produces bad results,
  `Ctrl+Z` (or `Cmd+Z`) will undo the changes.
- **Incremental development**: Start with `console.log` statements to verify your
  data before adding elements to the view. Only call `addElementsToView()` when
  you are confident the data is correct.

### The ea.help() Method

In the Obsidian Developer Console, you can call `ea.help()` to get information
about EA functions:

```javascript
// In the developer console:
ea.help(ea.addRect)          // shows addRect documentation
ea.help("style")             // shows style property info
ea.help("utils.inputPrompt") // shows inputPrompt documentation
```

### Using the LLM Training File for AI-Assisted Script Generation

The Excalidraw plugin wiki includes a comprehensive training file designed
specifically for LLM/AI consumption:

```
07 Developer Docs/Excalidraw Automate library file (not only) for LLM training.md
```

This file contains the complete ExcalidrawAutomate API surface with documentation.
You can feed it to an AI assistant (like Claude or GPT) along with your script
requirements to get generated script code. The file is structured as a TypeScript
declaration file that covers every public method and property.

### Useful Debugging Snippets

**Inspect an element's properties:**
```javascript
const el = ea.getViewSelectedElement();
if (el) {
  console.log(JSON.stringify(el, null, 2));
}
```

**List all element types in the drawing:**
```javascript
const types = new Set(ea.getViewElements().map(el => el.type));
console.log("Element types:", Array.from(types));
```

**Check what keys exist on an element:**
```javascript
const el = ea.getViewSelectedElement();
if (el) console.log("Keys:", Object.keys(el));
```

**Inspect the app state:**
```javascript
const api = ea.getExcalidrawAPI();
const state = api.getAppState();
console.log("Current stroke color:", state.currentItemStrokeColor);
console.log("Current bg color:", state.currentItemBackgroundColor);
console.log("Zoom:", state.zoom.value);
```

---

## Part 12: Script Publishing

### Contributing Scripts to the Community Library

The community script library is maintained in the `ea-scripts/` directory of the
plugin's GitHub repository. To contribute:

1. **Create your script** as a `.md` file following the standard format.
2. **Create an SVG icon** with the same base name.
3. **Fork the repository** on GitHub.
4. **Add your files** to the `ea-scripts/` directory.
5. **Submit a Pull Request** with a clear description of what the script does.

### File Format for Community Scripts

Your script `.md` file should follow this format:

```markdown
/*
![](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/images/scripts-my-script.jpg)

Description of what the script does. Be clear and concise.
Include a screenshot or animation if possible.

See documentation for more details:
https://zsviczian.github.io/obsidian-excalidraw-plugin/ExcalidrawScriptsEngine.html

```javascript
*/

// Your script code here
if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.0.0")) {
  new Notice("This script requires a newer version of Excalidraw.");
  return;
}

// ... rest of the script
```

The documentation comment block at the top (inside `/* ... */`) serves as the
script's README when viewed in the Script Store.

### Naming Conventions

- Use **descriptive, title-case names** for your script file:
  `Box Selected Elements.md`, not `box_elements.md`
- The filename (minus `.md`) becomes the command name in the palette
- Keep names reasonably short but clear

### SVG Icon Guidelines

- Create a simple, recognizable icon in SVG format
- Use the same base name as the script: `My Script.md` + `My Script.svg`
- Keep the SVG clean and simple -- it will be rendered small in the toolbar
- Standard Excalidraw script icons are typically 20x20 to 24x24 viewBox

### Documentation Standards

Good community scripts include:

1. **A clear description** of what the script does
2. **Screenshots or animations** showing the script in action
3. **Settings documentation** if the script uses persistent settings
4. **Version requirements** via `ea.verifyMinimumPluginVersion()`
5. **Error handling** with user-friendly `Notice` messages

### The Script Store Distribution

When users run the "Install or update Excalidraw scripts" command, the plugin
fetches a script index from the repository. Scripts listed in the index are
available for one-click installation. The index file and the scripts themselves
are fetched from the `ea-scripts/` directory.

---

## Quick Reference: Element Properties

Every element in Excalidraw has these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique 8-character identifier |
| `type` | string | "rectangle", "ellipse", "diamond", "text", "arrow", "line", "freedraw", "image", "frame", "embeddable" |
| `x` | number | X coordinate of top-left corner |
| `y` | number | Y coordinate of top-left corner |
| `width` | number | Element width |
| `height` | number | Element height |
| `angle` | number | Rotation angle in radians |
| `strokeColor` | string | Border/stroke color |
| `backgroundColor` | string | Fill color |
| `fillStyle` | string | "hachure", "cross-hatch", "solid" |
| `strokeWidth` | number | Border width |
| `strokeStyle` | string | "solid", "dashed", "dotted" |
| `roughness` | number | 0=architect, 1=artist, 2=cartoonist |
| `opacity` | number | 0-100 |
| `groupIds` | string[] | Array of group IDs this element belongs to |
| `frameId` | string | ID of containing frame (if any) |
| `link` | string | URL or internal link |
| `isDeleted` | boolean | Whether the element is marked as deleted |
| `customData` | object | Arbitrary custom data |
| `boundElements` | array | Elements bound to this one (e.g., bound text) |
| `roundness` | object|null | `{ type: number, value?: number }` or null |

**Text-specific properties:**

| Property | Type | Description |
|----------|------|-------------|
| `text` | string | The displayed text content |
| `originalText` | string | The original text before wrapping |
| `rawText` | string | The raw text content |
| `fontSize` | number | Font size |
| `fontFamily` | number | 1=Virgil, 2=Helvetica, 3=Cascadia, 4=Local |
| `textAlign` | string | "left", "center", "right" |
| `verticalAlign` | string | "top", "middle", "bottom" |
| `containerId` | string | ID of containing shape (if bound) |
| `autoResize` | boolean | Whether text auto-resizes |
| `lineHeight` | number | Line height multiplier |

**Line/Arrow-specific properties:**

| Property | Type | Description |
|----------|------|-------------|
| `points` | number[][] | Array of [x,y] coordinates relative to element origin |
| `startBinding` | object | Binding info for start point |
| `endBinding` | object | Binding info for end point |
| `startArrowhead` | string|null | Arrowhead at start |
| `endArrowhead` | string|null | Arrowhead at end |
| `lastCommittedPoint` | array|null | Last committed point |

## Quick Reference: ea.style Properties

These are set before creating elements to control their appearance:

```javascript
ea.style.strokeColor      = "#000000";       // any CSS color
ea.style.backgroundColor  = "transparent";   // any CSS color
ea.style.angle             = 0;              // radians
ea.style.fillStyle         = "hachure";      // "hachure"|"cross-hatch"|"solid"
ea.style.strokeWidth       = 1;              // pixels
ea.style.strokeStyle       = "solid";        // "solid"|"dashed"|"dotted"
ea.style.roughness         = 1;              // 0|1|2
ea.style.opacity           = 100;            // 0-100
ea.style.roundness         = null;           // null | {type:3}
ea.style.fontFamily        = 1;              // 1=Virgil,2=Helvetica,3=Cascadia,4=Local
ea.style.fontSize          = 20;             // pixels
ea.style.textAlign         = "left";         // "left"|"center"|"right"
ea.style.verticalAlign     = "top";          // "top"|"middle"|"bottom"
ea.style.startArrowHead    = null;           // arrowhead type or null
ea.style.endArrowHead      = "arrow";        // arrowhead type or null
```

## Quick Reference: Key Methods

```
ea.addRect(x, y, w, h)                    -> elementId
ea.addEllipse(x, y, w, h)                 -> elementId
ea.addDiamond(x, y, w, h)                 -> elementId
ea.addText(x, y, text, formatting?)        -> elementId (or container id if box)
ea.addLine(points)                         -> elementId
ea.addArrow(points, formatting?)           -> elementId
ea.addImage(x, y, file, scale?, anchor?)   -> Promise<elementId>
ea.addFrame(x, y, w, h, name?)            -> elementId
ea.addBlob(x, y, w, h)                    -> elementId

ea.connectObjects(idA, connA, idB, connB, formatting?)  -> elementId
ea.addLabelToLine(lineId, label)                         -> elementId
ea.addToGroup(elementIds)                                -> groupId
ea.addElementsToFrame(frameId, elementIds)               -> void

ea.getElement(id)                          -> element
ea.getElements()                           -> element[]
ea.getViewElements()                       -> element[]
ea.getViewSelectedElements()               -> element[]
ea.getViewSelectedElement()                -> element

ea.copyViewElementsToEAforEditing(elements)  -> void
ea.addElementsToView(reposition?, save?, onTop?)  -> Promise<boolean>
ea.deleteViewElements(elements)                    -> boolean
ea.selectElementsInView(elements)                  -> void

ea.getBoundingBox(elements)                -> {topX, topY, width, height}
ea.measureText(text)                       -> {width, height}
ea.wrapText(text, lineLen)                 -> string
ea.refreshTextElementSize(id)              -> void
ea.cloneElement(element)                   -> element

ea.getExcalidrawAPI()                      -> ExcalidrawImperativeAPI
ea.viewUpdateScene(scene)                  -> void
ea.viewZoomToElements(select, elements)    -> void
ea.viewToggleFullScreen()                  -> void

ea.getScriptSettings()                     -> object
ea.setScriptSettings(settings)             -> Promise<void>
ea.verifyMinimumPluginVersion(version)     -> boolean

ea.create(params?)                         -> Promise<string>
ea.openFileInNewOrAdjacentLeaf(file)       -> WorkspaceLeaf
ea.createSVG(...)                          -> Promise<SVGSVGElement>
ea.createPNG(...)                          -> Promise<Blob>
ea.createPDF(...)                          -> Promise<void>

ea.getCM(color)                            -> ColorMaster
ea.colorNameToHex(name)                    -> string
ea.generateElementId()                     -> string
ea.isExcalidrawFile(file)                  -> boolean

ea.registerThisAsViewEA()                  -> boolean
ea.deregisterThisAsViewEA()                -> boolean
ea.getViewLastPointerPosition()            -> {x, y}
ea.getViewCenterPosition()                 -> {x, y}
ea.moveViewElementToZIndex(id, index)      -> void
ea.getMaximumGroups(elements)              -> element[][]
ea.getLargestElement(elements)             -> element
ea.addAppendUpdateCustomData(id, data)     -> element

ea.obsidian                                -> Obsidian module
ea.FloatingModal                           -> FloatingModal class
ea.plugin                                  -> ExcalidrawPlugin
ea.targetView                              -> ExcalidrawView
```

---

## Source File References

The key source files for understanding the script API:

- **Script Engine**: `src/shared/Scripts.ts` -- how scripts are loaded, registered as commands, and executed
- **ExcalidrawAutomate**: `src/shared/ExcalidrawAutomate.ts` -- the complete `ea` API (4000+ lines)
- **Dialog utilities**: `src/shared/Dialogs/Prompt.ts` -- the `GenericInputPrompt` and `GenericSuggester` classes used by `utils`
- **Community scripts**: `ea-scripts/*.md` -- 80+ real-world script examples
- **Type definitions**: `src/types/excalidrawAutomateTypes.ts` -- TypeScript types for EA
- **Utility functions**: `src/utils/excalidrawAutomateUtils.ts` -- helper functions used internally by EA
