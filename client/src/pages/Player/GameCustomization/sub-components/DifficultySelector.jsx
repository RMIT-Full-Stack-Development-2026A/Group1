import React from "react";
import PropTypes from "prop-types";
import { getDifficultyLevels } from "../service/customization.service";
import SoundButton from "@/components/reusable/SoundButton";
export default function DifficultySelector({ selectedDifficulty, onSelect }) {
    const difficulties = getDifficultyLevels();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    04. AI DIFFICULTY
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map((difficulty) => (
                    <SoundButton
                        key={difficulty.id}
                        onClick={() => onSelect(difficulty.id)}
                        className={`bg-[#1e1e2c] border-2 p-6 flex flex-col items-center cursor-pointer transition-all ${
                            selectedDifficulty === difficulty.id
                                ? "border-[#4cc9f0] shadow-[2px_2px_0px_#343342] hover:shadow-[0px_0px_12px_#4cc9f0]"
                                : "border-[#3d484d] shadow-[2px_2px_0px_#343342] hover:border-[#4cc9f0]"
                        }`}
                    >
                        {/* AI Name with difficulty-based coloring */}
                        <span 
                            className="font-headline text-2xl mb-2"
                            style={{
                                color: difficulty.id === 'EASY' ? '#4cc9f0' : difficulty.id === 'MEDIUM' ? '#facc15' : '#ef4444'
                            }}
                        >
                            {difficulty.level}
                        </span>

                        {/* Description */}
                        <p className="text-[16px] text-center leading-relaxed text-[#b0b0b8]">
                            {difficulty.description}
                        </p>
                    </SoundButton>
                ))}
            </div>
        </section>
    );
}

DifficultySelector.propTypes = {
    selectedDifficulty: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};
