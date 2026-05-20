import React from "react";
import PropTypes from "prop-types";
import SoundButton from "@/components/reusable/sound/SoundButton";

const getCopy = (gameMode) => {
    if (gameMode === "SINGLE_PLAYER") {
        return {
            title: "04. WHO STARTS FIRST",
            firstLabel: "YOU",
            firstSubtitle: "X STARTS",
            secondLabel: "AI",
            secondSubtitle: "O STARTS",
        };
    }

    return {
        title: "04. WHO STARTS FIRST",
        firstLabel: "PLAYER 1",
        firstSubtitle: "X STARTS",
        secondLabel: "PLAYER 2",
        secondSubtitle: "O STARTS",
    };
};

export default function FirstPlayerSelector({ gameMode, selectedPlayer, onSelect }) {
    const copy = getCopy(gameMode);

    const options = [
        {
            value: "X",
            label: copy.firstLabel,
            subtitle: copy.firstSubtitle,
        },
        {
            value: "O",
            label: copy.secondLabel,
            subtitle: copy.secondSubtitle,
        },
    ];

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#fad100]"></div>
                <h2 className="font-headline text-sm tracking-widest text-[#fad100]">
                    {copy.title}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option) => (
                    <SoundButton
                        key={option.value}
                        onClick={() => onSelect(option.value)}
                        className={`bg-[#1e1e2c] border p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                            selectedPlayer === option.value
                                ? "border-primary-cyan shadow-[2px_2px_0px_#343342] hover:shadow-[0px_0px_8px_#4cc9f0]"
                                : "border-outline-variant shadow-[2px_2px_0px_#343342] hover:border-primary-cyan"
                        }`}
                    >
                        <span className="font-headline text-3xl text-primary-cyan mb-2">
                            {option.value}
                        </span>
                        <span className="text-sm tracking-widest font-bold text-[#e3e0f4]">
                            {option.label}
                        </span>
                        <span className="text-[10px] tracking-widest opacity-60 font-bold mt-1">
                            {option.subtitle}
                        </span>
                    </SoundButton>
                ))}
            </div>
        </section>
    );
}

FirstPlayerSelector.propTypes = {
    gameMode: PropTypes.string.isRequired,
    selectedPlayer: PropTypes.oneOf(["X", "O"]).isRequired,
    onSelect: PropTypes.func.isRequired,
};