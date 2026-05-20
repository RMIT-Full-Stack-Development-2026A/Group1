import React from "react";
import PropTypes from "prop-types";
import SoundButton from "@/components/reusable/sound/SoundButton";
export default function ActionButtons({ onCreateRoom, onCancel, isLoading, gameMode }) {
    const primaryLabel = gameMode === "ONLINE_MATCH" ? "CREATE ROOM" : "PLAY";

    return (
        <div className="flex flex-col md:flex-row gap-4 pt-6">
            <SoundButton
                onClick={onCreateRoom}
                disabled={isLoading}
                className="flex-grow bg-[#4cc9f0] text-[#003543] font-headline py-5 cursor-pointer tracking-tighter shadow-[2px_2px_0px_#343342] hover:shadow-[0px_0px_8px_#4cc9f0] active:translate-y-0.5 transition-all text-lg disabled:opacity-50"
            >
                {isLoading ? "CREATING..." : primaryLabel}
            </SoundButton>
            <SoundButton
                onClick={onCancel}
                className="bg-transparent border border-[#ffb4ab] text-[#ffb4ab] cursor-pointer font-headline py-5 px-12 tracking-tighter hover:bg-[#ffb4ab]/10 active:translate-y-0.5 transition-all text-sm"
            >
                CANCEL
            </SoundButton>
        </div>
    );
}

ActionButtons.propTypes = {
    onCreateRoom: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    gameMode: PropTypes.string,
};

ActionButtons.defaultProps = {
    isLoading: false,
    gameMode: "",
};
