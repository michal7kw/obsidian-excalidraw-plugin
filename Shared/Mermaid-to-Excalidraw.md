// =============================================
// CONFIGURATION — Change this path to match
// where you placed this script in your vault
// =============================================
const SCRIPT_PATH = "Excalidraw/Scripts/Mermaid-to-Excalidraw.md";

// Get the script file's folder path
const scriptFile = app.vault.getAbstractFileByPath(SCRIPT_PATH);
if (!scriptFile) {
  new Notice("Error: Script path not found. Update SCRIPT_PATH in the script to match its location in your vault.\nCurrent: " + SCRIPT_PATH);
  return;
}
const folderPath = scriptFile.parent.path;

// Read to_convert.md from the same folder
const targetFile = app.vault.getAbstractFileByPath(folderPath + "/to_convert.md");

if (!targetFile) {
  new Notice("Error: to_convert.md not found in " + folderPath + "\nCreate it and paste your Mermaid code there.");
  return;
}

let mermaidCode = await app.vault.read(targetFile);

// Remove markdown code fences if present (```mermaid or ```)
mermaidCode = mermaidCode
  .replace(/^```(?:mermaid)?\s*\n?/gm, "")
  .replace(/```\s*$/gm, "")
  .trim();

if (!mermaidCode) {
  new Notice("Error: to_convert.md is empty. Paste your Mermaid diagram code there.");
  return;
}

// Initialize Excalidraw Automate
ea = ExcalidrawAutomate;
ea.reset();
ea.setView("first");

// Convert Mermaid to Excalidraw
await ea.addMermaid(mermaidCode);
ea.addElementsToView();

new Notice("Mermaid diagram converted!");
