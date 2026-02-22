/**
 * ThemeDecorations — Avengers Endgame visual enhancements
 * Floating particles, arc reactor glow, scan overlay, background imagery
 * Pure visual layer — no logic
 */

import React from "react";
import { useLocation } from "react-router-dom";

const PARTICLE_COUNT = 40;

const ThemeDecorations = () => {
  const location = useLocation();

  // Hide the theme decorations on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Full-page scan line overlay — HUD cinematic effect */}
      <div className="theme-scan-overlay" aria-hidden />

      {/* Floating particles — starfield / dust effect */}
      <div className="theme-particles" aria-hidden>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="theme-particle"
            style={{
              left: `${(i * 7 + 13) % 100}%`,
              top: `${(i * 11 + 5) % 100}%`,
              animationDelay: `${(i * 0.3) % 4}s`,
              animationDuration: `${4 + (i % 5)}s`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              opacity: 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Arc Reactor — decorative corner glow (bottom-right) */}
      <div className="theme-arc-reactor theme-arc-reactor-br" aria-hidden>
        <svg
          viewBox="0 0 120 120"
          className="theme-arc-svg"
          aria-hidden
        >
          <defs>
            <radialGradient id="arcCore">
              <stop offset="0%" stopColor="hsl(180, 100%, 70%)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(180, 100%, 50%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(180, 100%, 50%)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="arcRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(51, 100%, 50%)" />
              <stop offset="50%" stopColor="hsl(180, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(51, 100%, 50%)" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="35" fill="url(#arcCore)" className="theme-arc-core" />
          <circle cx="60" cy="60" r="40" fill="none" stroke="url(#arcRing)" strokeWidth="1.5" opacity="0.6" className="theme-arc-ring" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(180, 100%, 50%)" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* Subtle corner HUD frame — top-left */}
      <div className="theme-hud-corner theme-hud-tl" aria-hidden />

      {/* Corner accent — bottom-left */}
      <div className="theme-hud-corner theme-hud-bl" aria-hidden />

      {/* Twinkling stars overlay — GIF-like CSS animation */}
      <div className="theme-twinkle-stars" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="theme-twinkle-dot"
            style={{
              left: `${(i * 17 + 3) % 100}%`,
              top: `${(i * 23 + 7) % 100}%`,
              animationDelay: `${(i * 0.2) % 3}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ThemeDecorations;
