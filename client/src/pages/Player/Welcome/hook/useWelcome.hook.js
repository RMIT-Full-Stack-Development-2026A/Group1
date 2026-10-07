/**
 * useWelcome Hook
 * Page-level concerns only: reduced-motion flag (for the manual branches that
 * framer-motion's own useReducedMotion doesn't cover, e.g. plain CSS keyframe
 * animations in MarqueeBand) and the shared smooth-scroll-to-section helper.
 * Most section logic stays local to each sub-component (matches the
 * codebase's existing convention — see GameModeCard/GameModeSelect).
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useWelcome = () => {
  const navigate = useNavigate();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const scrollToSection = useCallback(
    (sectionId) => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    },
    [prefersReducedMotion]
  );

  const goToPlay = useCallback(() => {
    navigate("/play");
  }, [navigate]);

  return {
    prefersReducedMotion,
    scrollToSection,
    goToPlay,
  };
};
