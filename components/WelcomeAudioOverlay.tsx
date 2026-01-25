"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function WelcomeAudioOverlay() {
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("tap play to begin");
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const captions = useMemo(
    () => [
      { t: 0.0, text: "Welcome to idle." },
      { t: 2.2, text: "idle is a simple practice to create space between you and your thoughts." },
      { t: 7.2, text: "You're not trying to control your mind or reach a special state." },
      { t: 12.2, text: "You're practicing stepping back, so thoughts can be there without pulling you in." },
      { t: 19.2, text: "What matters most is consistency." },
      { t: 22.8, text: "A few minutes, done regularly, work better than occasional long sessions." },
      { t: 29.0, text: "Let's begin." },
    ],
    []
  );

  useEffect(() => {
    const seen = localStorage.getItem("idle_welcome_seen");
    if (!seen) setVisible(true);
  }, []);

  const updateCaption = () => {
    const a = audioRef.current;
    if (!a) return;

    const time = a.currentTime;
    for (let i = captions.length - 1; i >= 0; i--) {
      if (time >= captions[i].t) {
        setCaption(captions[i].text);
        break;
      }
    }

    rafRef.current = requestAnimationFrame(updateCaption);
  };

  const startPlayback = async () => {
    setError(null);

    try {
      const audio = new Audio("/audio/idle-welcome.mp3");
      audio.preload = "auto";
      audio.volume = 1;
      (audio as any).playsInline = true;

      audioRef.current = audio;

      audio.onended = () => finish();
      audio.onerror = () => {
        setError("Audio failed to load. Check that idle-welcome.mp3 exists in /public/audio.");
        setPlaying(false);
      };

      await audio.play();

      setPlaying(true);
      setCaption(captions[0].text);

      rafRef.current = requestAnimationFrame(updateCaption);
    } catch (err) {
      setError("Playback was blocked. Please tap play again.");
    }
  };

  const finish = () => {
    localStorage.setItem("idle_welcome_seen", "true");

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    setVisible(false);
    setPlaying(false);
  };

  if (!visible) return null;

  return (
    <div style={overlay}>
      <div style={panel}>
        <h2 style={title}>Welcome to Idle</h2>

        <div style={subtitleBox}>
          <p style={subtitle}>{caption}</p>
          {error && <p style={errorText}>{error}</p>}
        </div>

        <button
          style={button}
          onClick={playing ? finish : startPlayback}
        >
          {playing ? "skip" : "play"}
        </button>
      </div>
    </div>
  );
}

/* styles — minimal, warm neutral */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(10,11,14,0.92)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  fontFamily: "var(--font-inter)",
  pointerEvents: "auto",
};

const panel: React.CSSProperties = {
  width: "min(440px, 88vw)",
  padding: 32,
  borderRadius: 12,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.04)",
  textAlign: "center",
  color: "#E6E8EB",
  pointerEvents: "auto",
};

const title: React.CSSProperties = {
  fontFamily: "var(--font-acme)",
  fontSize: 22,
  letterSpacing: "0.03em",
  marginBottom: 24,
  opacity: 0.9,
};

const subtitleBox: React.CSSProperties = {
  padding: 20,
  borderRadius: 8,
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.03)",
  marginBottom: 24,
  minHeight: 72,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.65,
  fontWeight: 300,
  opacity: 0.75,
};

const errorText: React.CSSProperties = {
  marginTop: 12,
  fontSize: 11,
  opacity: 0.5,
};

const button: React.CSSProperties = {
  padding: "12px 28px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.05)",
  color: "#E6E8EB",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.06em",
  cursor: "pointer",
  transition: "all 300ms cubic-bezier(0.4, 0, 0.6, 1)",
};
