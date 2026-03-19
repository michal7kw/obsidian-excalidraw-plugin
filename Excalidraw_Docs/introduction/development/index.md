---
title: Development
source: https://docs.excalidraw.com/docs/introduction/development
---

# Development

## Code Sandbox[​](#code-sandbox "Direct link to heading")

- Go to <https://codesandbox.io/p/github/excalidraw/excalidraw>
  - You may need to sign in with GitHub and reload the page
- You can start coding instantly, and even send PRs from there!

## Local Installation[​](#local-installation "Direct link to heading")

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Requirements[​](#requirements "Direct link to heading")

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1 or v2.4.2+)
- [Git](https://git-scm.com/downloads)

### Clone the repo[​](#clone-the-repo "Direct link to heading")

```
git clone https://github.com/excalidraw/excalidraw.git
```

### Install the dependencies[​](#install-the-dependencies "Direct link to heading")

```
yarn
```

### Start the server[​](#start-the-server "Direct link to heading")

```
yarn start
```

Now you can open <http://localhost:3000> and start coding in your favorite code editor.

## Collaboration[​](#collaboration "Direct link to heading")

For collaboration, you will need to set up [collab server](https://github.com/excalidraw/excalidraw-room) in local.

## Commands[​](#commands "Direct link to heading")

### Install the dependencies[​](#install-the-dependencies-1 "Direct link to heading")

```
yarn
```

### Run the project[​](#run-the-project "Direct link to heading")

```
yarn start
```

### Reformat all files with Prettier[​](#reformat-all-files-with-prettier "Direct link to heading")

```
yarn fix
```

### Run tests[​](#run-tests "Direct link to heading")

```
yarn test
```

### Update test snapshots[​](#update-test-snapshots "Direct link to heading")

```
yarn test:update
```

### Test for formatting with Prettier[​](#test-for-formatting-with-prettier "Direct link to heading")

```
yarn test:code
```

### Docker Compose[​](#docker-compose "Direct link to heading")

You can use docker-compose to work on Excalidraw locally if you don't want to setup a Node.js env.

```
docker-compose up --build -d
```

## Self-hosting[​](#self-hosting "Direct link to heading")

We publish a Docker image with the Excalidraw client at [excalidraw/excalidraw](https://hub.docker.com/r/excalidraw/excalidraw). You can use it to self-host your own client under your own domain, on Kubernetes, AWS ECS, etc.

```
docker build -t excalidraw/excalidraw .  
docker run --rm -dit --name excalidraw -p 5000:80 excalidraw/excalidraw:latest
```

The Docker image is free of analytics and other tracking libraries.

**At the moment, self-hosting your own instance doesn't support sharing or collaboration features.**

We are working towards providing a full-fledged solution for self-hosting your own Excalidraw.