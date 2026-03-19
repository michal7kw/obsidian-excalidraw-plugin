---
title: Utils
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils
---

# Utils

These are pure Javascript functions exported from the @excalidraw/excalidraw [`@excalidraw/excalidraw`](https://npmjs.com/@excalidraw/excalidraw). If you want to export your drawings in different formats eg `png`, `svg` and more you can check out [Export Utilities](/docs/@excalidraw/excalidraw/API/utils/export). If you want to restore your drawings you can check out [Restore Utilities](/docs/@excalidraw/excalidraw/API/utils/restore).

### serializeAsJSON[​](#serializeasjson "Direct link to heading")

Takes the scene elements and state and returns a JSON string. `Deleted` elements as well as most properties from `AppState` are removed from the resulting JSON. (see [`serializeAsJSON()`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/json.ts#L42) source for details).

If you want to overwrite the `source` field in the `JSON` string, you can set `window.EXCALIDRAW_EXPORT_SOURCE` to the desired value.

***Signature***

```
serializeAsJSON({  
  elements: ExcalidrawElement[],  
  appState: AppState,  
}): string
```

**How to use**

```
import { serializeAsJSON } from "@excalidraw/excalidraw";
```

### serializeLibraryAsJSON[​](#serializelibraryasjson "Direct link to heading")

Takes the `library` items and returns a `JSON` string.

If you want to overwrite the source field in the JSON string, you can set `window.EXCALIDRAW_EXPORT_SOURCE` to the desired value.

***Signature***

```
serializeLibraryAsJSON( libraryItems: LibraryItems[])
```

**How to use**

```
import { serializeLibraryAsJSON } from "@excalidraw/excalidraw";
```

#### isInvisiblySmallElement[​](#isinvisiblysmallelement "Direct link to heading")

Returns `true` if element is invisibly small (e.g. width & height are zero).

***Signature***

```
isInvisiblySmallElement(element:  ExcalidrawElement): boolean
```

**How to use**

```
import { isInvisiblySmallElement } from "@excalidraw/excalidraw";
```

### loadFromBlob[​](#loadfromblob "Direct link to heading")

This function loads the scene data from the blob (or file). If you pass `localAppState`, `localAppState` value will be preferred over the `appState` derived from `blob`. Throws if blob doesn't contain valid scene data.

**How to use**

```
import { loadFromBlob } from "@excalidraw/excalidraw";  
  
const scene = await loadFromBlob(file, null, null);  
excalidrawAPI.updateScene(scene);
```

**Signature**

```
loadFromBlob(  
  blob: Blob,  
  localAppState: AppState | null,  
  localElements: ExcalidrawElement[] | null,  
  fileHandle?: FileSystemHandle | null   
) => Promise<RestoredDataState>
```

### loadLibraryFromBlob[​](#loadlibraryfromblob "Direct link to heading")

This function loads the library from the blob. Additonally takes `defaultStatus` param which sets the default status for library item if not present, defaults to `unpublished`.

**How to use**

```
import { loadLibraryFromBlob } from "@excalidraw/excalidraw";
```

***Signature***

```
loadLibraryFromBlob(blob: Blob, defaultStatus: "published" | "unpublished")
```

### loadSceneOrLibraryFromBlob[​](#loadsceneorlibraryfromblob "Direct link to heading")

This function loads either scene or library data from the supplied blob. If the blob contains scene data, and you pass `localAppState`, `localAppState` value will be preferred over the `appState` derived from `blob`.

caution

Throws if blob doesn't contain valid `scene` data or `library` data.

**How to use**

```
import { loadSceneOrLibraryFromBlob, MIME_TYPES } from "@excalidraw/excalidraw";  
  
const contents = await loadSceneOrLibraryFromBlob(file, null, null);  
if (contents.type === MIME_TYPES.excalidraw) {  
  excalidrawAPI.updateScene(contents.data);  
} else if (contents.type === MIME_TYPES.excalidrawlib) {  
  excalidrawAPI.updateLibrary(contents.data);  
}
```

***Signature***

```
loadSceneOrLibraryFromBlob(  
  blob: Blob,  
  localAppState: AppState | null,  
  localElements: ExcalidrawElement[] | null,  
  fileHandle?: FileSystemHandle | null  
) => Promise<{ type: string, data: RestoredDataState | ImportedLibraryState}>
```

### getFreeDrawSvgPath[​](#getfreedrawsvgpath "Direct link to heading")

This function returns the `free draw` svg path for the element.

**How to use**

```
import { getFreeDrawSvgPath } from "@excalidraw/excalidraw";
```

**Signature**

```
getFreeDrawSvgPath(element: ExcalidrawFreeDrawElement)
```

### isLinearElement[​](#islinearelement "Direct link to heading")

This function returns true if the element is `linear` type (`arrow` |`line`) else returns `false`.

**How to use**

```
import { isLinearElement } from "@excalidraw/excalidraw";
```

**Signature**

```
isLinearElement(elementType?: ExcalidrawElement): boolean
```

### getNonDeletedElements[​](#getnondeletedelements "Direct link to heading")

This function returns an array of `deleted` elements.

**How to use**

```
import { getNonDeletedElements } from "@excalidraw/excalidraw";
```

**Signature**

```
getNonDeletedElements(elements: readonly ExcalidrawElement[]): as readonly NonDeletedExcalidrawElement[]
```

### mergeLibraryItems[​](#mergelibraryitems "Direct link to heading")

This function merges two `LibraryItems` arrays, where unique items from `otherItems` are sorted first in the returned array.

```
import { mergeLibraryItems } from "@excalidraw/excalidraw";
```

***Signature***

```
mergeLibraryItems(  
  localItems: LibraryItems,  
  otherItems: LibraryItems  
): LibraryItems
```

### parseLibraryTokensFromUrl[​](#parselibrarytokensfromurl "Direct link to heading")

Parses library parameters from URL if present (expects the `#addLibrary` hash key), and returns an object with the `libraryUrl` and `idToken`. Returns `null` if `#addLibrary` hash key not found.

**How to use**

```
import { parseLibraryTokensFromUrl } from "@excalidraw/excalidraw";
```

**Signature**

```
parseLibraryTokensFromUrl(): {  
    libraryUrl: string;  
    idToken: string | null;  
} | null
```

### useHandleLibrary[​](#usehandlelibrary "Direct link to heading")

A hook that automatically imports library from url if `#addLibrary` hash key exists on initial load, or when it changes during the editing session (e.g. when a user installs a new library), and handles initial library load if `getInitialLibraryItems` getter is supplied.

**How to use**

```
import { useHandleLibrary } from "@excalidraw/excalidraw";  
  
export const App = () => {  
  // ...  
  useHandleLibrary({ excalidrawAPI });  
};
```

**Signature**

```
useHandleLibrary(opts: {  
  excalidrawAPI: ExcalidrawAPI,  
  getInitialLibraryItems?: () => LibraryItemsSource  
});
```

In the future, we will be adding support for handling `library` persistence to `browser storage` (or elsewhere).

### getSceneVersion[​](#getsceneversion "Direct link to heading")

This function returns the current `scene` version.

***Signature***

```
getSceneVersion(elements:  ExcalidrawElement[])
```

**How to use**

```
import { getSceneVersion } from "@excalidraw/excalidraw";
```

### sceneCoordsToViewportCoords[​](#scenecoordstoviewportcoords "Direct link to heading")

This function returns equivalent `viewport` coords for the provided `scene` coords in params.

```
import { sceneCoordsToViewportCoords } from "@excalidraw/excalidraw";
```

***Signature***

```
sceneCoordsToViewportCoords({ sceneX: number, sceneY: number },  
  appState: AppState  
): { x: number, y: number }
```

### viewportCoordsToSceneCoords[​](#viewportcoordstoscenecoords "Direct link to heading")

This function returns equivalent `scene` coords for the provided `viewport` coords in params.

```
import { viewportCoordsToSceneCoords } from "@excalidraw/excalidraw";
```

***Signature***

```
viewportCoordsToSceneCoords({ clientX: number, clientY: number },  
  appState: AppState  
): {x: number, y: number}
```

### useEditorInterface[​](#useeditorinterface "Direct link to heading")

This hook can be used to check the type of device which is being used. It can only be used inside the `children` of `Excalidraw` component.

Open the `main menu` in the below example to view the footer.

Live Editor

const MobileFooter = ({}) => {
const editorInterface = useEditorInterface();
if (editorInterface.formFactor === "phone") {
return (
<Footer>
<button
className="custom-footer"
style={{ marginLeft: "20px", height: "2rem" }}
onClick={() => alert("This is custom footer in mobile menu")}
>
custom footer
</button>
</Footer>
);
}
return null;
};
const App = () => (
<div style={{ height: "400px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.Item> Item1 </MainMenu.Item>
<MainMenu.Item> Item 2 </MainMenu.Item>
<MobileFooter />
</MainMenu>
</Excalidraw>
</div>
);
// Need to render when code is span across multiple components
// in Live Code blocks editor
render(<App />);

```
const MobileFooter = ({}) => {



const editorInterface = useEditorInterface();



if (editorInterface.formFactor === "phone") {



return (



<Footer>



<button



className="custom-footer"



style={{ marginLeft: "20px", height: "2rem" }}



onClick={() => alert("This is custom footer in mobile menu")}



>



custom footer



</button>



</Footer>



);



}



return null;



};



const App = () => (



<div style={{ height: "400px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.Item> Item1 </MainMenu.Item>



<MainMenu.Item> Item 2 </MainMenu.Item>



<MobileFooter />



</MainMenu>



</Excalidraw>



</div>



);



// Need to render when code is span across multiple components



// in Live Code blocks editor



render(<App />);
```

Result

Loading...

The `device` has the following `attributes`, some grouped into `viewport` and `editor` objects, per context.

| Name | Type | Description |
| --- | --- | --- |

The `EditorInterface` object has the following properties:

| Name | Type | Description |  |  |  |
| --- | --- | --- | --- | --- | --- |
| `formFactor` | `'phone' | 'tablet' | 'desktop'` | Indicates the device type based on screen size |  |
| `desktopUIMode` | `'compact' | 'full'` | UI mode for desktop form factor |  |  |
| `userAgent.raw` | `string` | Raw user agent string |  |  |  |
| `userAgent.isMobileDevice` | `boolean` | True if device is mobile |  |  |  |
| `userAgent.platform` | `'ios' | 'android' | 'other' | 'unknown'` | Device platform |
| `isTouchScreen` | `boolean` | True if touch events are detected |  |  |  |
| `canFitSidebar` | `boolean` | True if sidebar can fit in the viewport |  |  |  |
| `isLandscape` | `boolean` | True if viewport is in landscape mode |  |  |  |

### i18n[​](#i18n "Direct link to heading")

To help with localization, we export the following.

| name | type |
| --- | --- |
| `defaultLang` | `string` |
| `languages` | [`Language[]`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/i18n.ts#L15) |
| `useI18n` | [`() => { langCode, t }`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/i18n.ts#L15) |

```
import { defaultLang, languages, useI18n } from "@excalidraw/excalidraw";
```

#### defaultLang[​](#defaultlang "Direct link to heading")

Default language code, `en`.

#### languages[​](#languages "Direct link to heading")

List of supported language codes. You can pass any of these to `Excalidraw`'s [`langCode` prop](/docs/@excalidraw/excalidraw/api/props/#langcode).

#### useI18n[​](#usei18n "Direct link to heading")

A hook that returns the current language code and translation helper function. You can use this to translate strings in the components you render as children of `<Excalidraw>`.

Live Editor

function App() {
const { t } = useI18n();
return (
<div style={{ height: "500px" }}>
<Excalidraw>
<button
style={{ position: "absolute", zIndex: 10, height: "2rem" }}
onClick={() => window.alert(t("labels.madeWithExcalidraw"))}
>
{t("buttons.confirm")}
</button>
</Excalidraw>
</div>
);
}

```
function App() {



const { t } = useI18n();



return (



<div style={{ height: "500px" }}>



<Excalidraw>



<button



style={{ position: "absolute", zIndex: 10, height: "2rem" }}



onClick={() => window.alert(t("labels.madeWithExcalidraw"))}



>



{t("buttons.confirm")}



</button>



</Excalidraw>



</div>



);



}
```

Result

Loading...

### getCommonBounds[​](#getcommonbounds "Direct link to heading")

This util can be used to get the common bounds of the passed elements.

***Signature***

```
getCommonBounds(  
  elements: readonly ExcalidrawElement[]  
): readonly [  
  minX: number,  
  minY: number,  
  maxX: number,  
  maxY: number,  
]
```

***How to use***

```
import { getCommonBounds } from "@excalidraw/excalidraw";
```

### elementsOverlappingBBox[​](#elementsoverlappingbbox "Direct link to heading")

To filter `elements` that are inside, overlap, or contain the `bounds` rectangle.

The bounds check is approximate and does not precisely follow the element's shape. You can also supply `errorMargin` which effectively makes the `bounds` larger by that amount.

This API has 3 `type`s of operation: `overlap`, `contain`, and `inside`:

- `overlap` - filters elements that are overlapping or inside bounds.
- `contain` - filters elements that are inside bounds or bounds inside elements.
- `inside` - filters elements that are inside bounds.

***Signature***

```
elementsOverlappingBBox(  
  elements: readonly NonDeletedExcalidrawElement[];  
  bounds: Bounds | ExcalidrawElement;  
  errorMargin?: number;  
  type: "overlap" | "contain" | "inside";  
): NonDeletedExcalidrawElement[];
```

***How to use***

```
import { elementsOverlappingBBox } from "@excalidraw/excalidraw";
```

### isElementInsideBBox[​](#iselementinsidebbox "Direct link to heading")

Lower-level API than `elementsOverlappingBBox` to check if a single `element` is inside `bounds`. If `eitherDirection=true`, returns `true` if `element` is fully inside `bounds` rectangle, or vice versa. When `false`, it returns `true` only for the former case.

***Signature***

```
isElementInsideBBox(  
  element: NonDeletedExcalidrawElement,  
  bounds: Bounds,  
  eitherDirection = false,  
): boolean
```

***How to use***

```
import { isElementInsideBBox } from "@excalidraw/excalidraw";
```

### elementPartiallyOverlapsWithOrContainsBBox[​](#elementpartiallyoverlapswithorcontainsbbox "Direct link to heading")

Checks if `element` is overlapping the `bounds` rectangle, or is fully inside.

***Signature***

```
elementPartiallyOverlapsWithOrContainsBBox(  
  element: NonDeletedExcalidrawElement,  
  bounds: Bounds,  
): boolean
```

***How to use***

```
import { elementPartiallyOverlapsWithOrContainsBBox } from "@excalidraw/excalidraw";
```