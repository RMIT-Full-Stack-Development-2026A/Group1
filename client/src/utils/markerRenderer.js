/**
 * Marker Renderer Utility
 * Renders X and O with the selected marker variant styling
 */

import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";

/**
 * Get marker variant by ID
 * @param {number} variantId - Marker variant ID (1-6)
 * @returns {Object} Marker variant object
 */
export const getMarkerVariant = (variantId) => {
    const variants = getMarkerVariants();
    return variants.find((v) => v.id === variantId) || variants[2]; // Default to variant 3
};

/**
 * Render X marker with selected styling
 * @param {number} variantId - Marker variant ID
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Styled X element
 */
export const renderXMarker = (variantId, className = "") => {
    const variant = getMarkerVariant(variantId);

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
 * @param {number} variantId - Marker variant ID
 * @param {string} className - Additional Tailwind classes
 * @returns {JSX.Element} Styled O element
 */
export const renderOMarker = (variantId, className = "") => {
    const variant = getMarkerVariant(variantId);

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
 * @param {number} variantId - Marker variant ID
 * @returns {JSX.Element} Both markers
 */
export const renderMarkerPair = (variantId) => {
    return (
        <div className="flex gap-4 items-center justify-center">
            {renderXMarker(variantId, "text-4xl")}
            {renderOMarker(variantId, "text-4xl")}
        </div>
    );
};
