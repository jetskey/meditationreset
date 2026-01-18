/**
 * IDLE Design System
 *
 * A minimal, opinionated system for consistency.
 * When in doubt, choose restraint.
 */

// ─────────────────────────────────────────────────────────────
// 1. TEXT ROLES
// ─────────────────────────────────────────────────────────────

/**
 * TEXT HIERARCHY
 *
 * | Role      | Usage                        | Size    | Weight | Opacity |
 * |-----------|------------------------------|---------|--------|---------|
 * | display   | Outcomes, numbers, titles    | text-3xl| light  | 1.0     |
 * | body      | Statements, descriptions     | text-base| light | 0.85    |
 * | label     | Section headers, categories  | text-xs | normal | 0.5     |
 * | hint      | Guidance, tap hints, meta    | text-xs | normal | 0.35    |
 */

export const text = {
  // Primary outcomes - what matters most
  display: 'text-3xl font-light',

  // Body text - neutral statements
  body: 'text-base font-light',

  // Labels - section headers, uppercase categories
  label: 'text-[10px] uppercase tracking-[0.15em]',

  // Hints - guidance, secondary info
  hint: 'text-xs',
} as const;

export const textOpacity = {
  display: 1,
  body: 0.85,
  label: 0.5,
  hint: 0.35,
} as const;


// ─────────────────────────────────────────────────────────────
// 2. MOTION RULES
// ─────────────────────────────────────────────────────────────

/**
 * MOTION PRINCIPLES
 *
 * - Animate state changes (entering, completing)
 * - Don't animate continuous updates (timer ticking)
 * - Don't animate user-initiated navigation
 * - Keep durations short: 150ms for interactions, 300ms for state changes
 */

export const motion = {
  // Interactions (button press feedback)
  interaction: 'duration-150',

  // State changes (screen transitions, overlays)
  state: 'duration-300',

  // Easing
  ease: 'ease-out',
} as const;

/**
 * When to animate:
 * ✓ Screen state changes (pre-session → playing → complete)
 * ✓ Overlays appearing (halfway checkpoint)
 * ✓ Button press feedback
 *
 * When NOT to animate:
 * ✗ Timer updates
 * ✗ Progress ring movement
 * ✗ Navigation between screens
 */


// ─────────────────────────────────────────────────────────────
// 3. INTERACTION RULES
// ─────────────────────────────────────────────────────────────

/**
 * BUTTON HIERARCHY
 *
 * | Type      | Usage                     | Style                    |
 * |-----------|---------------------------|--------------------------|
 * | primary   | Main action (Start)       | Filled, accent color     |
 * | secondary | In-context action (Play)  | Filled, muted            |
 * | ghost     | Exit, cancel, dismiss     | No fill, low opacity     |
 */

export const button = {
  // Active state feedback - consistent across all buttons
  active: 'active:scale-[0.97] active:opacity-80',

  // Disabled state
  disabled: 'disabled:opacity-40 disabled:pointer-events-none',
} as const;

/**
 * DISMISSAL RULES
 *
 * Auto-dismiss (no user action required):
 * - Natural completion → 3s delay → return home
 * - Halfway checkpoint → 1.5s delay → fade out
 *
 * User-initiated (require tap):
 * - Early end completion → tap to continue
 * - Pre-session cancel → tap to cancel
 *
 * Principle: If the user chose to stop, they choose when to continue.
 */

/**
 * EXIT RULES
 *
 * - No confirmation dialogs
 * - No guilt language ("Are you sure?")
 * - No warnings
 * - Log partial progress without judgment
 * - Exit button always visible, always works
 */


// ─────────────────────────────────────────────────────────────
// 4. SPACING & LAYOUT
// ─────────────────────────────────────────────────────────────

export const spacing = {
  // Screen padding
  screen: 'px-5 pt-16 pb-8',

  // Section gaps
  sectionGap: 'mb-8',

  // Element gaps
  elementGap: 'mt-3',
} as const;


// ─────────────────────────────────────────────────────────────
// CSS ANIMATION (add to globals.css)
// ─────────────────────────────────────────────────────────────

/**
 * @keyframes fadeIn {
 *   from { opacity: 0; transform: translateY(4px); }
 *   to { opacity: 1; transform: translateY(0); }
 * }
 *
 * Usage: style={{ animation: 'fadeIn 300ms ease-out' }}
 */
