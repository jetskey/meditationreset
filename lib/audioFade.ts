/**
 * AUDIO FADE UTILITIES — Gentle Volume Transitions
 *
 * These utilities create calm, imperceptible audio transitions.
 * If a transition feels "noticeable", it is too strong.
 *
 * Timing decisions:
 * - Fade-in: 1500ms — slow enough to feel organic
 * - Fade-out: 3000ms — very gradual, respects the session ending
 * - Post-silence: 600ms — brief pause before completion UI
 */

type FadeOptions = {
  duration: number;
  targetVolume: number;
  onComplete?: () => void;
};

/**
 * Fade audio volume from current level to target level.
 * Uses requestAnimationFrame for smooth interpolation.
 *
 * @param audio - HTMLAudioElement to fade
 * @param options - Fade configuration
 * @returns Cleanup function to cancel the fade
 */
export function fadeVolume(
  audio: HTMLAudioElement,
  options: FadeOptions
): () => void {
  const { duration, targetVolume, onComplete } = options;
  const startVolume = audio.volume;
  const volumeDelta = targetVolume - startVolume;
  const startTime = performance.now();

  let animationId: number | null = null;
  let cancelled = false;

  const tick = (currentTime: number) => {
    if (cancelled) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out curve for natural feel
    const easedProgress = 1 - Math.pow(1 - progress, 2);

    audio.volume = Math.max(0, Math.min(1, startVolume + volumeDelta * easedProgress));

    if (progress < 1) {
      animationId = requestAnimationFrame(tick);
    } else {
      // Ensure we hit exact target
      audio.volume = targetVolume;
      onComplete?.();
    }
  };

  animationId = requestAnimationFrame(tick);

  // Return cleanup function
  return () => {
    cancelled = true;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
}

/**
 * Fade audio in from 0 to target volume.
 * Call this when starting playback.
 *
 * @param audio - HTMLAudioElement to fade in
 * @param targetVolume - Volume to reach (default 0.8)
 * @param duration - Fade duration in ms (default 1500)
 * @returns Cleanup function
 */
export function fadeIn(
  audio: HTMLAudioElement,
  targetVolume: number = 0.8,
  duration: number = 1500
): () => void {
  // Start at 0
  audio.volume = 0;

  return fadeVolume(audio, {
    duration,
    targetVolume,
  });
}

/**
 * Fade audio out to 0, then pause after silence.
 * Call this when ending a session (natural or early exit).
 *
 * @param audio - HTMLAudioElement to fade out
 * @param duration - Fade duration in ms (default 3000)
 * @param silenceDuration - Pause before callback in ms (default 600)
 * @param onComplete - Called after fade + silence completes
 * @returns Cleanup function
 */
export function fadeOut(
  audio: HTMLAudioElement,
  duration: number = 3000,
  silenceDuration: number = 600,
  onComplete?: () => void
): () => void {
  let silenceTimeout: number | null = null;
  let cancelled = false;

  const cleanupFade = fadeVolume(audio, {
    duration,
    targetVolume: 0,
    onComplete: () => {
      if (cancelled) return;

      // Pause the audio now that volume is 0
      audio.pause();

      // Wait for silence before calling completion
      silenceTimeout = window.setTimeout(() => {
        if (!cancelled) {
          onComplete?.();
        }
      }, silenceDuration);
    },
  });

  // Return cleanup function
  return () => {
    cancelled = true;
    cleanupFade();
    if (silenceTimeout !== null) {
      window.clearTimeout(silenceTimeout);
    }
  };
}
