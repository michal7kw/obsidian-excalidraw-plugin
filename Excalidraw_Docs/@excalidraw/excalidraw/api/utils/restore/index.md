---
title: Restore Utilities
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/restore
---

# Restore Utilities

### restoreAppState[​](#restoreappstate "Direct link to heading")

***Signature***

```
restoreAppState(appState: ImportedDataState["appState"],  
  localAppState: Partial<AppState> | null): AppState
```

***How to use***

```
import { restoreAppState } from "@excalidraw/excalidraw";
```

This function will make sure all the `keys` have appropriate `values` in [appState](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/types.ts#L95) and if any key is missing, it will be set to its `default` value.

When `localAppState` is supplied, it's used in place of values that are missing (`undefined`) in `appState` instead of the defaults.  
Use this as a way to not override user's defaults if you persist them.
You can pass `null` / `undefined` if not applicable.

### restoreElements[​](#restoreelements "Direct link to heading")

***Signature***

```
restoreElements( elements: ImportedDataState["elements"],  
  localElements: ExcalidrawElement[] | null | undefined): ExcalidrawElement[],  
  opts: { refreshDimensions?: boolean, repairBindings?: boolean, normalizeIndices?: boolean }  
)
```

| Prop | Type | Description |
| --- | --- | --- |
| `elements` | [ImportedDataState["elements"]](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/element/types.ts#L114) | The `elements` to be restored |
| [`localElements`](#localelements) | [ExcalidrawElement[]](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/element/types.ts#L114) | null | undefined | When `localElements` are supplied, they are used to ensure that existing restored elements reuse `version` (and increment it), and regenerate `versionNonce`. |
| [`opts`](#opts) | `Object` | The extra optional parameter to configure restored elements |

#### localElements[​](#localelements "Direct link to heading")

When `localElements` are supplied, they are used to ensure that existing restored elements reuse `version` (and increment it), and regenerate `versionNonce`.  
Use this when you `import` elements which may already be present in the scene to ensure that you do not disregard the newly imported elements if you're using element version to detect the update

#### opts[​](#opts "Direct link to heading")

The extra optional parameter to configure restored elements. It has the following attributes

| Prop | Type | Description |
| --- | --- | --- |
| `refreshDimensions` | `boolean` | Indicates whether we should also *recalculate* text element dimensions. Since this is a potentially costly operation, you may want to disable it if you restore elements in tight loops, such as during collaboration. |
| `repairBindings` | `boolean` | Indicates whether the *bindings* for the elements should be repaired. This is to make sure there are no containers with non existent bound text element id and no bound text elements with non existent container id. |
| `normalizeIndices` | `boolean` | Indicates whether *fractional indices* for the elements should be normalized. This is to prevent possible issues caused by using stale (too old, too long) indices. |

***How to use***

```
import { restoreElements } from "@excalidraw/excalidraw";
```

This function will make sure all properties of element is correctly set and if any attribute is missing, it will be set to its default value.

Parameter `refreshDimensions` indicates whether we should also `recalculate` text element dimensions. Defaults to `false`. Since this is a potentially costly operation, you may want to disable it if you restore elements in tight loops, such as during collaboration.

### restore[​](#restore "Direct link to heading")

***Signature***

```
restore( data: ImportedDataState,  
  localAppState: Partial<AppState> | null | undefined,  
  localElements: ExcalidrawElement[] | null | undefined  
): DataState  
opts: { refreshDimensions?: boolean, repairBindings?: boolean, normalizeIndices?: boolean }  
)
```

See [`restoreAppState()`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/packages/excalidraw/README.md#restoreAppState) about `localAppState`, and [`restoreElements()`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/packages/excalidraw/README.md#restoreElements) about `localElements`.

***How to use***

```
import { restore } from "@excalidraw/excalidraw";
```

This function makes sure elements and state is set to appropriate values and set to default value if not present. It is a combination of [restoreElements](#restoreelements) and [restoreAppState](#restoreappstate).

### restoreLibraryItems[​](#restorelibraryitems "Direct link to heading")

***Signature***

```
restoreLibraryItems(libraryItems: ImportedDataState["libraryItems"],  
  defaultStatus: "published" | "unpublished")
```

***How to use***

```
import { restoreLibraryItems } from "@excalidraw/excalidraw";  
  
restoreLibraryItems(libraryItems, "unpublished");
```

This function normalizes library items elements, adding missing values when needed.