import React from "react";
import PropTypes from "prop-types";
import { getGridStyles } from "../service/customization.service";

export default function GridStyleSelector({ selectedStyle, onSelect }) {
    const gridStyles = getGridStyles();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    02. GRID RENDERER
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gridStyles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => onSelect(style.id)}
                        className={`bg-[#12121f] border p-1 cursor-pointer transition-all ${
                            selectedStyle === style.id
                                ? "border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#343342]"
                                : "border border-[#3d484d] hover:border-[#4cc9f0]"
                        }`}
                    >
                        <div className="w-full h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                            {style.id === "classic" && (
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(#2a2a4e 1px, transparent 1px), linear-gradient(90deg, #2a2a4e 1px, transparent 1px)",
                                        backgroundSize: "15px 15px",
                                    }}
                                ></div>
                            )}
                            {style.id === "neon" && (
                                <div
                                    className="absolute inset-0 opacity-60"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(rgba(76,201,240,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.3) 1px, transparent 1px)",
                                        backgroundSize: "20px 20px",
                                    }}
                                ></div>
                            )}
                            {style.id === "block" && (
                                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
                                    {Array(24)
                                        .fill(0)
                                        .map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-[#292937]"
                                            ></div>
                                        ))}
                                </div>
                            )}
                            <span
                                className={`text-[10px] font-bold z-10 ${
                                    style.id === "neon"
                                        ? "text-[#4cc9f0] drop-shadow-[0_0_5px_#4cc9f0]"
                                        : "text-[#bcc8ce]"
                                }`}
                            >
                                {style.label}
                            </span>
                        </div>
                        <div
                            className={`p-2 text-center ${
                                style.id === "neon"
                                    ? "bg-[#4cc9f0] text-[#003543]"
                                    : "bg-[#292937]"
                            }`}
                        >
                            <span className="text-[9px] font-bold tracking-tighter">
                                {style.name}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

GridStyleSelector.propTypes = {
    selectedStyle: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};
