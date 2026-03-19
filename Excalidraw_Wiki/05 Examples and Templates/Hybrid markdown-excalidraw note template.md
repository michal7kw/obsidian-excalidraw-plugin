---
aliases:
  - WIKI/05+Examples+and+Templates/Hybrid+markdown-excalidraw+note+template
permalink: wiki/hybrid-notes
source: https://excalidraw-obsidian.online/WIKI/05%20Examples%20and%20Templates/Hybrid%20markdown-excalidraw%20note%20template.md
---
%% <%* throw(new Error("Cannibalization")); %> %%
This is an advanced version of the template Nicole uses in her video:  
![Why I changed all my templates](https://youtu.be/zmgqMZi6QL8?t=950).

This template assumes you have [Templater](https://github.com/SilentVoid13/Templater) installed and configured to run on new file creation. The template will:

- Default to opening in markdown mode, but you can switch to Excalidraw view using the command palette action `Excalidraw: Toggle between Excalidraw and Markdown mode`.
- Auto-export an SVG with the same file-name when you save the file in Excalidraw mode.
- Create an initial small dummy SVG file so that when you rename your new "Untitled" note, the "Untitled.svg" will also be renamed.
- Prevent Templater from reprocessing the template when synced across devices, which can otherwise cause issues. If you're syncing your Vault to multiple devices (I use 6), Templater will incorrectly treat synced files as new and run the template again, rendering it unusable.

This template also leverages the `excalidraw-embed-md` frontmatter property. When this property is set to `true`, embedding the Excalidraw file into another markdown note will display the markdown content (the "back of the note") instead of rendering the drawing as an image. This is useful if you want to show the text and metadata of your drawing directly in other notes.

If you prefer to always display the drawing as an image—even when `excalidraw-embed-md` is enabled—you can use the special embed syntax:

`![[drawing#^as-image]]`

Here, `as-image` is a phantom block reference that forces image rendering, overriding the markdown embed behavior.

### How to use the snippet:

1. Copy the markdown block below to an empty note. Make sure the note doesn't have any document properties, or switch the Obsidian Editor to Properties in Source mode to ensure this in Obsidian Settings.
2. Replace the escaped ticks ( `\` ) by removing the 6 backslashes — 3 before `json` and 3 before the second `%%`.
3. For more details about the "Cannibalization" at the beginning of the file, read: [[Obsidian Templater Tricks#Templater Cannibalizes Templates with Obsidian Sync]].

```markdown
---
excalidraw-plugin: parsed
excalidraw-open-md: true
excalidraw-embed-md: true
excalidraw-autoexport: svg
---
<%*
  const PATH = app.plugins.plugins["templater-obsidian"].settings.templates_folder;
  if(tp.file.folder(true) === PATH) throw(new Error("Cannibalization"));
%>

# [[<% tp.file.title%>]]

![[<% tp.file.title%>.svg]]
<%*
  const path = (tp.file.folder() === "" ? "" : `${tp.file.folder(true)}/`) + `${tp.file.title}.svg`;
  if(!app.vault.getAbstractFileByPath(path)) {
	app.vault.create(path, `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>`);
  }
%>

%%
# Excalidraw Data
## Text Elements
## Drawing
\`\`\`json
{"type":"excalidraw","version":2,"source":"","elements":[],"appState":{}}
\`\`\`
%%
```