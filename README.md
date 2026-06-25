# GenAI Mastery 🧠

A full-stack AI education platform — 10 modules, 28 topics, quiz-gated progression,
cloud progress sync via Supabase, and welcome emails via EmailJS.

---

## 🚀 Quick Deploy (GitHub Actions — Recommended)

### Step 1 — Add GitHub Secrets
Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Where to find it |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase → Settings → General → Project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase → Settings → API → Publishable key |
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS → Email Services → your service |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | EmailJS → Email Templates → your template |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS → Account → General |

### Step 2 — Set up the Database
In Supabase → **SQL Editor** → paste and run the contents of `supabase/setup.sql`

### Step 3 — Configure Auth Redirect
In Supabase → **Authentication** → **URL Configuration**:
- Site URL: `https://vinay25112001.github.io`
- Redirect URLs: `https://vinay25112001.github.io/genai-mastery/`

### Step 4 — Push to main
The `.github/workflows/deploy.yml` file handles everything automatically.
Push any change to `main` and GitHub Actions will build + deploy.

### Step 5 — Enable GitHub Pages
In your repo → **Settings** → **Pages** → Source: **gh-pages branch** → Save

---

## 🏗️ Local Development

```bash
cp .env.example .env.local
# Fill in your values in .env.local
npm install
npm start
```

---

## 📁 Project Structure

```
src/
  hooks/
    useAuth.ts        — Supabase authentication
    useProgress.ts    — Cloud + local progress sync
  lib/
    supabase.ts       — Supabase client
  pages/
    AuthPage.tsx      — Sign in / Sign up / Forgot password
    DashboardPage.tsx — Module overview
    ModulePage.tsx    — Topic list
    TopicPage.tsx     — Lesson content
    QuizPage.tsx      — Quiz (70% to pass)
    ExercisePage.tsx  — Hands-on exercise
  data/
    curriculum.ts     — All 28 topics, 10 modules
supabase/
  setup.sql           — Run this in Supabase SQL Editor
.github/
  workflows/
    deploy.yml        — Auto build + deploy on push to main
```

---

## ✅ Features

- **Real authentication** — Supabase email/password with email confirmation
- **Cloud progress sync** — Saves to Supabase, fallback to localStorage
- **Cross-device** — Log in anywhere, progress follows you
- **Backward navigation** — Revisit any completed topic freely
- **Sequential unlock** — Complete a topic to unlock the next one
- **Welcome email** — Professional HTML email via EmailJS on signup
- **Password reset** — Forgot password flow built in
