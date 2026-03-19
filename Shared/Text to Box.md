/*
title: Text to Box
description: Transforms the selected text element into a rectangle with the text inside.
pluginVersion: 1.7.19
```javascript
*/

if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.7.19")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}
await ea.addElementsToView(); // Ensure view is up-to-date

const selectedElements = ea.getViewSelectedElements();

if (selectedElements.length !== 1 || selectedElements[0].type !== "text") {
  new Notice("Please select a single text element.");
  return;
}

const textElement = selectedElements[0];
// Dynamic padding based on font size, with a minimum
const PADDING = Math.max(10, textElement.fontSize * 0.6);

// Calculate dimensions and position for the new rectangle
const rectWidth = textElement.width + 2 * PADDING;
const rectHeight = textElement.height + 2 * PADDING;
const rectX = textElement.x - PADDING;
const rectY = textElement.y - PADDING;

// 1. Add rectangle
const rectId = ea.addRect(rectX, rectY, rectWidth, rectHeight, {
  strokeColor: textElement.strokeColor,
  backgroundColor: textElement.backgroundColor === "transparent" ? "transparent" : textElement.backgroundColor,
  fillStyle: textElement.fillStyle || "hachure",
  strokeWidth: textElement.strokeWidth || 1,
  strokeStyle: textElement.strokeStyle || "solid",
  roughness: textElement.roughness === undefined ? 1 : textElement.roughness,
  opacity: textElement.opacity === undefined ? 100 : textElement.opacity,
  roundness: { type: 3 }, // Adaptive roundness
  angle: textElement.angle || 0,
});

// 2. Center the original text element within the new rectangle
const rectCenterX = rectX + rectWidth / 2;
const rectCenterY = rectY + rectHeight / 2;

const textX = rectCenterX - textElement.width / 2;
const textY = rectCenterY - textElement.height / 2;

textElement.x = textX;
textElement.y = textY;
textElement.textAlign = "center";
textElement.verticalAlign = "middle";

// Update the text element in the dictionary to reflect its new position and alignment
ea.elementsDict[textElement.id] = textElement;

// 3. Group both elements
ea.addToGroup([rectId, textElement.id]);


// Refresh the view from elementsDict, selecting new elements
await ea.addElementsToView(false, true);