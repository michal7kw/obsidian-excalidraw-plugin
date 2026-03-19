---
title: Render Props
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/render-props
---

# Render Props

## renderTopRightUI[​](#rendertoprightui "Direct link to heading")

```
(isMobile: boolean, appState:AppState) => JSX | null
```

A function returning `JSX` to render `custom` UI in the top right corner of the app.

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw
renderTopRightUI={() => {
return (
<button
style={{
background: "#70b1ec",
border: "none",
color: "#fff",
width: "max-content",
fontWeight: "bold",
}}
onClick={() => window.alert("This is dummy top right UI")}
>
Click me
</button>
);
}}
/>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw



renderTopRightUI={() => {



return (



<button



style={{



background: "#70b1ec",



border: "none",



color: "#fff",



width: "max-content",



fontWeight: "bold",



}}



onClick={() => window.alert("This is dummy top right UI")}



>



Click me



</button>



);



}}



/>



</div>



);



}
```

Result

Loading...

## renderCustomStats[​](#rendercustomstats "Direct link to heading")

A function that can be used to render custom stats (returns JSX) in the `nerd stats` dialog.

![Nerd Stats](/assets/images/nerd-stats-275925684149f752e3f5487f11105f12.png)

For example you can use this prop to render the size of the elements in the storage as do in [excalidraw.com](https://excalidraw.com).

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw
renderCustomStats={() => (
<p style={{ color: "#70b1ec", fontWeight: "bold" }}>
Dummy stats will be shown here
</p>
)}
/>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw



renderCustomStats={() => (



<p style={{ color: "#70b1ec", fontWeight: "bold" }}>



Dummy stats will be shown here



</p>



)}



/>



</div>



);



}
```

Result

Loading...

## renderEmbeddable[​](#renderembeddable "Direct link to heading")

```
(element: NonDeleted<ExcalidrawEmbeddableElement>, appState: AppState) => JSX.Element | null
```

Allows you to replace the renderer for embeddable elements (which renders `<iframe>` elements).

| Parameter | Type | Description |
| --- | --- | --- |
| `element` | `NonDeleted<ExcalidrawEmbeddableElement>` | The embeddable element to be rendered. |
| `appState` | `AppState` | The current state of the UI. |