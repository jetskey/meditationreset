# IDLE — Product Guardrails

This document defines what IDLE is, what it is not, and the invariants that must hold across all future iterations.

---

## What IDLE Is

- A 7-minute daily reset for mental clarity
- One session type, one duration, one purpose
- Calm, factual, non-pressuring
- A tool, not a coach

---

## Non-Goals (Do NOT Build)

- ❌ Session library or multiple session types
- ❌ Duration picker or customization
- ❌ Gamification: levels, badges, achievements, XP
- ❌ Streak pressure messages ("Don't break your streak!")
- ❌ Social features, sharing, leaderboards
- ❌ Notifications or reminders
- ❌ Onboarding tutorials beyond the initial welcome
- ❌ Progress tracking beyond basic stats
- ❌ Motivational or directive copy

---

## Copy / Tone Rules

### Prefer
- begin, return, reset, pause, continue
- clarity, stillness, space
- Factual, calm, understated

### Avoid
- improve, optimize, boost, achieve, unlock
- train, performance, productivity, focus (as verbs)
- Exclamation marks, enthusiasm, celebration
- "Great job!", "You did it!", "Keep going!"

---

## UX Invariants

These must always hold:

1. **Navigation always works** — Home / Session / Stats reachable at all times (via TabBar) when not in active session
2. **Session can always be exited** — Explicit exit button/gesture; never traps the user
3. **Completion state is clean** — Never overlays other pages; fades to home after natural completion
4. **No overlays between pages** — Each page renders its own opaque background
5. **One session type** — No session picker, library, or choices
6. **Stats are reflective, not performative** — No gamification language

---

## Audio Invariants

1. **Fade in** — Audio volume ramps from 0 to target (~1500ms)
2. **Fade out** — Audio volume ramps to 0 (~3000ms) on completion or early exit
3. **Silence before completion** — ~600ms pause after fade-out before showing completion UI
4. **Never hard-cut** — No abrupt volume changes

---

## Technical Invariants (Next.js)

Required files that must exist:
- `app/layout.tsx` — Valid html/body structure, default export
- `app/error.tsx` — Error boundary (can return minimal UI)
- `app/not-found.tsx` — 404 boundary (can return null)

Architecture:
- Layout is visually neutral (no backgrounds)
- Each page renders its own opaque background
- Providers wrap children but don't render overlays
- StatsProvider in Providers.tsx for localStorage persistence

**Import Safety Rules:**
- NEVER import .md, .txt, or other documentation files into runtime code
- `'use client'` directive MUST be the first line in client components (before comments)
- After structural changes, always clear cache: `rm -rf .next node_modules/.cache`

---

## Quick QA Checklist

Before any release:

- [ ] Can navigate Home → Session → Stats via TabBar?
- [ ] Can start and complete a session?
- [ ] Can exit session early at any point?
- [ ] Does audio fade in at start?
- [ ] Does audio fade out at end?
- [ ] Is there silence before completion UI?
- [ ] Does completion screen auto-dismiss (natural) or allow tap (early exit)?
- [ ] Do stats persist across refresh?
- [ ] Does onboarding appear only once?
- [ ] Is all copy calm and non-pressuring?

---

*Last updated: January 2025*
