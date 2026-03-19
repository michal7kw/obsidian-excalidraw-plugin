---
title: MainMenu
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/children-components/main-menu
---

# MainMenu

By default Excalidraw will render the `MainMenu` with default options. If you want to customise the `MainMenu`, you can pass the `MainMenu` component with the list options.

**Usage**

Live Editor

function App() {
return (
<div style={{ height: "300px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.Item onSelect={() => window.alert("Item1")}>
Item1
</MainMenu.Item>
<MainMenu.Item onSelect={() => window.alert("Item2")}>
Item 2
</MainMenu.Item>
</MainMenu>
</Excalidraw>
</div>
);
}

```
function App() {



return (



<div style={{ height: "300px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.Item onSelect={() => window.alert("Item1")}>



Item1



</MainMenu.Item>



<MainMenu.Item onSelect={() => window.alert("Item2")}>



Item 2



</MainMenu.Item>



</MainMenu>



</Excalidraw>



</div>



);



}
```

Result

Loading...

### `<MainMenu>`[​](#mainmenu-1 "Direct link to heading")

This is the `MainMenu` component. If you render it, you will need to populate the menu with your own items as we will not render any ourselves at that point.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `onSelect` | `function` | No | - | Triggered when any item is selected (via mouse). Calling `event.preventDefault()` will stop menu from closing. |

### MainMenu.Item[​](#mainmenuitem "Direct link to heading")

To render an item, its recommended to use `MainMenu.Item`.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `onSelect` | `function` | Yes | - | Triggered when selected (via mouse). Calling `event.preventDefault()` will stop menu from closing. |
| `selected` | `boolean` | No | `false` | Whether item is active |
| `children` | `React.ReactNode` | Yes | - | The content of the menu item |
| `icon` | `JSX.Element` | No | - | The icon used in the menu item |
| `shortcut` | `string` | No | - | The shortcut to be shown for the menu item |

### MainMenu.ItemLink[​](#mainmenuitemlink "Direct link to heading")

To render an item as a link, its recommended to use `MainMenu.ItemLink`.

**Usage**

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.ItemLink href="https://google.com">
Google
</MainMenu.ItemLink>
<MainMenu.ItemLink href="https://excalidraw.com">
Excalidraw
</MainMenu.ItemLink>
</MainMenu>
</Excalidraw>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.ItemLink href="https://google.com">



Google



</MainMenu.ItemLink>



<MainMenu.ItemLink href="https://excalidraw.com">



Excalidraw



</MainMenu.ItemLink>



</MainMenu>



</Excalidraw>



</div>



);



}
```

Result

Loading...

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `onSelect` | `function` | No | - | Triggered when selected (via mouse). Calling `event.preventDefault()` will stop menu from closing. |
| `selected` | `boolean` | No | `false` | Whether item is active |
| `href` | `string` | Yes | - | The `href` attribute to be added to the `anchor` element. |
| `children` | `React.ReactNode` | Yes | - | The content of the menu item |
| `icon` | `JSX.Element` | No | - | The icon used in the menu item |
| `shortcut` | `string` | No | - | The shortcut to be shown for the menu item |

### MainMenu.ItemCustom[​](#mainmenuitemcustom "Direct link to heading")

To render a custom item, you can use `MainMenu.ItemCustom`.

**Usage**

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.ItemCustom>
<button
style={{ height: "2rem" }}
onClick={() => window.alert("custom menu item")}
>
custom item
</button>
</MainMenu.ItemCustom>
</MainMenu>
</Excalidraw>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.ItemCustom>



<button



style={{ height: "2rem" }}



onClick={() => window.alert("custom menu item")}



>



custom item



</button>



</MainMenu.ItemCustom>



</MainMenu>



</Excalidraw>



</div>



);



}
```

Result

Loading...

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | Yes | - | The content of the menu item |

### MainMenu.DefaultItems[​](#mainmenudefaultitems "Direct link to heading")

For the items which are shown in the menu in [excalidraw.com](https://excalidraw.com), you can use `MainMenu.DefaultItems`

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.DefaultItems.Socials />
<MainMenu.DefaultItems.Export />
<MainMenu.Item onSelect={() => window.alert("Item1")}>
Item1
</MainMenu.Item>
<MainMenu.Item onSelect={() => window.alert("Item2")}>
Item 2
</MainMenu.Item>
</MainMenu>
</Excalidraw>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.DefaultItems.Socials />



<MainMenu.DefaultItems.Export />



<MainMenu.Item onSelect={() => window.alert("Item1")}>



Item1



</MainMenu.Item>



<MainMenu.Item onSelect={() => window.alert("Item2")}>



Item 2



</MainMenu.Item>



</MainMenu>



</Excalidraw>



</div>



);



}
```

Result

Loading...

Here is a [complete list](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/components/main-menu/DefaultItems.tsx) of the default items.

### MainMenu.Group[​](#mainmenugroup "Direct link to heading")

To Group item in the main menu, you can use `MainMenu.Group`

Live Editor

function App() {
return (
<div style={{ height: "500px" }}>
<Excalidraw>
<MainMenu>
<MainMenu.Group title="Excalidraw items">
<MainMenu.DefaultItems.Socials />
<MainMenu.DefaultItems.Export />
</MainMenu.Group>
<MainMenu.Group title="custom items">
<MainMenu.Item onSelect={() => window.alert("Item1")}>
Item1
</MainMenu.Item>
<MainMenu.Item onSelect={() => window.alert("Item2")}>
Item 2
</MainMenu.Item>
</MainMenu.Group>
</MainMenu>
</Excalidraw>
</div>
);
}

```
function App() {



return (



<div style={{ height: "500px" }}>



<Excalidraw>



<MainMenu>



<MainMenu.Group title="Excalidraw items">



<MainMenu.DefaultItems.Socials />



<MainMenu.DefaultItems.Export />



</MainMenu.Group>



<MainMenu.Group title="custom items">



<MainMenu.Item onSelect={() => window.alert("Item1")}>



Item1



</MainMenu.Item>



<MainMenu.Item onSelect={() => window.alert("Item2")}>



Item 2



</MainMenu.Item>



</MainMenu.Group>



</MainMenu>



</Excalidraw>



</div>



);



}
```

Result

Loading...

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | Yes | - | The content of the `Menu Group` |