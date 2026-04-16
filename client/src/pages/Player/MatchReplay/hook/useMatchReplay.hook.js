import { useEffect, useMemo, useState } from 'react';
import { matchReplayService } from '../service/matchReplay.service';

const normalizeGameId = (value) => {
    if (!value) return '';

    const trimmed = String(value).trim();
    const withoutPrefix = trimmed.replace(/^gameId=/i, '');

    return withoutPrefix.includes('=') ? withoutPrefix.split('=').pop() : withoutPrefix;
};

const clampStep = (step, totalMoves) => {
    const numeric = Number(step);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(totalMoves, Math.round(numeric)));
};

export const useMatchReplay = (gameId, isUserPremium) => {
    const [sessionData, setSessionData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const cleanGameId = normalizeGameId(gameId);
    const totalMoves = sessionData?.moves?.length ?? 0;

    useEffect(() => {
        let isMounted = true;

        const fetchReplay = async () => {
            setIsPlaying(false);
            setCurrentStep(0);
            setSessionData(null);

            if (!cleanGameId) {
                setErrorMessage('Invalid game ID.');
                setIsLoading(false);
                return;
            }

            if (!isUserPremium) {
                setErrorMessage('You need a Premium subscription to view replays.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMessage('');

            try {
                const response = await matchReplayService.getReplayById(cleanGameId);
                const raw = response?.data ?? response;
                const participants = Array.isArray(raw?.participants) ? raw.participants : [];
                const rawMoves = Array.isArray(raw?.moves) ? raw.moves : [];

                const mappedSession = {
                    ...raw,
                    playerX: participants.find((participant) => participant.mark === 'X') ?? {},
                    playerO: participants.find((participant) => participant.mark === 'O') ?? {},
                    moves: rawMoves.map((move) => ({
                        ...move,
                        mark: participants[move.byParticipantIndex]?.mark ?? 'X'
                    })),
                    winner:
                        raw?.winnerParticipantIndex != null
                            ? participants[raw.winnerParticipantIndex] ?? null
                            : null
                };

                if (!isMounted) return;
                setSessionData(mappedSession);
                setCurrentStep(0);
            } catch (err) {
                if (!isMounted) return;

                if (err?.status === 403) {
                    setErrorMessage('You are not authorized to view this replay.');
                } else if (err?.status === 404) {
                    setErrorMessage('Game session not found.');
                } else {
                    setErrorMessage(err?.message || 'Failed to load replay.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchReplay();

        return () => {
            isMounted = false;
        };
    }, [cleanGameId, isUserPremium]);

    useEffect(() => {
        if (!isPlaying || !sessionData || currentStep >= totalMoves) {
            if (currentStep >= totalMoves) {
                setIsPlaying(false);
            }
            return undefined;
        }

        const interval = setInterval(() => {
            setCurrentStep((previousStep) => {
                const nextStep = Math.min(totalMoves, previousStep + 1);
                if (nextStep >= totalMoves) {
                    setIsPlaying(false);
                }
                return nextStep;
            });
        }, 1000 / speed);

        return () => clearInterval(interval);
    }, [isPlaying, currentStep, sessionData, speed, totalMoves]);

    const boardState = useMemo(() => {
        if (!sessionData) return [];

        const size = sessionData.boardSize;
        const board = Array.from({ length: size }, () => Array(size).fill(null));
        const isAtEnd = currentStep === sessionData.moves.length;
        const winSet = new Set((sessionData.winningLine || []).map((winningCell) => `${winningCell.row},${winningCell.col}`));

        sessionData.moves.slice(0, currentStep).forEach((move, index) => {
            board[move.row][move.col] = {
                mark: move.mark,
                stepIndex: move.moveNumber,
                isLatest: index === currentStep - 1,
                isWinning: isAtEnd && winSet.has(`${move.row},${move.col}`)
            };
        });

        return board;
    }, [sessionData, currentStep]);

    const moveLog = useMemo(() => {
        if (!sessionData?.moves?.length) return [];

        const rounds = [];

        for (let index = 0; index < sessionData.moves.length; index += 2) {
            rounds.push({
                round: Math.floor(index / 2) + 1,
                xMove: sessionData.moves[index] ?? null,
                oMove: sessionData.moves[index + 1] ?? null
            });
        }

        return rounds;
    }, [sessionData]);

    const controls = {
        play: () => {
            if (currentStep < totalMoves) {
                setIsPlaying(true);
            }
        },
        pause: () => setIsPlaying(false),
        next: () => setCurrentStep((step) => Math.min(totalMoves, step + 1)),
        prev: () => setCurrentStep((step) => Math.max(0, step - 1)),
        first: () => {
            setIsPlaying(false);
            setCurrentStep(0);
        },
        last: () => {
            setIsPlaying(false);
            setCurrentStep(totalMoves);
        },
        jump: (step) => {
            setIsPlaying(false);
            setCurrentStep(clampStep(step, totalMoves));
        },
        setSpeed: (value) => {
            if ([1, 2, 4].includes(value)) {
                setPlaybackSpeed(value);
            }
        }
    };

    return {
        sessionData,
        boardState,
        moveLog,
        currentStep,
        isPlaying,
        speed,
        isLoading,
        errorMessage,
        controls
    };
};