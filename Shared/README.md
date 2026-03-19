# Excalidraw Scripts

Custom scripts for the Excalidraw plugin in Obsidian. These add functionality that the plugin doesn't provide out of the box.

## Prerequisites

- Obsidian with the **Excalidraw** plugin installed and enabled

---

## Script 1: Link-Based Clipboard System

**What it does:** Turn any Excalidraw element into a click-to-copy button. Add a link to any shape (Ctrl+K), and clicking it copies that text to your clipboard instead of navigating.

**Features:**
- Special prefixes auto-stripped when copying: `email:`, `tel:`, `copy:`, `clip:`
- Clipboard history (last 50 items)
- Commands in palette: "Show clipboard history", "Highlight clipboard elements"
- Regular URLs (http/https) still work normally

### Installation

1. Go to **Settings > Excalidraw > Startup Script** (this opens your `ExcalidrawStartup.md` file)
2. Scroll to the very bottom of the file
3. Paste the entire contents of `startup-integration.js`
4. Save the file (Ctrl+S)
5. Reopen any Excalidraw drawing — you should see "Link-based clipboard system loaded!"

### Usage

1. Draw any element (rectangle, text, ellipse, etc.)
2. Select it and press **Ctrl+K** to add a link
3. Type the text you want copied (e.g., `john@example.com` or `git commit -m "feat: "`)
4. Click OK
5. Now click that element — the text is copied to your clipboard

---

## Script 2: Mermaid-to-Excalidraw

**What it does:** Converts Mermaid diagram syntax into Excalidraw elements on your canvas.

### Installation

1. Copy `Mermaid-to-Excalidraw.md` and `to_convert.md` into the **same folder** in your vault (e.g., `Excalidraw/Scripts/`)
2. **Edit the first line** of `Mermaid-to-Excalidraw.md` — change `SCRIPT_PATH` to match where you placed the file:
   ```javascript
   const SCRIPT_PATH = "Excalidraw/Scripts/Mermaid-to-Excalidraw.md";
   ```

### Usage

1. Open `to_convert.md` and paste your Mermaid code (with or without ```mermaid fences)
2. Open an Excalidraw drawing
3. Run the script from the command palette: **Excalidraw: Run script** > select `Mermaid-to-Excalidraw`
4. The diagram appears on your canvas

**Note:** Flowcharts (`graph`/`flowchart`) produce native editable shapes. All other diagram types (sequence, class, state, etc.) render as images.

---

## Script 3: Text to Box

**What it does:** Wraps a selected text element in a rectangle, centers the text inside, and groups them.

### Installation

1. Copy `Text to Box.md` into your Excalidraw scripts folder

### Usage

1. Create a text element in Excalidraw
2. Select it
3. Run from command palette: **Excalidraw: Run script** > select `Text to Box`
4. The text is now inside a styled rectangle, grouped together
