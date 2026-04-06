export default function LockoutWarning({ failedAttempts, isLocked }) {
    // Show warning bar when approaching lockout (before it's locked)
    if (failedAttempts < 2 || isLocked) {
        return null;
    }

    return (
        <div className="bg-[#93000a] border-l-4 border-[#ffb4ab] text-[#ffdad6] p-3 mb-8 flex items-center gap-3 text-[10px] font-bold">
            <span>🔒</span>
            <span>
                WARNING: {5 - failedAttempts} ATTEMPTS REMAINING BEFORE LOCKOUT
            </span>
        </div>
    );
}
