---
title: Development
source: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/development
---

# Development

This page relates to developing the `@excalidraw/mermaid-to-excalidraw` package itself.

## Setting up in Local[​](#setting-up-in-local "Direct link to heading")

To set up the library in local, follow the below steps 👇🏼

### Clone the Repository[​](#clone-the-repository "Direct link to heading")

Go to [@excalidraw/mermaid-to-excalidraw](https://github.com/excalidraw/mermaid-to-excalidraw) and clone the repository to your local.

```
git clone git@github.com:excalidraw/mermaid-to-excalidraw.git
```

### Install the dependencies[​](#install-the-dependencies "Direct link to heading")

Using `npm`

```
npm install @excalidraw/mermaid-to-excalidraw
```

Using `yarn`

```
yarn add @excalidraw/mermaid-to-excalidraw
```

### Run the playground server[​](#run-the-playground-server "Direct link to heading")

```
yarn start
```

This will start the playground server in port `1234` and you start playing with the playground.

## Creating a test release[​](#creating-a-test-release "Direct link to heading")

We will soon simplify creating release via commenting on GitHub PR similar till then you can create a release by following the below steps

1. Create the build

```
yarn build
```

This will create the dist folder which we need to publish next.

2. Publish the library

Update the package name and version in [package.json](https://github.com/excalidraw/mermaid-to-excalidraw/blob/master/package.json) and run the below command to publish it

```
yarn publish
```

And thats all your test release is successfully created 🎉