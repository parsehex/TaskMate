# TaskMate

TaskMate is a work-in-progress computer app designed to help you harness the power of LLMs to solve tasks. It lets you construct prompts by combining reusable text snippets with project file contents. The design encourages you to stay in control—even when using AI as a mind-replacement.

If you know what [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) is, this is kind of like a manual RAG system.

## Features

- Manage reusable Snippets for tasks like instructions, context, goals, and more.
- Browse and select Files directly from your active project folder.
- Combine selected snippets and files into a consolidated prompt to send to an LLM.

## Why TaskMate?

While complete automation with AI is appealing, TaskMate focuses on keeping you involved. It lets you strategically use AI assistance in an iterative manner.

## Motivation

Instead of fully automating interactions with LLMs, TaskMate keeps you involved while faciilitating patterns that have worked for me.

## Workflow Overview

1. Define context by creating and managing snippets that explain your project and your current goal(s).
2. Select relevant files from your current project to help accomplish the goal.
3. Click to copy the combined prompt to start a new LLM chat from.
4. Repeat the process, updating snippets as you go along and as needed.

## Getting Started for Developers

1. Install dependencies:

   > pnpm install

2. Run the development server:

   > pnpm start

3. Build for production:
   > pnpm run build
