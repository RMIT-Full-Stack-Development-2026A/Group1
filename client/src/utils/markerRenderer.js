/**
 * Returns the marker variant configuration used by the custom marker SVG components.
 *
 * @param {string|number} variantKey - Variant identifier from customization state.
 * @returns {{ id: string, displayId: number, xColor: string, oColor: string, xGlow?: string, oGlow?: string, animation?: string, bordered?: boolean }}
 */
export function getMarkerVariant(variantKey) {
  const normalizedKey = String(variantKey ?? 'CLASSIC').toUpperCase();

  const variants = {
    CLASSIC: {
      id: 'CLASSIC',
      displayId: 1,
      xColor: 'text-red-500',
      oColor: 'text-cyan-400',
      xGlow: 'drop-shadow-[0_0_6px_red] drop-shadow-[0_0_14px_red] drop-shadow-[0_0_24px_red]',
      oGlow: 'drop-shadow-[0_0_6px_cyan] drop-shadow-[0_0_14px_cyan] drop-shadow-[0_0_24px_cyan]',
    },
    GLOW: {
      id: 'GLOW',
      displayId: 2,
      xColor: 'text-amber-400',
      oColor: 'text-purple-500',
      xGlow: 'drop-shadow-[0_0_8px_#fbbf24] drop-shadow-[0_0_18px_#fbbf24] drop-shadow-[0_0_30px_#fbbf24]',
      oGlow: 'drop-shadow-[0_0_8px_#a855f7] drop-shadow-[0_0_18px_#a855f7] drop-shadow-[0_0_30px_#a855f7]',
    },
    SKETCH: {
      id: 'SKETCH',
      displayId: 3,
      xColor: 'text-orange-500',
      oColor: 'text-blue-400',
      xGlow: 'drop-shadow-[0_0_10px_#f97316] drop-shadow-[0_0_20px_#ef4444]',
      oGlow: 'drop-shadow-[0_0_10px_#60a5fa] drop-shadow-[0_0_20px_#3b82f6]',
    },
    STONE: {
      id: 'STONE',
      displayId: 4,
      xColor: 'text-lime-400',
      oColor: 'text-pink-500',
      xGlow: 'drop-shadow-[0_0_6px_#84cc16] drop-shadow-[0_0_12px_#84cc16] drop-shadow-[0_0_20px_#84cc16]',
      oGlow: 'drop-shadow-[0_0_6px_#ec4899] drop-shadow-[0_0_12px_#ec4899] drop-shadow-[0_0_20px_#ec4899]',
    },
    PIXEL: {
      id: 'PIXEL',
      displayId: 5,
      xColor: 'text-slate-200',
      oColor: 'text-slate-200',
      xGlow: 'drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]',
      oGlow: 'drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]',
      bordered: true,
    },
    MINIMAL: {
      id: 'MINIMAL',
      displayId: 6,
      xColor: 'text-emerald-400',
      oColor: 'text-emerald-400',
      xGlow: 'drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]',
      oGlow: 'drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]',
      animation: 'animate-pulse',
    },
  };

  return variants[normalizedKey] || variants.CLASSIC;
}

/**
 * Resolve HUD marker style classes from a room marker style.
 *
 * @param {string} markerStyle - Room marker style, case-insensitive.
 * @returns {{ wrapperClass: string, filterStyle: string | null }}
 */
export function resolveMarkerStyleClasses(markerStyle) {
  const normalizedStyle = String(markerStyle ?? '').toUpperCase();

  switch (normalizedStyle) {
    case 'NEON':
      return {
        wrapperClass: 'animate-pulse shadow-glow-primary',
        filterStyle: null,
      };
    case 'STONE':
      return {
        wrapperClass: 'grayscale brightness-75',
        filterStyle: null,
      };
    case 'SKETCH':
      return {
        wrapperClass: 'opacity-80 contrast-125',
        filterStyle: null,
      };
    default:
      return {
        wrapperClass: '',
        filterStyle: null,
      };
  }
}
