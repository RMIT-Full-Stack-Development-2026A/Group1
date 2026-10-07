/**
 * webgl-error-boundary — ported from componentry.dev (shared by
 * AnimatedGradient, AuroraFlow, Spiral3DSlider). Plain JSX/PropTypes
 * (source is TypeScript for Next.js). Error boundaries must stay class
 * components in React.
 */

import { Component } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

export class WebGLErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <WebGLFallback />;
    }
    return this.props.children;
  }
}

WebGLErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
  onError: PropTypes.func,
};

export function WebGLFallback({
  className,
  message = "Interactive WebGL content is unavailable on this device/browser.",
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0d0d1a] via-[#1e1e2c] to-[#003543] px-4 text-center text-sm text-white/75",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p>{message}</p>
    </div>
  );
}

WebGLFallback.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
};
