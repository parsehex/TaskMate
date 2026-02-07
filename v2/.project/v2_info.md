# TaskMate v2: Implementation Plan

## Goal Description

Build a "Prompt Assembly" tool that allows users to select files and snippets to construct complex prompts for AI interaction.

## Key Concepts

- Snippets: Reusable blocks of text/code that constitute the main instruction set.
- Files: References to actual files (virtual or real).
- Prompt Generation: Concatenates selected items into a final string using Markdown blocks.

## Proposed Architecture

### Shared Core (@taskmate/core)

- Prompt Engine:
  - Format: Markdown code blocks.
  - Options:
    - use-title: If true, output ### [Name]\n\``\n[Content]\n```. If false, just output [Content]`.
  - Store: Manages Project state, including Files and Snippets.

### Web Mode (@taskmate/web)

- Tech: Vue 3, Tailwind 4, Shadcn-vue.
- Storage: localStorage (simulated FS).
- Deployment: GitHub Pages (standalone).

### Local Mode (@taskmate/local)

- Tech: Node.js/Express server serving the Web App.
- Role: Provides real FS access to the Web App via API/WebSocket.

### Important to Note

Seeing as there's significant overlap in the needs of `web` and `local`, the plan is to develop the `web` sufficiently so that the `local` version is pretty lightweight, since it'll use the `web` version but hooked up to the locally-running backend.
