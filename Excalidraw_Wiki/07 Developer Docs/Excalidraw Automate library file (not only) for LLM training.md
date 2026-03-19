---
title: Excalidraw Automate library file (not only) for LLM training
source: https://excalidraw-obsidian.online/WIKI/07%20Developer%20Docs/Excalidraw%20Automate%20library%20file%20%28not%20only%29%20for%20LLM%20training.md
---

# Excalidraw Automate library (not only) file for LLM training

Download the latest Excalidraw AI training file from [GitHub](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/refs/heads/master/docs/AITrainingData/ExcalidrawAutomate%20full%20library%20for%20LLM%20training.md). This file includes several inputs:
- The ExcalidrawAutomate library with documentation
- Relevant type definitions from the Plugin, from the Excalidraw component, and from Obsidian's type defintions
- The source code and documentation of all of the ExcalidrawAutomate scripts available in the plugin
- The template ExcalidrawStartup script, and a sample implementation of the ExcalidrawStartup script

Because this file is large, I recommend using Google's [Gemini (aka. AI Studio)](https://aistudio.google.com/) for generating code using this training file.

The process is very simple.
- Download the [training file](https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/refs/heads/master/docs/AITrainingData/ExcalidrawAutomate%20full%20library%20for%20LLM%20training.md)
- Open [Gemini](https://aistudio.google.com/)
- Copy/Paste the contents of the training file (don't just attach the file, but open it in a text editor and copy the contents to the prompt, attaching a file behaves different in the context window of the chatbot)
- Run the prompt
- Gemini will respond *"I'm Ready"*
- Describe the script or automation you need
- Copy the resulting script to `Excalidraw/Scripts/Your New Script.md` or to where ever you've defined your SCRIPT folder, and run the script in Excalidraw using the Obsidian Command Panel (CTRL/CMD+P and type in the title of your script)

![AI Scripting Superpowers: Create ANY Obsidian-Excalidraw Script with Gemini 2.5 - Easy & Free!](https://youtu.be/6BjhUyfS4iM)

Link to video: https://youtu.be/6BjhUyfS4iM

For more information about Excalidraw scripting visit my playlist on [YouTube](https://youtube.com/playlist?list=PL6mqgtMZ4NP3up3qjrWW69UwlPow0ZvzU&si=iWIF9pkQPdXYXOYc)
