---
title: API
source: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/api
---

# API

At the moment the mermaid-to-excalidraw works in two steps. First, you call `parseMermaidToExcalidraw(mermaidSyntax)` on the mermaid diagram definition string, which resolves with elements in a skeleton format — a simplified excalidraw JSON format (docs coming soon). You then pass them to `convertToExcalidrawElements(elements)` to get the fully qualified excalidraw elements you can render in the editor.

The need for these two steps is due to the [@excalidraw/excalidraw](/docs/@excalidraw/excalidraw/installation) being a **UMD** build so we currently cannot import the `convertToExcalidrawElements()` util alone, until we support a tree-shakeable **ESM** build.

## parseMermaidToExcalidraw[​](#parsemermaidtoexcalidraw "Direct link to heading")

This API receives the mermaid syntax as the input, and resolves to skeleton Excalidraw elements. You will need to call `convertToExcalidraw` API to convert them to fully qualified elements that you can render in Excalidraw.

**Example**

```
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";  
import { convertToExcalidrawElements}  from "@excalidraw/excalidraw"  
try {  
  const { elements, files } = await parseMermaidToExcalidraw(mermaidSyntax: string, {  
    fontSize: number,  
  });  
  const excalidrawElements = convertToExcalidrawElements(elements);  
  // Render elements and files on Excalidraw  
} catch (e) {  
  // Parse error, displaying error message to users  
}
```

## Supported Diagram Types[​](#supported-diagram-types "Direct link to heading")

Currently only [flowcharts](https://mermaid.js.org/syntax/flowchart.html) are supported. Oother diagram types will be rendered as an image in Excalidraw.

### Flowchart[​](#flowchart "Direct link to heading")

#### Excalidraw Regular Shapes[​](#excalidraw-regular-shapes "Direct link to heading")

**Rectangles**, **Circle**, **Diamond**, and **Arrows** are fully supported in Excalidraw

```
flowchart TD  
  A[Christmas] -->|Get money| B(Go shopping)  
  B --> C{Let me think}  
  C -->|One| D[Laptop]  
  C -->|Two| E[iPhone]  
  C -->|Three| F[Car]
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/c8ea84fc-e9fb-4652-9a12-154136d1a798)

```
flowchart LR  
  id1((Hello from Circle))
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/6202a8b9-8aa7-451e-9478-4d8d75c0f2fa)

#### Subgraphs[​](#subgraphs "Direct link to heading")

Subgraphs are grouped diagrams hence they are also supported in Excalidraw

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

![](https://github.com/excalidraw/excalidraw/assets/11256141/098bce52-8f93-437c-9a06-c6972e27c70a)

#### Unsupported shapes fallback to Rectangle[​](#unsupported-shapes-fallback-to-rectangle "Direct link to heading")

**Subroutine**, **Cylindrical**, **Asymmetric**, **Hexagon**, **Parallelogram**, **Trapezoid** are not supported in Excalidraw hence they fallback to the closest shape **Rectangle**

```
flowchart LR  
  id1[[Subroutine fallback to Rectangle]]  
  id2[(Cylindrical fallback to Rectangle)]  
  id3>Asymmetric fallback to Rectangle]  
  id4{{Hexagon fallback to Rectangle}}  
  id5[/Parallelogram fallback to Rectangle /]  
  id6[/Trapezoid fallback to Rectangle\]
```

The above shapes are not supported in Excalidraw hence they fallback to Rectangle

![](https://github.com/excalidraw/excalidraw/assets/11256141/cb269473-16c5-4c35-bd7a-d631d8cc5b47)

#### Markdown fallback to Regular text[​](#markdown-fallback-to-regular-text "Direct link to heading")

Since we don't support wysiwyg text editor yet, hence [Markdown Strings](https://mermaid.js.org/syntax/flowchart.html#markdown-strings) will fallback to regular text.

```
flowchart LR  
  A("`Hello **World**`") --> B("`Whats **up** ?`")
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/107bd428-9ab9-42d4-ba12-b1e29c8db478)

#### Basic FontAwesome fallback to text[​](#basic-fontawesome-fallback-to-text "Direct link to heading")

The [FontAwesome](https://mermaid.js.org/syntax/flowchart.html#basic-support-for-fontawesome) icons aren't support so they won't be rendered in Excalidraw

```
flowchart TD  
  B["fab:fa-twitter for peace"]  
  B-->C[fa:fa-ban forbidden]  
  B-->E(A fa:fa-camera-retro perhaps?)
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/7a693863-c3f9-42ff-b325-4b3f8303c7af)

#### Cross Arrow head fallback to Bar Arrow head[​](#cross-arrow-head-fallback-to-bar-arrow-head "Direct link to heading")

```
flowchart LR  
  Start x--x Stop
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/217dd1ad-7f4e-4c80-8c1c-03647b42d821)

## Unsupported Diagram Types[​](#unsupported-diagram-types "Direct link to heading")

Currently only [flowcharts](https://mermaid.js.org/syntax/flowchart.html) are supported. All other diagram types will be rendered as an image in Excalidraw.

```
erDiagram  
  CUSTOMER ||--o{ ORDER : places  
  ORDER ||--|{ LINE-ITEM : contains  
  CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/c1d3fdb3-32ef-4bf3-a38a-02ac3d7d2cb9)

```
gitGraph  
  commit  
  commit  
  branch develop  
  checkout develop  
  commit  
  commit  
  checkout main  
  merge develop  
  commit  
  commit
```

![](https://github.com/excalidraw/excalidraw/assets/11256141/e5dcec0b-d570-4eb4-b981-412a996aa96c)