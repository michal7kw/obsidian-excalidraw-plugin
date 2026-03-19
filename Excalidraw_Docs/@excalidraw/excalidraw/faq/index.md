---
title: FAQ
source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/faq
---

# FAQ

### Does this package support collaboration ?[​](#does-this-package-support-collaboration- "Direct link to heading")

No, Excalidraw package doesn't come with collaboration built in, since the implementation is specific to each host app. We expose APIs which you can use to communicate with Excalidraw which you can use to implement it. You can check our own implementation [here](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/index.tsx). Here is a [detailed answer](https://github.com/excalidraw/excalidraw/discussions/3879#discussioncomment-1110524) on how you can achieve the same.

### Turning off Aggressive Anti-Fingerprinting in Brave browser[​](#turning-off-aggressive-anti-fingerprinting-in-brave-browser "Direct link to heading")

When *Aggressive Anti-Fingerprinting* is turned on, the `measureText` API breaks which in turn breaks the Text Elements in your drawings. Here is more [info](https://github.com/excalidraw/excalidraw/pull/6336) on the same.

We strongly recommend turning it off. You can follow the steps below on how to do so.

1. Open [excalidraw.com](https://excalidraw.com) in Brave and click on the **Shield** button
   ![Shield button](/assets/images/brave-shield-97b643bea88437df3a15d639703d1a7b.png)

2. Once opened, look for **Aggressively Block Fingerprinting**
   ![Aggressive block fingerprinting](/assets/images/aggressive-block-fingerprint-52e57b6f3b7569835f1a04d9e544bc27.png)
3. Switch to **Block Fingerprinting**
   ![Block filtering](/assets/images/block-fingerprint-2d28c57b6cfeed4b48acde7329027753.png)
4. Thats all. All text elements should be fixed now 🎉

If disabling this setting doesn't fix the display of text elements, please consider opening an [issue](https://github.com/excalidraw/excalidraw/issues/new) on our GitHub, or message us on [Discord](https://discord.gg/UexuTaE).

### ReferenceError: process is not defined[​](#referenceerror-process-is-not-defined "Direct link to heading")

When using `vite` or any build tools, you will have to make sure the `process` is accessible as we are accessing `process.env.IS_PREACT` to decide whether to use `preact` build.

Since Vite removes env variables by default, you can update the vite config to ensure its available 👇

```
 define: {  
    "process.env.IS_PREACT": JSON.stringify("true"),  
  },
```

## Need help?[​](#need-help "Direct link to heading")

Check out the existing [Q&A](https://github.com/excalidraw/excalidraw/discussions?discussions_q=label%3Apackage%3Aexcalidraw). If you have any queries or need help, ask us [here](https://github.com/excalidraw/excalidraw/discussions?discussions_q=label%3Apackage%3Aexcalidraw).