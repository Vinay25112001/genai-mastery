# 🧠 GenAI Mastery

**A full-stack Generative AI education platform built with React, TypeScript, and Supabase.**

GenAI Mastery takes learners from zero knowledge of AI to a working understanding of the architectures, mathematics, and research papers behind modern Generative AI — including Large Language Models, diffusion models, RAG pipelines, fine-tuning, and AI agents.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge)](https://vinay25112001.github.io/genai-mastery/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## Overview

The platform is structured as a progressive curriculum across 10 modules and 28 topics. Each topic contains two explanation modes (simple and professional/academic), real-world application examples, research paper citations, a quiz that must be passed at 70% to advance, and a hands-on coding exercise. Progress is locked sequentially so learners build genuine foundational understanding before moving to advanced topics.

User accounts are authenticated through Supabase. Progress is synced to the cloud on every completed topic and restored automatically when the user signs in on any device. Completed topics remain freely revisitable at any time for revision.

---

## Curriculum

| Module | Topics | Level |
|--------|--------|-------|
| 1 — What Is AI? | History, paradigms, ML types, taxonomy | Beginner |
| 2 — How Machines Learn | Neural networks, backprop, optimization, architectures | Beginner |
| 3 — What Is Generative AI? | Discriminative vs generative, four families, latent spaces | Beginner |
| 4 — Large Language Models | Tokenization, Transformers, RLHF, context windows | Intermediate |
| 5 — Prompt Engineering | Zero/few-shot, CoT, Tree of Thoughts, structured output | Intermediate |
| 6 — Retrieval-Augmented Generation | Embeddings, vector search, full RAG pipeline | Intermediate |
| 7 — Diffusion Models | DDPM, score matching, latent diffusion, ControlNet | Advanced |
| 8 — Fine-Tuning | LoRA, QLoRA, RLHF, DPO, reward modeling | Advanced |
| 9 — AI Agents | ReAct, tool use, LangChain, multi-agent systems | Advanced |
| 10 — Ethics & Future | Hallucination, bias, multimodal AI, AGI | Advanced |

---

## Features

- **Quiz-gated progression** — learners must score ≥ 70% to unlock the next topic
- **Two explanation modes** — Simple English for intuition, Professional/Academic for depth
- **Research citations** — every topic references foundational papers (Vaswani et al. 2017, Ho et al. 2020, Wei et al. 2022, and 50+ others)
- **Cloud progress sync** — Supabase stores completed topics and quiz scores, with localStorage as offline fallback
- **Cross-device continuity** — sign in on any device and resume exactly where you left off
- **Free backward navigation** — any completed topic can be revisited at any time
- **Email confirmation** — Supabase handles account verification automatically
- **Welcome email** — EmailJS sends a branded HTML welcome email on signup
- **Password reset** — full forgot-password flow built in
- **Auto-deploy** — GitHub Actions builds with environment secrets and pushes to GitHub Pages on every commit to main

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript |
| Styling | CSS custom properties, inline styles |
| Authentication | Supabase Auth (email + password, email confirmation) |
| Database | Supabase PostgreSQL with Row Level Security |
| Email | EmailJS (welcome email on signup) |
| Deployment | GitHub Pages via GitHub Actions |
| State | React hooks, localStorage fallback |

---

## Architecture

```
src/
├── hooks/
│   ├── useAuth.ts          Supabase session management, sign in/up/out
│   └── useProgress.ts      Cloud sync with localStorage fallback, unlock logic
├── lib/
│   └── supabase.ts         Supabase client initialisation
├── pages/
│   ├── AuthPage.tsx        Sign in, sign up, forgot password screens
│   ├── DashboardPage.tsx   Module overview with progress indicators
│   ├── ModulePage.tsx      Topic list with lock/unlock states
│   ├── TopicPage.tsx       Lesson content, tabbed sections
│   ├── QuizPage.tsx        Quiz with 70% pass threshold
│   └── ExercisePage.tsx    Hands-on coding exercise
├── data/
│   └── curriculum.ts       All 28 topics — content, quizzes, exercises
└── components/
    └── layout/
        └── Navbar.tsx      Navigation with progress bar
```

The progress unlock logic follows a strict sequence: the first topic of each module is available once any topic in the previous module is completed. Every subsequent topic within a module unlocks only after the previous one is passed. Topics once completed are always accessible regardless of their position in the sequence.

---

## Database Schema

```sql
table: user_progress
  id               uuid  (primary key)
  user_id          uuid  (references auth.users, unique)
  completed_topics text[] (array of topic IDs)
  quiz_scores      jsonb  (topic ID → score map)
  updated_at       timestamptz
```

Row Level Security is enabled. Users can only read and write their own row.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase publishable API key |
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service identifier |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | EmailJS template identifier |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS public key |

In production these are stored as GitHub repository secrets and injected at build time by the GitHub Actions workflow. Locally they go in `.env.local` which is excluded from version control.

---

## Local Development

```bash
git clone https://github.com/vinay25112001/genai-mastery.git
cd genai-mastery
npm install
cp .env.example .env.local
# Add your Supabase and EmailJS values to .env.local
npm start
```

---

## Deployment

Every push to the `main` branch triggers the GitHub Actions workflow defined in `.github/workflows/deploy.yml`. The workflow installs dependencies, injects environment secrets, runs the production build, and pushes the output to the `gh-pages` branch. GitHub Pages serves from that branch automatically.

---

## Author

**Vinay Kumar Reddy Sirigireddy**
M.S. Aerospace Systems Engineering — Wright State University
[GitHub](https://github.com/vinay25112001) · [eVTOL Sizer](https://evtolsizer.live)
