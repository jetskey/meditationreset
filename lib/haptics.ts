/**
 * HAPTICS — Subtle State Transition Markers
 *
 * Philosophy:
 * - Haptics mark transitions, not interactions
 * - Quiet confirmation, not feedback
 * - Extremely subtle (5-10ms)
 * - Fail silently if unsupported
 *
 * When to use:
 * - Session start (threshold crossed)
 * - Session exit (returning to idle)
 * - Session complete (before showing time)
 *
 * When NOT to use:
 * - Button taps
 * - During active session
 * - Repeated/continuous feedback
 */

type HapticType = 'transition' | 'complete';

// Duration in milliseconds — barely perceptible
const HAPTIC_DURATION: Record<HapticType, number> = {
  transition: 6,  // Threshold crossing, exit
  complete: 10,   // Session completion (slightly more presence)
};

/**
 * Trigger a subtle haptic.
 * Fails silently if vibration API is unavailable.
 */
export function haptic(type: HapticType = 'transition'): void {
  // Check for vibration support
  if (typeof navigator === 'undefined') return;
  if (!navigator.vibrate) return;

  const duration = HAPTIC_DURATION[type];

  try {
    navigator.vibrate(duration);
  } catch {
    // Silent failure — haptics are enhancement, not requirement
  }
}

/**
 * Convenience exports for specific transitions
 */
export const hapticTransition = () => haptic('transition');
export const hapticComplete = () => haptic('complete');
