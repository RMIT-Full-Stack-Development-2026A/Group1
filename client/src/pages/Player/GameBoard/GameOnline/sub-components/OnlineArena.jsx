import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Stores
import { useSocketStore } from "@/stores/socket/SocketStore";
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useCustomizationStore } from "@/stores/game/CustomizationStore";

// Utils
import { getMarkerVariant } from "@/utils/markerRenderer";

// Components
import AbortModal from "../../GameShared/AbortModal";
import PlayerPanel from "../../GameShared/PlayerPanel";
import BoardArea from "../../GameShared/BoardArea";
import WinOverlay from "../../GameShared/WinOverlay";
import ParticleLayer from "../../GameShared/ParticleLayer";
import { getTheme } from "@/config/gameThemes.config.js";

const OnlineGameBoard = ({ roomData, currentUserId }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { user, isCheckingAuth } = useAuthStore();
  const { socket, isConnected, connectSocket } = useSocketStore();
  const { setMarkerVariant } = useCustomizationStore();

  const rawMap = {
    CLASSIC: "classic",
    DARK: "neon",
    NEON: "neon",
    BLOCK: "block",
  };
  const boardStyleKey = roomData?.boardStyle || "NEON";
  const mappedStyle = rawMap[boardStyleKey] || boardStyleKey.toLowerCase();
  const theme = getTheme(mappedStyle);

  const markerVariant = roomData?.markerStyle || "PIXEL";
  const boardSize = roomData?.boardSize || 10;

  // Convert the numeric/string markerVariant to its display style
  const activeMarkerStyle =
    typeof markerVariant === "number"
      ? markerVariant === 1
        ? "default"
        : `custom_${markerVariant}`
      : markerVariant;

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
  const [disconnectCountdown, setDisconnectCountdown] = useState(null);

  const markerVariantData = useMemo(
    () => getMarkerVariant(markerVariant),
    [markerVariant],
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
      // If 60s pass and opponent hasn't returned, kick back to lobby
      navigate("/lobby");
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

    // 1. Listen for board updates
    socket.on("game:state", (payload) => {
      console.log("[game:state] Payload from BE:", payload);

      if (payload.board && Array.isArray(payload.board)) {
        // Step A: Create a completely new empty board
        const reconstructedBoard = Array.from({ length: boardSize }, () =>
          Array(boardSize).fill(null),
        );

        // Step B: Get move history from BE, translate to X/O, and apply to the empty board
        payload.board.forEach((move) => {
          // Extract the marker (X or O) based on the participant index
          const mark = roomData?.participants?.[move.byParticipantIndex]?.mark;

          // If coordinates are valid, fill the 2D array
          if (mark && move.row !== undefined && move.col !== undefined) {
            reconstructedBoard[move.row][move.col] = mark;
          }
        });

        // Step C: Update UI
        setBoard(reconstructedBoard);
      }

      // Update the next turn
      const turnIndex =
        payload.currentTurnParticipantIndex !== undefined
          ? payload.currentTurnParticipantIndex
          : 0;
      setCurrentPlayerMark(roomData?.participants?.[turnIndex]?.mark || "X");
    });

    // 2. Listen for game end (Updated per NEW Contract)
    socket.on("game:ended", (payload) => {
      if (payload.result === "DRAW") {
        setIsDraw(true);
      } else if (payload.result === "WIN") {
        // Use winningLine instead of winLine
        const winningCells =
          payload.winningLine?.map((cell) => [cell.row, cell.col]) || [];
        // Use winnerParticipantIndex instead of winner
        const mark =
          roomData?.participants?.[payload.winnerParticipantIndex]?.mark || "X";
        setWinnerData({ player: mark, cells: winningCells });
      } else if (payload.result === "ABORTED") {
        navigate("/lobby");
      }
    });

    // 3. Handle network disconnection (Newly added from Contract)
    socket.on("player:disconnected", (payload) => {
      setDisconnectCountdown(payload.timeLeft || 60);
    });

    socket.on("player:reconnected", () => {
      setDisconnectCountdown(null); // Clear countdown, resume game
    });

    socket.on("room:removed", () => {
      navigate("/lobby");
    });

    return () => {
      socket.off("game:state");
      socket.off("game:ended");
      socket.off("player:disconnected");
      socket.off("player:reconnected");
      socket.off("room:removed");
      window.removeEventListener(
        "account:deactivated",
        handleAccountDeactivated,
      );
    };
  }, [socket, isConnected, navigate, roomData, boardSize, connectSocket]);

  const handleCellClick = (rowIndex, colIndex) => {
    if (winnerData || isDraw || roomData?.status !== "PLAYING") return;

    socket.emit("game:move", {
      roomId: roomData?.id || roomId,
      row: rowIndex,
      col: colIndex,
    });
  };

  const handleAbortConfirm = () => {
    socket.emit("room:leave", { roomId: roomData?.id || roomId });
    setShowAbortModal(false);
    navigate("/lobby");
  };

  const handleMarkerChange = (val) => {
    const newVariant =
      val === "default" ? 1 : parseInt(val.replace("custom_", ""), 10);
    setMarkerVariant(newVariant || 1);
  };

  const player1 = roomData?.participants?.[0] || {
    usernameSnapshot: "WAITING...",
    mark: "X",
  };
  const player2 = roomData?.participants?.[1] || {
    usernameSnapshot: "WAITING FOR OPPONENT...",
    mark: "O",
  };
  const userMark =
    roomData?.participants?.find((p) => p.userId === currentUserId)?.mark ||
    "X";
  const perspective = isDraw
    ? "draw"
    : winnerData
      ? winnerData.player === userMark
        ? "winner"
        : "loser"
      : null;
  const gameOver = !!winnerData || isDraw;

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
        className="fixed inset-0 scanlines z-[2] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pixel-grid z-[1] pointer-events-none"
        aria-hidden="true"
      />

      <main className="relative z-10 flex-1 flex overflow-hidden px-6 gap-6 items-center justify-center font-mono max-w-[1400px] w-full mx-auto">
        {/* --- SHOW WARNING IF OPPONENT DISCONNECTS --- */}
        {disconnectCountdown !== null && (
          <div className="z-50 border border-[#ff3d00] bg-[#ff3d00]/20 px-6 py-2 text-center w-full max-w-[600px] rounded animate-pulse">
            <p className="font-headline text-[10px] text-[#ff3d00] uppercase tracking-widest">
              OPPONENT DISCONNECTED — WAITING {disconnectCountdown}S TO ABORT
            </p>
          </div>
        )}

        {!gameOver && (
          <div className="fixed top-20 right-6 z-50">
            <button
              onClick={() => setShowAbortModal(true)}
              className="border-2 border-[#ffb4ab] text-[#ffb4ab] font-headline text-[8px] px-4 py-2 uppercase hover:bg-[#ffb4ab]/10 transition-all cursor-pointer"
            >
              ABORT
            </button>
          </div>
        )}

        <div className="flex w-full items-center justify-center gap-6">
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
              currentUserId === player1.userId ? userAvatarUrl : undefined
            }
            markerVariantData={markerVariantData}
          />

          <BoardArea
            markerVariant={activeMarkerStyle}
            gridStyle={mappedStyle}
            board={board}
            boardSize={boardSize}
            matchTitle={`ROOM: ${roomData?.roomNumber || "CONNECTING..."}`}
            winnerData={winnerData}
            isDraw={isDraw}
            isLocked={
              roomData?.status !== "PLAYING" || currentPlayerMark !== userMark
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
            markerVariantData={markerVariantData}
          />
        </div>
      </main>

      {gameOver && (
        <WinOverlay
          winnerData={winnerData}
          isDraw={isDraw}
          perspective={perspective}
          onRestart={() => navigate("/lobby")}
          onBackToLobby={() => navigate("/lobby")}
        />
      )}

      <AbortModal
        isOpen={showAbortModal}
        gameMode="ONLINE_MATCH"
        isSaving={false}
        onConfirm={handleAbortConfirm}
        onCancel={() => setShowAbortModal(false)}
      />
    </div>
  );
};

export default OnlineGameBoard;
