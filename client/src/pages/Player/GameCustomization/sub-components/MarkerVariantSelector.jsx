import React from "react";
import PropTypes from "prop-types";
import { getMarkerVariants } from "../service/customization.service";

export default function MarkerVariantSelector({ selectedMarker, onSelect }) {
    const markerVariants = getMarkerVariants();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    03. MARKER VARIANTS
                </h2>
            </div>
            <div className="bg-[#1e1e2c] border border-[#3d484d] p-6 grid grid-cols-3 md:grid-cols-6 gap-6">
                {markerVariants.map((variant) => (
                    <button
                        key={variant.id}
                        onClick={() => onSelect(variant.id)}
                        className="flex flex-col items-center gap-2 group cursor-pointer transition-all"
                    >
                        <div
                            className={`flex gap-1 ${
                                variant.skewed ? "italic skew-x-12" : ""
                            } ${
                                selectedMarker === variant.id
                                    ? "border-2 border-[#4cc9f0] p-2 -m-2"
                                    : ""
                            }`}
                        >
                            {variant.isSymbol ? (
                                <>
                                    <div className="w-3 h-3 bg-cyan-400"></div>
                                    <div className="w-3 h-3 border-2 border-cyan-400"></div>
                                </>
                            ) : (
                                <>
                                    <span
                                        className={`font-headline text-xl ${variant.xColor} ${
                                            variant.xGlow
                                        }`}
                                    >
                                        X
                                    </span>
                                    <span
                                        className={`font-headline text-xl ${variant.oColor} ${
                                            variant.oGlow
                                        }`}
                                    >
                                        O
                                    </span>
                                </>
                            )}
                        </div>
                        <div
                            className={`h-1 w-full bg-[#4cc9f0] transition-opacity ${
                                selectedMarker === variant.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                            }`}
                        ></div>
                    </button>
                ))}
            </div>
        </section>
    );
}

MarkerVariantSelector.propTypes = {
    selectedMarker: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
};
