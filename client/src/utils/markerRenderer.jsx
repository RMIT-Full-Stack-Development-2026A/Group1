/**
 * Marker Renderer Utility
 * Renders X and O with the selected marker variant styling
 * Uses displayId (numeric 1-6) from CustomizationStore
 */
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";
import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";

/**
 * Get marker variant by displayId (numeric ID 1-6) or string ID ('CLASSIC')
 * Merges fallback static configurations with service fetch.
 * * @param {number|string} variantIdentifier - Marker variant display ID (1-6) or String ID
 * @returns {Object} Marker variant object
 */
export const getMarkerVariant = (variantIdentifier) => {
    // 1. Try fetching from service first
    try {
        const variants = getMarkerVariants();
        const found = variants.find((v) => v.displayId === variantIdentifier || v.id === variantIdentifier);
        if (found) return found;
    } catch (error) {
        console.warn("Could not fetch marker variants from service, using fallback.");
    }

    // 2. Fallback to hardcoded variants (Merged from .js file)
    const normalizedKey = String(variantIdentifier ?? 'CLASSIC').toUpperCase();
    const staticVariants = {
        CLASSIC: { id: 'CLASSIC', displayId: 1, xColor: 'text-red-500', oColor: 'text-cyan-400', xGlow: 'drop-shadow-[0_0_6px_red] drop-shadow-[0_0_14px_red] drop-shadow-[0_0_24px_red]', oGlow: 'drop-shadow-[0_0_6px_cyan] drop-shadow-[0_0_14px_cyan] drop-shadow-[0_0_24px_cyan]' },
        GLOW: { id: 'GLOW', displayId: 2, xColor: 'text-amber-400', oColor: 'text-purple-500', xGlow: 'drop-shadow-[0_0_8px_#fbbf24] drop-shadow-[0_0_18px_#fbbf24] drop-shadow-[0_0_30px_#fbbf24]', oGlow: 'drop-shadow-[0_0_8px_#a855f7] drop-shadow-[0_0_18px_#a855f7] drop-shadow-[0_0_30px_#a855f7]' },
        SKETCH: { id: 'SKETCH', displayId: 3, xColor: 'text-orange-500', oColor: 'text-blue-400', xGlow: 'drop-shadow-[0_0_10px_#f97316] drop-shadow-[0_0_20px_#ef4444]', oGlow: 'drop-shadow-[0_0_10px_#60a5fa] drop-shadow-[0_0_20px_#3b82f6]' },
        STONE: { id: 'STONE', displayId: 4, xColor: 'text-lime-400', oColor: 'text-pink-500', xGlow: 'drop-shadow-[0_0_6px_#84cc16] drop-shadow-[0_0_12px_#84cc16] drop-shadow-[0_0_20px_#84cc16]', oGlow: 'drop-shadow-[0_0_6px_#ec4899] drop-shadow-[0_0_12px_#ec4899] drop-shadow-[0_0_20px_#ec4899]' },
        PIXEL: { id: 'PIXEL', displayId: 5, xColor: 'text-slate-200', oColor: 'text-slate-200', xGlow: 'drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]', oGlow: 'drop-shadow-[0_0_4px_#e2e8f0] drop-shadow-[0_0_10px_#e2e8f0]', bordered: true },
        MINIMAL: { id: 'MINIMAL', displayId: 6, xColor: 'text-emerald-400', oColor: 'text-emerald-400', xGlow: 'drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]', oGlow: 'drop-shadow-[0_0_8px_#10b981] drop-shadow-[0_0_15px_#10b981]', animation: 'animate-pulse' },
    };

    // If identifier is a number (displayId), find by displayId
    if (typeof variantIdentifier === 'number') {
        const foundByDisplayId = Object.values(staticVariants).find(v => v.displayId === variantIdentifier);
        if (foundByDisplayId) return foundByDisplayId;
    }

    return staticVariants[normalizedKey] || staticVariants.CLASSIC;
};

export const renderXMarker = (variantDisplayId, className = "") => {
    const variant = getMarkerVariant(variantDisplayId);
    return <MarkerX variantData={variant} className={className} />;
};

/**
 * Render O marker with selected styling
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Styled O element
 */
export const renderOMarker = (variantDisplayId, className = "") => {
    const variant = getMarkerVariant(variantDisplayId);
    return <MarkerO variantData={variant} className={className} />;
};

/**
 * Render both X and O markers side by side (for preview)
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @returns {JSX.Element} Both markers
 */
export const renderMarkerPair = (variantDisplayId) => {
    return (
        <div className="flex items-center space-x-4">
            {renderXMarker(variantDisplayId, "w-8 h-8")}
            {renderOMarker(variantDisplayId, "w-8 h-8")}
        </div>
    );
};

/**
 * Resolve Tailwind wrapper classes for a marker style
 * Maps visual styles to animation and effect classes
 * * @param {string} markerStyle - Marker style from roomData.markerStyle
 * @returns {{ wrapperClass: string, filterStyle: string | null }}
 */
export const resolveMarkerStyleClasses = (markerStyle) => {
    const normalizedStyle = String(markerStyle ?? '').toUpperCase();

    const styleMap = {
        NEON: { wrapperClass: "animate-pulse shadow-glow-primary", filterStyle: null },
        // Keep STONE colored but add a subtle warm glow instead of forcing grayscale/low brightness
        STONE: { wrapperClass: "brightness-105 drop-shadow-[0_0_10px_rgba(132,204,22,0.12)]", filterStyle: null },
        SKETCH: { wrapperClass: "opacity-80 contrast-125", filterStyle: null },
        MINIMAL: { wrapperClass: "animate-pulse", filterStyle: null },
        GLOW: { wrapperClass: "brightness-110", filterStyle: null },
    };

    return styleMap[normalizedStyle] || { wrapperClass: "", filterStyle: null };
};
