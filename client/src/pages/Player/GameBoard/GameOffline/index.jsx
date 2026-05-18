import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";

// Sound
import { useAudio } from '@/hooks/useAudio';
import { AUDIO_FILES } from '@/config/audioConfig';

// Stores
import { useAuthStore } from "@/stores/auth/AuthStore";
import { useModeStore } from "@/stores/ai/ModeStore";
import { useCustomizationStore } from "@/stores/game/CustomizationStore";

// Services
import { getDifficultyLevels } from "@/pages/Player/GameCustomization/service/customization.service";

// Utils
import { getMarkerVariant } from "@/utils/markerRenderer";
import { getTheme } from "@/config/gameThemes.config";
import { useGame } from "./hook/useGame.hook";
import { useChatManager } from "./hook/useChatManager.hook";

// Components
import Footer from "@/components/reusable/Footer";
import AbortModal from "../GameShared/AbortModal";
import ScanLines from "@/components/reusable/custom/ScanLines";
import PlayerPanel from "../GameShared/PlayerPanel";
import BoardArea from "../GameShared/BoardArea";
import ParticleLayer from "../GameShared/ParticleLayer";
import WinOverlay from "../GameShared/WinOverlay";
import ChatOverlay from "./sub-components/ChatOverlay";

const GameBoard = () => {
  const navigate = useNavigate();
  // State for controlling the abort confirmation modal
  const [showAbortModal, setShowAbortModal] = useState(false);
  // State to control when the WinOverlay actually renders
  const [showWinOverlay, setShowWinOverlay] = useState(false);

  // Global state from stores
  const { user, isCheckingAuth } = useAuthStore();
  const { gameMode, aiDifficulty, player2Name, startingPlayer } = useModeStore();
  const {
    boardSize: displaySize,
    gridStyle,
    markerVariant,
    setMarkerVariant,
  } = useCustomizationStore();

  // Convert the string "10x10" or "15x15" from the store into an integer of 10 or 15.
  const initialBoardSize = useMemo(() => {
    return parseInt(displaySize.split("x")[0], 10) || 10;
  }, [displaySize]);

  // Get the marker variant data based on the selected variant
  const markerVariantData = useMemo(() => {
    return getMarkerVariant(markerVariant);
  }, [markerVariant]);

  // Get user avatar URL (fallback to undefined if not available)
  const userAvatarUrl = user?.avatar || user?.profileImage || undefined;

  const theme = getTheme(gridStyle);

  // Set title and player name
  const matchTitle =
    gameMode === "SINGLE_PLAYER"
      ? `VS AI — ${aiDifficulty}`
      : gameMode === "ONLINE_MATCH"
        ? "RANKED MATCH"
        : "LOCAL MULTIPLAYER";
  const isBotMatch = gameMode === "SINGLE_PLAYER";

  // Get AI name from difficulty level
  const getAIName = (difficulty) => {
    const difficulties = getDifficultyLevels();
    const difficultyObj = difficulties.find((d) => d.id === difficulty);
    return difficultyObj ? difficultyObj.aiName : "NEXUS-9";
  };

  const p2Name = isBotMatch
    ? getAIName(aiDifficulty)
    : gameMode === "ONLINE_MATCH"
      ? "OPPONENT"
      : player2Name?.trim() || "PLAYER_02";

  // Build player infor
  const playersInfo = useMemo(() => {
    const player1 = {
      userId: user?.id,
      usernameSnapshot: user?.username || user?.name || "PLAYER_01",
      role: "HUMAN",
      mark: "X",
    };

    let player2 = {
      userId: null,
      usernameSnapshot: p2Name,
      role: "HUMAN",
      mark: "O",
    };

    if (isBotMatch) {
      player2.role = "AI";
      player2.aiDifficulty = aiDifficulty;
    }

    return [player1, player2];
  }, [user, isBotMatch, p2Name, aiDifficulty]);

  // Call hook useGame
  const {
    board,
    boardSize,
    currentPlayer,
    winnerData,
    isDraw,
    isLocked,
    handleMove,
    resetGame,
    setBoardSize,
    abortGame,
    isAborting,
  } = useGame(gameMode, playersInfo, initialBoardSize, startingPlayer);

  // Audio hook
  const { play: playVictorySound } = useAudio(AUDIO_FILES.GAME_WIN);
  const { play: playLoseSound } = useAudio(AUDIO_FILES.GAME_LOSE);

  const gameOver = !!winnerData || isDraw;

  const userMark = "X";

  const isLocalMatch = gameMode === "TWO_PLAYERS" || gameMode === "LOCAL_MULTIPLAYER";

  const perspective = isDraw
    ? "draw"
    : winnerData
      ? isLocalMatch
        ? "local_result"
        : winnerData.player === userMark
          ? "winner"
          : "loser"
      : null;

  useEffect(() => {
      if (gameOver) {
        if (perspective === 'loser') {
            playLoseSound();
        } else if (perspective === 'winner' || perspective === 'local_result') {
            playVictorySound();
        }

        // Start the timer when the game ends
        const timer = setTimeout(() => {
          setShowWinOverlay(true);
        }, 4000); // 4000ms = 4 seconds delay

        // Cleanup function to prevent memory leaks if the user leaves early
        return () => clearTimeout(timer);
      }
    }, [gameOver, perspective, playVictorySound, playLoseSound]);

  // Chat manager hook for all chat state and bot behaviour
  const {
    messages,
    typingPlayer,
    chatOpen,
    unreadCount,
    isChatEnabled,
    sendMessage,
    setTyping,
    toggleChat,
  } = useChatManager(gameMode, "X", gameOver);

  const isAbortingRef = useRef(false); // prevent double-firing

  useEffect(() => {
    // Push a sentinel entry so the user has something to "go back" from,
    // which we can intercept before they actually leave /game/:roomId.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = async () => {
      if (gameOver) {
        // Game finished, allow normal navigation
        navigate(isBotMatch ? "/game-mode-select" : "/lobby");
        return;
      }

      if (isAbortingRef.current) return; // guard against double-fire
      isAbortingRef.current = true;

      // Re-push so the page stays put while aborting
      window.history.pushState(null, "", window.location.href);

      await abortGame();
      navigate("/profile");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [gameOver, abortGame, navigate, isBotMatch]);

  // Handling dropdown events in the board area
  const handleMarkerChange = (val) => {
    // Convert 'default' or 'custom_1' back to an integer to save to the Store.
    const newVariant =
      val === "default" ? 1 : parseInt(val.replace("custom_", ""), 10);
    setMarkerVariant(newVariant || 1);
  };

  const handleAbortConfirm = async () => {
    await abortGame();
    setShowAbortModal(false);
    navigate("/play");
  };

  const handleRestart = () => {
    // 1. Hide the WinOverlay immediately
    setShowWinOverlay(false); 
    
    // 2. Call the core reset logic from your useGame hook
    resetGame(); 
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen bg-deep-bg flex items-center justify-center font-headline text-primary-cyan">
        AUTHENTICATING...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-deep-bg text-[#e3e0f4] overflow-hidden relative">
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
        <PlayerPanel
          role="X"
          playerName={playersInfo[0].usernameSnapshot}
          isBot={false}
          isActive={currentPlayer === "X" && !gameOver}
          avatarUrl={userAvatarUrl}
          markerVariantData={markerVariantData}
          gameOver={gameOver}
        />

        <BoardArea
          markerVariant={markerVariant}
          gridStyle={gridStyle}
          theme={theme}
          board={board}
          boardSize={boardSize}
          matchTitle={matchTitle}
          winnerData={winnerData}
          isDraw={isDraw}
          isLocked={isLocked}
          onCellClick={handleMove}
          onReset={resetGame}
          onSizeChange={setBoardSize}
          onMarkerChange={handleMarkerChange}
        />

        {isChatEnabled && (
          <ChatOverlay
            isOpen={chatOpen}
            onClose={toggleChat}
            onToggle={toggleChat}
            messages={messages}
            typingPlayer={typingPlayer}
            playerMark="X"
            playerName={playersInfo[0].usernameSnapshot}
            opponentName={playersInfo[1].usernameSnapshot}
            onSend={sendMessage}
            onTyping={(isTyping) => setTyping("X", isTyping)}
            gameOver={gameOver}
            unreadCount={unreadCount}
          />
        )}

        <PlayerPanel
          role="O"
          playerName={playersInfo[1].usernameSnapshot}
          isBot={isBotMatch}
          isActive={currentPlayer === "O" && !gameOver}
          difficulty={isBotMatch ? aiDifficulty : undefined}
          markerVariantData={markerVariantData}
          gameOver={gameOver}
        />
      </main>

      {showWinOverlay && (
        <WinOverlay
          winnerData={winnerData}
          isDraw={isDraw}
          perspective={perspective}
          onRestart={handleRestart}
          onBackToLobby={() =>
            navigate(gameMode === "ONLINE_MATCH" ? "/lobby" : "/play")
          }
        />
      )}
      <AbortModal
        isOpen={showAbortModal}
        gameMode={gameMode}
        isSaving={isAborting}
        onConfirm={handleAbortConfirm}
        onCancel={() => setShowAbortModal(false)}
      />
      <Footer />
    </div>
  );
};
export default GameBoard;
