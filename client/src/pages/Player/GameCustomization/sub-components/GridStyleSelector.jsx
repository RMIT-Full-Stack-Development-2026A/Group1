import React from "react";
import PropTypes from "prop-types";
import { getGridStyles, BOARD_THEMES } from "../service/customization.service"; 
import SoundButton from "@/components/reusable/sound/SoundButton";

export default function GridStyleSelector({ selectedStyle, onSelect }) {
    const gridStyles = getGridStyles();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    02. GRID STYLES
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gridStyles.map((style) => {
                    
                    const themeConfig = BOARD_THEMES[style.displayId] || BOARD_THEMES.jungle;

                    return (
                        <SoundButton
                            key={style.id}
                            onClick={() => onSelect(style.displayId)}
                            className={`bg-[#12121f] border p-1 cursor-pointer transition-all ${
                                selectedStyle === style.displayId
                                    ? "border-2 border-[#4cc9f0] shadow-[2px_2px_0px_#343342]"
                                    : "border border-[#3d484d] hover:border-[#4cc9f0]"
                            }`}
                        >
                            <div className="w-full h-32 bg-[#05050a] flex flex-col items-center justify-center relative overflow-hidden">
                                
                                {themeConfig.bgImage && (
                                    <img 
                                        src={themeConfig.bgImage} 
                                        alt={`${style.name} background`}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none"
                                    />
                                )}
                                {/* --- MINI BOARD PREVIEW --- */}
                                <div 
                                    className={`p-1 relative z-10 ${themeConfig.wrapper}`}
                                    style={themeConfig.glow ? themeConfig.glow : {}}
                                >
                                 
                                    <div className={`grid grid-cols-3 ${themeConfig.boardBorder}`}>
                                        {Array(9).fill(null).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 ${themeConfig.cellBorder}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                {/* --- END MINI BOARD PREVIEW --- */}

                            </div>
                            <div
                                className={`p-2 text-center ${
                                    style.displayId === "dark" ? 
                                    "bg-[#4cc9f0] text-[#003543] drop-shadow-[0_0_5px_#4cc9f0]" : 
                                    style.displayId === "jungle" ? 
                                    "bg-[#27872c] text-[#003543] drop-shadow-[0_0_5px_#27872c]": 
                                    "bg-[#ff3d00] text-[#003543] drop-shadow-[0_0_5px_#ff3d00]"
                                }`}
                            >

                                <span className="text-[15px] font-bold tracking-tighter">
                                    {style.name}
                                </span>
                            </div>
                        </SoundButton>
                    );
                })}
            </div>
        </section>
    );
}

GridStyleSelector.propTypes = {
    selectedStyle: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};