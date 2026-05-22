import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Stores
import { useSocketStore } from "@/stores/socket/SocketStore";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useCustomizationStore } from "@/stores/game/CustomizationStore";

// Audio
import { useAudio } from "@/hooks/useAudio";
import { AUDIO_FILES } from "@/config/audioConfig";

// Utils
import { getMarkerVariant } from "@/utils/markerRenderer";

// Components
import AbortModal from "../../GameShared/AbortModal";
import PlayerPanel from "../../GameShared/PlayerPanel";
import BoardArea from "../../GameShared/BoardArea";
import WinOverlay from "../../GameShared/WinOverlay";
import ParticleLayer from "../../GameShared/ParticleLayer";
import { getTheme } from "@/config/gameThemes.config.js";

const OnlineGameBoard = ({ roomData, currentUserId, completedMatch, onPlayAgain }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { user, isCheckingAuth } = useAuthStore();
  const { socket, isConnected, connectSocket } = useSocketStore();
  const { setMarkerVariant } = useCustomizationStore();

  const GRID_STYLES_MAP = {
    JUNGLE: "jungle",
    DARK: "dark",
    LAVA: "lava", 
  };
  
  const boardStyleKey = roomData?.boardStyle || "NEON";
  const mappedStyle = GRID_STYLES_MAP[boardStyleKey] || "neon";
  const theme = getTheme(mappedStyle);

  const MARKER_VARIANTS_MAP = {
    CLASSIC: 1,
    GLOW: 2,
    SKETCH: 3,
    STONE: 4,
    PIXEL: 5,
    MINIMAL: 6,
  };
  
  const markerStyleKey = roomData?.markerStyle || "PIXEL";

  const mappedMarkerVariant = MARKER_VARIANTS_MAP[markerStyleKey] || 1; 

  const boardSize = roomData?.boardSize || 10;

  const player1 = roomData?.participants?.[0] || {
    usernameSnapshot: "WAITING...",
    mark: "X",
  };
  
  const player2 = roomData?.participants?.[1] || {
    usernameSnapshot: "WAITING FOR OPPONENT...",
    mark: "O",
  };

  const player1MarkerStyle = player1?.markerStyle || roomData?.markerStyle || "CLASSIC";
  const player2MarkerStyle = player2?.markerStyle || roomData?.markerStyle || "CLASSIC";

  const [board, setBoard] = useState(() => {
    return Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  });

  const [currentPlayerMark, setCurrentPlayerMark] = useState(() => {
    const turnIndex = roomData?.currentTurnParticipantIndex || 0;
    return roomData?.participants?.[turnIndex]?.mark || "X";
  });

  const [winnerData, setWinnerData] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showAbortNotification, setShowAbortNotification] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState(null);
  const [reconnectFlash, setReconnectFlash] = useState(false);

  // STATE FOR OVERLAY DELAY
  const [showWinOverlay, setShowWinOverlay] = useState(false);

  // AUDIO HOOKS
  const { play: playVictorySound } = useAudio(AUDIO_FILES.GAME_WIN);
  const { play: playLoseSound } = useAudio(AUDIO_FILES.GAME_LOSE);

  const didInitiateAbortRef = useRef(false);
  const matchEndedRef = useRef(false);

  const resolvedOutcome = useMemo(() => {
    if (completedMatch?.result === 'DRAW') {
      return { winnerData: null, isDraw: true };
    }

    if (completedMatch?.result === 'WIN') {
      const winningCells = Array.isArray(completedMatch.winningLine)
        ? completedMatch.winningLine.map((cell) => [cell.row, cell.col])
        : [];

      const winner = roomData?.participants?.find(p => p.userId === completedMatch.winnerUserId);
      const mark = winner?.mark || 'X';

      return {
        winnerData: { player: mark, cells: winningCells },
        isDraw: false,
      };
    }

    return {
      winnerData,
      isDraw,
    };
  }, [completedMatch, roomData?.participants, winnerData, isDraw]);

  const userMark =
    roomData?.participants?.find((p) => p.userId === currentUserId)?.mark ||
    "X";

  const winnerDataToShow = resolvedOutcome.winnerData;
  const isDrawToShow = resolvedOutcome.isDraw;

  const perspective = isDrawToShow
    ? "draw"
    : winnerDataToShow
      ? currentUserId === completedMatch.winnerUserId
        ? "winner"
        : "loser"
      : null;
  const gameOver = !!winnerDataToShow || isDrawToShow;

  useEffect(() => {
    if (gameOver) {
      // Play sound immediately
      if (perspective === 'loser') {
        console.log(completedMatch)
        playLoseSound();
      } else if (perspective === 'winner') {
        console.log(completedMatch)
        playVictorySound();
      }

      // Wait 4s before showing the overlay
      const timer = setTimeout(() => {
        setShowWinOverlay(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
    
  }, [gameOver, perspective, playVictorySound, playLoseSound, completedMatch]);

  useEffect(() => {
    if (completedMatch?.result === 'DRAW' || completedMatch?.result === 'WIN') {
      matchEndedRef.current = true;
    } else if (!completedMatch) {
      matchEndedRef.current = false;
    }
  }, [completedMatch]);

  // Reset abort initiator state when entering a new room
  useEffect(() => {
    didInitiateAbortRef.current = false;
  }, [roomId]);

  const player1MarkerVariantData = useMemo(
    () => getMarkerVariant(player1MarkerStyle),
    [player1MarkerStyle],
  );
  const player2MarkerVariantData = useMemo(
    () => getMarkerVariant(player2MarkerStyle),
    [player2MarkerStyle],
  );

  const userAvatarUrl = user?.avatar || user?.profileImage || undefined;

  // --- TIMEOUT EFFECT FOR DISCONNECTED OPPONENT ---
  useEffect(() => {
    let timer;
    if (disconnectCountdown !== null && disconnectCountdown > 0) {
      timer = setInterval(() => {
        setDisconnectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (disconnectCountdown === 0) {
      // Show the "MATCH ABORTED" state for 1.5s before redirecting
      timer = setTimeout(() => navigate("/lobby"), 1500);
    }
    return () => clearInterval(timer);
  }, [disconnectCountdown, navigate]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !isConnected) connectSocket();

    const handleAccountDeactivated = () => {
      setShowAbortModal(false);
      navigate("/lobby", { replace: true });
    };
    window.addEventListener("account:deactivated", handleAccountDeactivated);

    const handleGameState = (payload) => {
      

      if (payload.board && Array.isArray(payload.board)) {
        // Create a new empty board
        const reconstructedBoard = Array.from({ length: boardSize }, () =>
          Array(boardSize).fill(null),
        );

        // Get move history from BE, translate to X/O, and apply to the empty board
        payload.board.forEach((move) => {
          // Extract the marker (X or O) based on the participant index
          const mark = roomData?.participants?.[move.byParticipantIndex]?.mark;

          // If coordinates are valid, fill the 2D array
          if (mark && move.row !== undefined && move.col !== undefined) {
            reconstructedBoard[move.row][move.col] = mark;
          }
        });

        // Update UI
        setBoard(reconstructedBoard);
      }

      // Update the next turn
      const turnIndex =
        payload.currentTurnParticipantIndex !== undefined
          ? payload.currentTurnParticipantIndex
          : 0;
      setCurrentPlayerMark(roomData?.participants?.[turnIndex]?.mark || "X");
    };

    const handleGameEnded = (payload) => {
      if (payload.result === "DRAW") {
        matchEndedRef.current = true;
        setIsDraw(true);
        setWinnerData(null);

      } else if (payload.result === "WIN") {
        matchEndedRef.current = true;
        const winningCells = payload.winningLine?.map((cell) => [cell.row, cell.col]) || [];
        const winner = roomData?.participants?.find(p => p.userId === payload.winnerUserId);
        const mark = winner?.mark || "X";
        setWinnerData({ player: mark, cells: winningCells });
        setIsDraw(false);

      } else if (payload.result === "ABORTED") {
        if (didInitiateAbortRef.current) {
          navigate('/lobby');
          return;
        }
        setShowAbortModal(false);
        setShowAbortNotification(true);
      }
    };

    socket.on("game:state", handleGameState);
    socket.on("game:ended", handleGameEnded);

    // 3. Handle network disconnection (Newly added from Contract)
    const handlePlayerDisconnected = (payload) => {
      setDisconnectCountdown(payload.timeLeft ?? 60);
    };

    const handlePlayerReconnected = () => {
      setReconnectFlash(true);
      setDisconnectCountdown(null);
      setTimeout(() => setReconnectFlash(false), 2000);
    };

    socket.on("player:disconnected", handlePlayerDisconnected);
    socket.on("player:reconnected", handlePlayerReconnected);

    const handleRoomRemoved = () => {
      if (didInitiateAbortRef.current) {
        navigate('/lobby');
        return;
      }

      if (matchEndedRef.current) return;
      // Only show notification if game:ended didn't already trigger it
      setShowAbortModal(false);
      setShowAbortNotification(true);
    };

    socket.on("room:removed", handleRoomRemoved);

    return () => {
      socket.off("game:state", handleGameState);
      socket.off("game:ended", handleGameEnded);
      socket.off("player:disconnected", handlePlayerDisconnected);
      socket.off("player:reconnected", handlePlayerReconnected);
      socket.off("room:removed", handleRoomRemoved);
      window.removeEventListener(
        "account:deactivated",
        handleAccountDeactivated,
      );
    };
  }, [socket, isConnected, navigate, roomData, boardSize, connectSocket]);

  const handleCellClick = (rowIndex, colIndex) => {
    if (winnerData || isDraw || roomData?.status !== "PLAYING") return;

    // Check if it's the current user's turn
    if (currentPlayerMark !== userMark) return;

    socket.emit("game:move", {
      roomId: roomData?.id || roomId,
      row: rowIndex,
      col: colIndex,
    });
  };

  const handleAbortConfirm = () => {
    didInitiateAbortRef.current = true;
    // Explicit player-initiated abort — bypasses grace period on the backend.
    socket.emit('room:leave', {
        roomId: roomData?.id || roomId,
        intent: 'abort',
    });
    setShowAbortModal(false);
  };

  const handleMarkerChange = (val) => {
    const newVariant =
      val === "default" ? 1 : parseInt(val.replace("custom_", ""), 10);
    setMarkerVariant(newVariant || 1);
  };

  const handlePlayAgain = () => {
    // Hide the overlay immediately
    setShowWinOverlay(false);
    setWinnerData(null);
    setIsDraw(false);
    // Call the original prop function
    if (onPlayAgain) onPlayAgain();
  };

  if (isCheckingAuth || !isConnected) {
    return (
      <div className="h-screen bg-deep-bg flex items-center justify-center font-headline text-primary-cyan">
        CONNECTING TO SERVER...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-deep-bg text-[#e3e0f4] overflow-hidden overscroll-none relative">
      {theme.bgImage && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${theme.bgImage})`,
            backgroundSize: theme.bgSize,
            backgroundRepeat: theme.bgRepeat,
            backgroundPosition: "center",
            opacity: theme.bgOpacity,
            filter: "saturate(1.0) brightness(1.2)",
          }}
        />
      )}

      <ParticleLayer theme={theme} className="z-10" />

      <div
        className="fixed inset-0 scanlines z-2 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pixel-grid z-1 pointer-events-none"
        aria-hidden="true"
      />

      <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-auto md:overflow-hidden px-4 md:px-6 gap-4 md:gap-6 items-center justify-start md:justify-center font-mono max-w-350 w-full mx-auto">
        {/* Grace-Period Overlay — shown when opponent disconnected */}
        {disconnectCountdown !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className={`border-2 ${disconnectCountdown === 0 ? 'border-[#555]' : 'border-[#ff3d00]'} bg-[#1a0a0a] px-8 py-6 max-w-sm w-full text-center shadow-[0_0_40px_rgba(255,61,0,0.4)]`}>
                    <p className="font-headline text-[10px] text-[#ff3d00] uppercase tracking-widest mb-2">
                        {disconnectCountdown === 0 ? 'MATCH ABORTED' : 'CONNECTION LOST'}
                    </p>
                    <p className="font-mono text-[#e3e0f4] text-sm mb-4">
                        {disconnectCountdown === 0
                            ? 'Opponent did not return in time.'
                            : 'Opponent disconnected. Waiting for them to return...'}
                    </p>
                    {disconnectCountdown > 0 && (
                        <div className="font-headline text-5xl text-[#ff3d00] tabular-nums mb-4">
                            {disconnectCountdown}
                        </div>
                    )}
                    <p className="font-mono text-[10px] text-outline uppercase tracking-widest">
                        {disconnectCountdown === 0
                            ? 'RETURNING TO LOBBY...'
                            : disconnectCountdown <= 10
                                ? 'ABORTING SOON...'
                                : 'MATCH WILL ABORT IF THEY DO NOT RETURN'}
                    </p>
                </div>
            </div>
        )}

        {/* Reconnect flash — shown briefly after opponent returns */}
        {reconnectFlash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-[#00e5ff] bg-[#001a1f] px-8 py-4 text-center shadow-[0_0_40px_rgba(0,229,255,0.4)]">
              <p className="font-headline text-[10px] text-[#00e5ff] uppercase tracking-widest">
                OPPONENT RECONNECTED
              </p>
            </div>
          </div>
        )}

        {!gameOver && (
          <div className="fixed top-20 right-6 z-50">
            <button
              onClick={() => setShowAbortModal(true)}
              className="border-3 border-[#b82b1a] text-[#ffff] font-headline text-[8px] px-4 py-2 uppercase bg-[#b82b1a]
                       hover:text-[#b82b1a] hover:bg-[#ffff] transition-all cursor-pointer"
            >
              ABORT
            </button>
          </div>
        )}

        <div className="flex w-full flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          <PlayerPanel
            role={player1.mark}
            playerName={player1.usernameSnapshot}
            isBot={false}
            isActive={
              currentPlayerMark === player1.mark &&
              !gameOver &&
              roomData?.status === "PLAYING"
            }
            avatarUrl={
              currentUserId === player1.userId
                ? userAvatarUrl
                : roomData?.participants?.[0]?.avatarSnapshot || roomData?.participants?.[0]?.avatar || undefined
            }
            markerVariantData={player1MarkerVariantData}
          />
          <BoardArea
            p1MarkerVariant={player1MarkerStyle}
            p2MarkerVariant={player2MarkerStyle}
            player1Mark={player1.mark}
            player2Mark={player2.mark}
            markerVariant={mappedMarkerVariant}
            gridStyle={mappedStyle}
            board={board}
            theme={theme}
            boardSize={boardSize}
            matchTitle={`ROOM: ${roomData?.roomNumber || "CONNECTING..."}`}
            winnerData={winnerData}
            isDraw={isDraw}
            isLocked={
              roomData?.status !== "PLAYING" ||
              currentPlayerMark !== userMark ||
              disconnectCountdown !== null
            }
            onCellClick={handleCellClick}
            onMarkerChange={handleMarkerChange}
          />

          <PlayerPanel
            role={player2.mark}
            playerName={player2.usernameSnapshot}
            isBot={false}
            isActive={
              currentPlayerMark === player2.mark &&
              !gameOver &&
              roomData?.status === "PLAYING"
            }
            avatarUrl={
              currentUserId === player2.userId
                ? userAvatarUrl
                : roomData?.participants?.[1]?.avatarSnapshot || roomData?.participants?.[1]?.avatar || undefined
            }
            markerVariantData={player2MarkerVariantData}
          />
        </div>
      </main>

      {showWinOverlay && (
        <WinOverlay
          winnerData={winnerDataToShow}
          isDraw={isDrawToShow}
          perspective={perspective}
          onRestart={handlePlayAgain}
          onBackToLobby={() => navigate("/lobby")}
        />
      )}

      <AbortModal
        isOpen={showAbortModal || showAbortNotification}
        isNotification={showAbortNotification}
        gameMode="ONLINE_MATCH"
        isSaving={false}
        onConfirm={showAbortNotification ? () => navigate('/lobby') : handleAbortConfirm}
        onCancel={showAbortNotification ? () => navigate('/lobby') : () => setShowAbortModal(false)}
      />
    </div>
  );
};

export default OnlineGameBoard;
