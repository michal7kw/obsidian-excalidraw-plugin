---
title: Constants
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/constants
---

# Constants

### FONT\_FAMILY[​](#font_family "Direct link to heading")

**How to use**

```
import { FONT_FAMILY } from "@excalidraw/excalidraw";
```

`FONT_FAMILY` contains all the font families used in `Excalidraw`. The default families are the following:

| Font Family | Description |
| --- | --- |
| `Excalifont` | The `Hand-drawn` font |
| `Nunito` | The `Normal` Font |
| `Comic Shanns` | The `Code` Font |

Pre-selected family is `FONT_FAMILY.Excalifont`, unless it's overriden with `initialData.appState.currentItemFontFamily`.

### THEME[​](#theme "Direct link to heading")

**How to use**

```
import { THEME } from "@excalidraw/excalidraw";
```

`THEME` contains all the themes supported by `Excalidraw` as explained below

| Theme | Description |
| --- | --- |
| `LIGHT` | The `light` theme |
| `DARK` | The `Dark` theme |

Defaults to `THEME.LIGHT` unless passed in `initialData.appState.theme`

### MIME\_TYPES[​](#mime_types "Direct link to heading")

[`MIME_TYPES`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/constants.ts#L101) contains all the mime types supported by `Excalidraw`.

**How to use**

```
import { MIME_TYPES } from "@excalidraw/excalidraw";
```