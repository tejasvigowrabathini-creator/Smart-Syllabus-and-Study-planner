# Smart Syllabus & Study Planner

An AI-powered academic syllabus visualizer, workload calculator, and structured study planner built with React, Express, and Google Gemini 1.5 Pro via the modern `@google/genai` SDK.

## Features
- **Syllabus Parsing & Structuring:** Input or drag-and-drop course documents to deduce core modules, estimated workloads, and sequential learning goals.
- **Difficulty-Weighted Workload Distribution:** Displays modules with specialized difficulty indicators (Easy/Medium/Hard) and computes targeted weekly study requirements.
- **Chronological Timeline Navigation:** View a step-by-step program progression map with integrated milestone highlights.
- **Deep-Focus Pomodoro Scheduler:** Focus on selected modules with an integrated 25-minute deep learning timer and custom audio chime alarms.
- **Seamless Calendar Synchronization:** Export your compiled chronological lessons directly into standard `.ics` iCalendar formats.

## Prerequisites
- Node.js (v18+)
- A Gemini API Key (configured in standard local environments under `GEMINI_API_KEY`)

## Setup & Running locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Secrets
Create a `.env` file at the project root:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### 3. Run Development Server
```bash
npm run dev
# Starts full-stack Express server wrapping Vite on http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
# Compiles React components and tunnels TypeScript backend into dist/server.cjs
```

### 5. Launch Standalone Build
```bash
npm start
```

## Architecture Design Decisions
- **Full-Stack Isolation:** Protects sensitive server keys (Gemini API) inside Express, serving structured outputs securely over `/api/*` endpoints.
- **Strict Schema Enforcement:** Leverages Gemini's structured JSON schema parser constraints so returned payloads validate cleanly against TypeScript contract interfaces.
- **Pure Web Audio Engines:** Features a fully client-side tone synthesis framework for focus chimes, rendering external sound files redundant.
