# CommitGraph 

> **AI-Assisted Feature Identification from Git Commit History**  
> *Built for Hack Devengers 1.0 (August 2026)*

![CommitGraph Dashboard](<img width="1892" height="866" alt="image" src="https://github.com/user-attachments/assets/f110cd30-6f39-4d8e-a757-1fd8eeee2635" />
)

## 📖 Overview

**CommitGraph** is a full-stack, AI-powered web application designed to solve a critical bottleneck in automated software reverse engineering. 

It tests a specific research hypothesis: *Can a Large Language Model (LLM) accurately infer high-level software features using only raw git commit messages and file-level diff statistics?*

This prototype was built to complement the **UMLRev** research project (Farias et al., IEEE Access 2026), replacing the manual feature-tagging process with automated AI classification.

## 🚀 Live Demo

1. Clone this repository.
2. Ensure you have Node.js 18+ installed.
3. Set your Groq API key in your `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Then edit .env to add your GROQ_API_KEY
   ```
4. Note: The prototype is password protected. The hackathon access password is **`devengers2026`**.
5. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```
6. Navigate to `http://localhost:3000`.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React 19, Vanilla CSS (Custom Glassmorphism Design System)
- **Backend:** Next.js API Routes (Edge-ready)
- **AI / LLM:** Groq API (`llama-3.3-70b-versatile`)
- **Data Visualization:** Mermaid.js (Dynamically rendered feature graphs)
- **Data Source:** GitHub REST API

## 🧠 How It Works

1. **Fetch Commits:** We pull real commit history from GitHub (messages, diffs, file stats).
2. **LLM Classification:** Each commit is sent to LLaMA 3.3 70B via Groq for feature inference.
3. **Feature Clustering:** Classified commits are grouped by inferred feature with confidence scores.
4. **Visual Graph:** A Mermaid feature-relationship diagram is auto-generated from the clusters.

---
*Built with ❤️ for Hack Devengers 1.0 by Aditya Rane*
