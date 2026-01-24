"use client";

import { useEffect, useRef, useState } from "react";

export default function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = localStorage.getItem("idle_welcome_seen");
    if (!seen) {
      setVisible(true);
      audioRef.current = new Audio("/audio/idle-welcome.mp3");
      audioRef.current.volume = 0.9;
    }
  }, []);

  const finish = () => {
    localStorage.setItem("idle_welcome_seen", "true");
    setVisible(false);
  };

  const startAudio = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      audioRef.current.onended = finish;
    } catch {
      finish();
    }
  };

  const skip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    finish();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "linear-gradient(rgba(10,12,10,0.9), rgba(10,12,10,0.96))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 420,
          padding: 32,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          welcome to idle
        </h1>

        <p
          style={{
            opacity: 0.75,
            marginBottom: 28,
            fontSize: 16,
          }}
        >
          one session. once a day. nothing to achieve.
        </p>

        <button
          onClick={startAudio}
          style={{
            padding: "14px 30px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          begin
        </button>

        <div style={{ marginTop: 18 }}>
          <button
            onClick={skip}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            skip
          </button>
        </div>
      </div>
    </div>
  );
}
