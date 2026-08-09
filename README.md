# CommitGraph 

> **AI-Assisted Feature Identification from Git Commit History**  
> *Built for Hack Devengers 1.0 (August 2026)*

## 📖 Overview

Software reverse-engineering often requires manually reading thousands of raw Git commits to understand what features were built and when. **CommitGraph** solves this bottleneck by using AI to automatically read commit history, infer high-level software features, and instantly generate visual architectural diagrams—eliminating hours of manual documentation work.

CommitGraph is an AI-powered web application built to automate software reverse engineering. Designed as a prototype for the **UMLRev** research project (Farias et al., IEEE Access 2026), the tool ingests raw Git commit history (messages, diffs, and file statistics) and passes the data through the LLaMA 3.3 70B model via Groq. The AI infers distinct, high-level software features, categorizes every commit into feature clusters with confidence scores, and dynamically renders interactive Mermaid.js architectural flow diagrams. Built with Next.js, React 19, and a custom glassmorphism design system, CommitGraph transforms raw, chaotic Git history into clean, visual feature documentation in seconds.

## 🚀 Live Demo & Local Setup

### Local Development

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

### ▲ Vercel Deployment

CommitGraph is natively optimized for Vercel deployment with zero additional backend configuration. 
The internal datasets are bundled into serverless functions natively.

1. Push your repository to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. Import your `Commit-Graph` repository.
4. Expand the **Environment Variables** section and add:
   - `GROQ_API_KEY`: Your Groq API key.
5. Click **Deploy**. Vercel will automatically detect Next.js, compile the serverless functions, and bundle the local JSON datasets for the API routes.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React 19, Vanilla CSS (Custom Glassmorphism Design System)
- **Backend:** Next.js API Routes (Serverless / Vercel Edge Ready)
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
