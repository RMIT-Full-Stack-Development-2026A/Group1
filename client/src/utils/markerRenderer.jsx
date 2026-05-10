/**
 * Marker Renderer Utility
 * Renders X and O with the selected marker variant styling
 * Uses displayId (numeric 1-6) from CustomizationStore
 */
import { MarkerX, MarkerO } from "@/components/reusable/custom/CustomMarkers";
import { getMarkerVariants } from "@/pages/Player/GameCustomization/service/customization.service";

/**
 * Get marker variant by displayId (numeric ID 1-6)
 * @param {number} variantDisplayId - Marker variant display ID (1-6)
 * @returns {Object} Marker variant object
 */
export const getMarkerVariant = (variantDisplayId) => {
    const variants = getMarkerVariants();
    return variants.find((v) => v.displayId === variantDisplayId || v.id === variantDisplayId) || variants[2];
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
