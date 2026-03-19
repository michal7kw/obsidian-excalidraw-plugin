---
title: Props
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/
---

# Props

All `props` are *optional*.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [`initialData`](/docs/@excalidraw/excalidraw/api/props/initialdata) | `object` | `null` | `Promise<object | null>` | `null` | The initial data with which app loads. |
| [`excalidrawAPI`](/docs/@excalidraw/excalidraw/api/props/excalidraw-api) | `function` | \_ | Callback triggered with the excalidraw api once rendered |
| [`isCollaborating`](#iscollaborating) | `boolean` | \_ | This indicates if the app is in `collaboration` mode |
| [`onChange`](#onchange) | `function` | \_ | This callback is triggered whenever the component updates due to any change. This callback will receive the excalidraw `elements` and the current `app state`. |
| [`onPointerUpdate`](#onpointerupdate) | `function` | \_ | Callback triggered when mouse pointer is updated. |
| [`onPointerDown`](#onpointerdown) | `function` | \_ | This prop if passed gets triggered on pointer down events |
| [`onScrollChange`](#onscrollchange) | `function` | \_ | This prop if passed gets triggered when scrolling the canvas. |
| [`onPaste`](#onpaste) | `function` | \_ | Callback to be triggered if passed when something is pasted into the scene |
| [`onLibraryChange`](#onlibrarychange) | `function` | \_ | The callback if supplied is triggered when the library is updated and receives the library items. |
| [`generateLinkForSelection`](#generatelinkforselection) | `function` | \_ | Allows you to override `url` generation when linking to Excalidraw elements. |
| [`onLinkOpen`](#onlinkopen) | `function` | \_ | The callback if supplied is triggered when any link is opened. |
| [`langCode`](#langcode) | `string` | `en` | Language code string to be used in Excalidraw |
| [`renderTopRightUI`](/docs/@excalidraw/excalidraw/api/props/render-props#rendertoprightui) | `function` | \_ | Render function that renders custom UI in top right corner |
| [`renderCustomStats`](/docs/@excalidraw/excalidraw/api/props/render-props#rendercustomstats) | `function` | \_ | Render function that can be used to render custom stats on the stats dialog. |
| [`viewModeEnabled`](#viewmodeenabled) | `boolean` | \_ | This indicates if the app is in `view` mode. |
| [`zenModeEnabled`](#zenmodeenabled) | `boolean` | \_ | This indicates if the `zen` mode is enabled |
| [`gridModeEnabled`](#gridmodeenabled) | `boolean` | \_ | This indicates if the `grid` mode is enabled |
| [`libraryReturnUrl`](#libraryreturnurl) | `string` | \_ | What URL should [libraries.excalidraw.com](https://libraries.excalidraw.com) be installed to |
| [`theme`](#theme) | `"light"` | `"dark"` | `"light"` | The theme of the Excalidraw component |
| [`name`](#name) | `string` |  | Name of the drawing |
| [`UIOptions`](/docs/@excalidraw/excalidraw/api/props/ui-options) | `object` | [DEFAULT UI OPTIONS](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/constants.ts#L151) | To customise UI options. Currently we support customising [`canvas actions`](/docs/@excalidraw/excalidraw/api/props/ui-options#canvasactions) |
| [`detectScroll`](#detectscroll) | `boolean` | `true` | Indicates whether to update the offsets when nearest ancestor is scrolled. |
| [`handleKeyboardGlobally`](#handlekeyboardglobally) | `boolean` | `false` | Indicates whether to bind the keyboard events to document. |
| [`autoFocus`](#autofocus) | `boolean` | `false` | Indicates whether to focus the Excalidraw component on page load |
| [`generateIdForFile`](#generateidforfile) | `function` | \_ | Allows you to override `id` generation for files added on canvas |
| [`validateEmbeddable`](#validateembeddable) | `string[]` | `boolean` | `RegExp` | `RegExp[]` | `((link: string) => boolean | undefined)` | \_ | use for custom src url validation |
| [`renderEmbeddable`](/docs/@excalidraw/excalidraw/api/props/render-props#renderEmbeddable) | `function` | \_ | Render function that can override the built-in `<iframe>` |
| [`renderScrollbars`] | `boolean` |  | `false` |

### Storing custom data on Excalidraw elements[​](#storing-custom-data-on-excalidraw-elements "Direct link to heading")

Beyond attributes that Excalidraw elements already support, you can store `custom` data on each `element` in a `customData` object. The type of the attribute is [`Record<string, any>`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/element/types.ts#L66) and is optional.

You can use this to add any extra information you need to keep track of.

You can add `customData` to elements when passing them as [`initialData`](/docs/@excalidraw/excalidraw/api/props/initialdata), or using [`updateScene`](/docs/@excalidraw/excalidraw/api/props/excalidraw-api#updatescene) / [`updateLibrary`](/docs/@excalidraw/excalidraw/api/props/excalidraw-api#updatelibrary) afterwards.

```
{  
  type: "rectangle",  
  id: "oDVXy8D6rom3H1-LLH2-f",  
  customData: {customId: '162'},  
}
```

### isCollaborating[​](#iscollaborating "Direct link to heading")

This prop indicates if the app is in `collaboration` mode.

### onChange[​](#onchange "Direct link to heading")

Every time component updates, this callback if passed will get triggered and has the below signature.

```
(excalidrawElements, appState, files) => void;
```

1. `excalidrawElements`: Array of [excalidrawElements](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/element/types.ts#L114) in the scene.
2. `appState`: [AppState](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/types.ts#L95) of the scene.
3. `files`: The [BinaryFiles](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/types.ts#L64) which are added to the scene.

Here you can try saving the data to your backend or local storage for example.

### onPointerUpdate[​](#onpointerupdate "Direct link to heading")

This callback is triggered when mouse pointer is updated.

```
({ x, y }, button, pointersMap}) => void;
```

1.`{x, y}`: Pointer coordinates

2.`button`: The position of the button. This will be one of `["down", "up"]`

3.`pointersMap`: [`pointers`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/types.ts#L131) map of the scene

```
(exportedElements, appState, canvas) => void
```

1. `exportedElements`: An array of [non deleted elements](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/element/types.ts#L87) which needs to be exported.
2. `appState`: [AppState](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/types.ts#L95) of the scene.
3. `canvas`: The `HTMLCanvasElement` of the scene.

### onPointerDown[​](#onpointerdown "Direct link to heading")

This prop if passed will be triggered on pointer down events and has the below signature.

```
(activeTool:  AppState["activeTool"], pointerDownState: PointerDownState) => void
```

### onScrollChange[​](#onscrollchange "Direct link to heading")

This prop if passed will be triggered when canvas is scrolled and has the below signature.

```
(scrollX: number, scrollY: number) => void
```

### onPaste[​](#onpaste "Direct link to heading")

This callback is triggered if passed when something is pasted into the scene. You can use this callback in case you want to do something additional when the paste event occurs.

```
(data: ClipboardData, event: ClipboardEvent | null) => boolean
```

This callback must return a `boolean` value or a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise) which resolves to a boolean value.

In case you want to prevent the excalidraw paste action you must return `false`, it will stop the native excalidraw clipboard management flow (nothing will be pasted into the scene).

### onLibraryChange[​](#onlibrarychange "Direct link to heading")

This callback if supplied will get triggered when the library is updated and has the below signature.

```
(items: LibraryItems) => void | Promise<any>
```

It is invoked with empty items when user clears the library. You can use this callback when you want to do something additional when library is updated for example persisting it to local storage.

### generateLinkForSelection[​](#generatelinkforselection "Direct link to heading")

This prop if passed will be used to replace the default link generation function. The idea is that the host app can take over the creation of element links, which can be used to navigate to a particular element or a group. If the host app chooses a different key for element link id, then the host app should also take care of the handling and the navigation in `onLinkOpen`.

```
(id: string, type: "element" | "group") => string;
```

### onLinkOpen[​](#onlinkopen "Direct link to heading")

This prop if passed will be triggered when clicked on `link`. To handle the redirect yourself (such as when using your own router for internal links), you must call `event.preventDefault()`.

```
(element: ExcalidrawElement, event: CustomEvent<{ nativeEvent: MouseEvent }>) => void
```

Example:

```
const history = useHistory();  
  
// open internal links using the app's router, but opens external links in  
// a new tab/window  
const onLinkOpen: ExcalidrawProps["onLinkOpen"] = useCallback(  
  (element, event) => {  
    const link = element.link;  
    const { nativeEvent } = event.detail;  
    const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;  
    const isNewWindow = nativeEvent.shiftKey;  
    const isInternalLink =  
      link.startsWith("/") || link.includes(window.location.origin);  
    if (isInternalLink && !isNewTab && !isNewWindow) {  
      history.push(link.replace(window.location.origin, ""));  
      // signal that we're handling the redirect ourselves  
      event.preventDefault();  
    }  
  },  
  [history],  
);
```

### langCode[​](#langcode "Direct link to heading")

Determines the `language` of the UI. It should be one of the [available language codes](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/i18n.ts#L14). Defaults to `en` (English). We also export default language and supported languages which you can import as shown below.

```
import { defaultLang, languages } from "@excalidraw/excalidraw";
```

| name | type |
| --- | --- |
| `defaultLang` | `string` |
| `languages` | [`Language[]`](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/i18n.ts#L15) |

### viewModeEnabled[​](#viewmodeenabled "Direct link to heading")

This prop indicates whether the app is in `view mode`. When supplied, the value takes precedence over *intialData.appState.viewModeEnabled*, the `view mode` will be fully controlled by the host app, and users won't be able to toggle it from within the app.

### zenModeEnabled[​](#zenmodeenabled "Direct link to heading")

This prop indicates whether the app is in `zen mode`. When supplied, the value takes precedence over *intialData.appState.zenModeEnabled*, the `zen mode` will be fully controlled by the host app, and users won't be able to toggle it from within the app.

### gridModeEnabled[​](#gridmodeenabled "Direct link to heading")

This prop indicates whether the shows the grid. When supplied, the value takes precedence over *intialData.appState.gridModeEnabled*, the grid will be fully controlled by the host app, and users won't be able to toggle it from within the app.

### libraryReturnUrl[​](#libraryreturnurl "Direct link to heading")

If supplied, this URL will be used when user tries to install a library from [libraries.excalidraw.com](https://libraries.excalidraw.com). Defaults to *window.location.origin + window.location.pathname*. To install the libraries in the same tab from which it was opened, you need to set `window.name` (to any alphanumeric string) — if it's not set it will open in a new tab.

### theme[​](#theme "Direct link to heading")

This prop controls Excalidraw's theme. When supplied, the value takes precedence over *intialData.appState.theme*, the theme will be fully controlled by the host app, and users won't be able to toggle it from within the app unless *UIOptions.canvasActions.toggleTheme* is set to `true`, in which case the `theme` prop will control Excalidraw's default theme with ability to allow theme switching (you must take care of updating the `theme` prop when you detect a change to `appState.theme` from the [onChange](#onchange) callback).

You can use [`THEME`](/docs/@excalidraw/excalidraw/api/utils#theme) to specify the theme.

### name[​](#name "Direct link to heading")

This prop sets the `name` of the drawing which will be used when exporting the drawing. When supplied, the value takes precedence over *intialData.appState.name*, the `name` will be fully controlled by host app and the users won't be able to edit from within Excalidraw.

### detectScroll[​](#detectscroll "Direct link to heading")

Indicates whether Excalidraw should listen for `scroll` event on the nearest scrollable container in the DOM tree and recompute the coordinates (e.g. to correctly handle the cursor) when the component's position changes. You can disable this when you either know this doesn't affect your app or you want to take care of it yourself (calling the [`refresh()`](#ref) method).

### handleKeyboardGlobally[​](#handlekeyboardglobally "Direct link to heading")

Indicates whether to bind keyboard events to `document`. Disabled by default, meaning the keyboard events are bound to the Excalidraw component. This allows for multiple Excalidraw components to live on the same page, and ensures that Excalidraw keyboard handling doesn't collide with your app's (or the browser) when the component isn't focused.

Enable this if you want Excalidraw to handle keyboard even if the component isn't focused (e.g. a user is interacting with the navbar, sidebar, or similar).

### autoFocus[​](#autofocus "Direct link to heading")

This prop indicates whether to `focus` the Excalidraw component on page load. Defaults to false.

### generateIdForFile[​](#generateidforfile "Direct link to heading")

Allows you to override `id` generation for files added on canvas (images). By default, an SHA-1 digest of the file is used.

```
(file: File) => string | Promise<string>
```

### validateEmbeddable[​](#validateembeddable "Direct link to heading")

```
validateEmbeddable?: boolean | string[] | RegExp | RegExp[] | ((link: string) => boolean | undefined)
```

This is an optional property. By default we support a handful of well-known sites. You may allow additional sites or disallow the default ones by supplying a custom validator. If you pass `true`, all URLs will be allowed. You can also supply a list of hostnames, RegExp (or list of RegExp objects), or a function. If the function returns `undefined`, the built-in validator will be used.

Supplying a list of hostnames (with or without `www.`) is the preferred way to allow a specific list of domains.