import React from "react";
import PropTypes from "prop-types";
import { getDifficultyLevels } from "../service/customization.service";

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
                    <button
                        key={difficulty.id}
                        onClick={() => onSelect(difficulty.id)}
                        className={`bg-[#1e1e2c] border-2 p-6 flex flex-col items-center cursor-pointer transition-all ${
                            selectedDifficulty === difficulty.id
                                ? "border-[#4cc9f0] shadow-[2px_2px_0px_#343342] hover:shadow-[0px_0px_12px_#4cc9f0]"
                                : "border-[#3d484d] shadow-[2px_2px_0px_#343342] hover:border-[#4cc9f0]"
                        }`}
                    >
                        {/* Difficulty Badge */}
                        <div 
                            className={`mb-4 px-3 py-1 rounded-none border font-bold text-[10px] tracking-widest ${
                                selectedDifficulty === difficulty.id
                                    ? "border-current text-[#0d0d1a]"
                                    : "bg-transparent border-current"
                            }`}
                            style={
                                selectedDifficulty === difficulty.id 
                                    ? { backgroundColor: difficulty.badgeColorHex }
                                    : { color: difficulty.badgeColorHex, borderColor: difficulty.badgeColorHex }
                            }
                        >
                            {difficulty.level}
                        </div>

                        {/* AI Name */}
                        <span className="font-headline text-2xl text-[#4cc9f0] mb-2">
                            {difficulty.aiName}
                        </span>

                        {/* Description */}
                        <p className="text-[16px] text-center leading-relaxed text-[#b0b0b8] mb-4 min-h-12">
                            {difficulty.description}
                        </p>

                        {/* Behavior Info */}
                        <div className="w-full border-t border-[#3d484d] pt-3 mt-auto">
                            <span className="text-[12px] tracking-widest opacity-60 font-bold block text-left">
                                BEHAVIOR:
                            </span>
                            <ul className="text-[12px] text-[#b0b0b8] space-y-1 mt-2 text-left">
                                {difficulty.behaviors.map((behavior, idx) => (
                                    <li key={idx} className="flex gap-2 justify-start">
                                        <span className="text-[#4cc9f0] flex-shrink-0">•</span>
                                        <span className="flex-1">{behavior}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

DifficultySelector.propTypes = {
    selectedDifficulty: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};
