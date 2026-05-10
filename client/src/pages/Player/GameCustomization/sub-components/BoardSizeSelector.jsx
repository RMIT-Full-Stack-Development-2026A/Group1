import React from "react";
import PropTypes from "prop-types";
import { getBoardSizes } from "../service/customization.service";
import SoundButton from "@/components/reusable/sound/SoundButton"; 

export default function BoardSizeSelector({ selectedSize, onSelect }) {
    const boardSizes = getBoardSizes();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    01. BOARD SIZE
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {boardSizes.map((size) => (
                    <SoundButton
                        key={size.id}
                        onClick={() => onSelect(size.displayId)}
                        className={`bg-[#1e1e2c] border p-6 flex flex-col items-center cursor-pointer justify-center transition-all ${
                            selectedSize === size.displayId
                                ? "border-[#4cc9f0] shadow-[2px_2px_0px_#343342] hover:shadow-[0px_0px_8px_#4cc9f0]"
                                : "border-[#3d484d] shadow-[2px_2px_0px_#343342] hover:border-[#4cc9f0]"
                        }`}
                    >
                        <span className="font-headline text-2xl text-[#4cc9f0] mb-2">
                            {size.label}
                        </span>
                        <span className="text-[10px] tracking-widest opacity-50 font-bold">
                            {size.subtitle}
                        </span>
                    </SoundButton>
                ))}
            </div>
        </section>
    );
}

BoardSizeSelector.propTypes = {
    selectedSize: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};
