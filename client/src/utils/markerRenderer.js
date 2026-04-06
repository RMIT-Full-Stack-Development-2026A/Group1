/**
 * Marker Renderer Utility
 * Renders X and O with the selected marker variant styling
 * Uses displayId (numeric 1-6) from CustomizationStore
 */

import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";

/**
 * Get marker variant by displayId (numeric ID 1-6)
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @returns {Object} Marker variant object
 */
export const getMarkerVariant = (variantDisplayId) => {
    const variants = getMarkerVariants();
    return variants.find((v) => v.displayId === variantDisplayId) || variants[0]; // Default to first variant
};

/**
 * Render X marker with selected styling
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Styled X element
 */
export const renderXMarker = (variantDisplayId, className = "") => {
    const variant = getMarkerVariant(variantDisplayId);

    if (variant.isSymbol) {
        return (
            <div className={`w-6 h-6 bg-cyan-400 ${className}`}/>
        );
    }

    return (
        <span className={`font-headline text-2xl ${variant.xColor} ${variant.xGlow} ${className}`}>
            X
        </span>
    );
};

/**
 * Render O marker with selected styling
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Styled O element
 */
export const renderOMarker = (variantDisplayId, className = "") => {
    const variant = getMarkerVariant(variantDisplayId);

    if (variant.isSymbol) {
        return (
            <div className={`w-6 h-6 border-2 border-cyan-400 ${className}`}/>
        );
    }

    return (
        <span className={`font-headline text-2xl ${variant.oColor} ${variant.oGlow} ${className}`}>
            O
        </span>
    );
};

/**
 * Render both X and O markers side by side (for preview)
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @returns {JSX.Element} Both markers
 */
export const renderMarkerPair = (variantDisplayId) => {
    return (
        <div className="flex gap-4 items-center justify-center">
            {renderXMarker(variantDisplayId, "text-4xl")}
            {renderOMarker(variantDisplayId, "text-4xl")}
        </div>
    );
};
