---
title: Installation
source: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/installation
---

# Installation

`@excalidraw/mermaid-to-excalidraw` is published to npm. This library is used in [excalidraw](https://excalidraw.com) to transform mermaid syntax to Excalidraw diagrams.

Using `npm`

```
npm install @excalidraw/mermaid-to-excalidraw
```

Using `yarn`

```
yarn add @excalidraw/mermaid-to-excalidraw
```

## Usage[​](#usage "Direct link to heading")

Once the library is installed, its ready to use.

```
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";  
import { convertToExcalidrawElements}  from "@excalidraw/excalidraw"  
  
try {  
  const { elements, files } = await parseMermaid(diagramDefinition, {  
    fontSize: DEFAULT_FONT_SIZE,  
  });  
  // currently the elements returned from the parser are in a "skeleton" format  
  // which we need to convert to fully qualified excalidraw elements first  
  const excalidrawElements = convertToExcalidrawElements(elements);  
  
  // Render elements and files on Excalidraw  
} catch (e) {  
  // Error handling  
}
```

## Playground[​](#playground "Direct link to heading")

Try it out [here](https://mermaid-to-excalidraw.vercel.app)