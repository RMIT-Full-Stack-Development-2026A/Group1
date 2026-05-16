// AbortModal.jsx
import { AlertTriangle } from 'lucide-react';

/**
 * AbortModal — Confirm dialog before aborting a game.
 * Props:
 *   isOpen       boolean
 *   gameMode     'SINGLE_PLAYER' | 'TWO_PLAYERS' | 'ONLINE_MATCH'
 *   isSaving     boolean — disable buttons while saving
 *   onConfirm    () => void — save + exit
 *   onCancel     () => void — close modal, resume game
 */
const AbortModal = ({
    isOpen,
    gameMode,
    isSaving,
    onConfirm,
    onCancel,
    // New props for notification mode
    isNotification = false,
    notificationText = 'OPPONENT ABORTED THE MATCH'
}) => {
    if (!isOpen) return null;

    const isOnline = gameMode === 'ONLINE_MATCH';

    return (
        <div className="fixed inset-0 z-200 bg-deep-bg/90 flex items-center justify-center animate-fade-in">
            <div
                className="relative bg-[#12121f] border-4 border-[#ffb4ab] p-10 max-w-sm w-[90%] text-center"
                style={{ boxShadow: '0 0 30px rgba(255,180,171,0.4)' }}
            >
                {/* Warning icon */}
                <div className="flex justify-center mb-4">
                    <AlertTriangle size={40} color="#ffb4ab" />
                </div>

                <h2 className="font-headline text-[13px] text-[#ffb4ab] uppercase mb-3">
                    {isNotification ? 'MATCH ABORTED' : 'ABORT MATCH?'}
                </h2>

                <p className="font-mono text-[10px] text-[#879398] uppercase tracking-widest mb-2">
                    {isNotification
                        ? notificationText
                        : isOnline
                            ? 'THIS WILL END THE ONLINE MATCH FOR BOTH PLAYERS.'
                            : 'THIS WILL SAVE YOUR PROGRESS AND END THE GAME.'}
                </p>

                <div className="flex flex-col gap-3 mt-8 items-center">
                    {isNotification ? (
                        <button
                            onClick={onConfirm}
                            className="w-56 bg-[#ffb4ab] text-[#3b0000] font-headline text-[9px] py-4 uppercase
                                       hover:translate-y-0.5 transition-transform"
                            style={{ boxShadow: '2px 2px 0px #7a0000' }}
                        >
                            RETURN TO LOBBY
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onConfirm}
                                disabled={isSaving}
                                className="w-56 bg-[#ffb4ab] text-[#3b0000] font-headline text-[9px] py-4 uppercase
                                           hover:translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ boxShadow: '2px 2px 0px #7a0000' }}
                            >
                                {isSaving ? 'SAVING...' : 'SAVE & QUIT'}
                            </button>
                            <button
                                onClick={onCancel}
                                disabled={isSaving}
                                className="w-56 border-2 border-outline-variant text-[#879398] font-headline text-[9px] py-3 uppercase
                                           hover:border-primary-cyan hover:text-primary-cyan transition-all"
                            >
                                KEEP PLAYING
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbortModal;