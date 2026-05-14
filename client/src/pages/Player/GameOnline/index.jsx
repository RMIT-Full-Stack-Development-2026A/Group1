import React from 'react';
import { useGameOnline } from './hook/useGameOnline.hook';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { LoadingScreen, ErrorScreen } from '@/components/common';
import { GameRoom, ChatBox } from './sub-components';
import Navigation from '@/components/reusable/Navigation';
import ScanLines from '@/components/reusable/custom/ScanLines';
import OnlineArena from '@/socket/OnlineArena';

export default function GameOnline() {
  const {
    roomData,
    isConnecting,
    isHydrated,
    error,
    disconnectCountdown,
    handleReady,
    handleLeaveRoom,
  } = useGameOnline();

  const { user } = useAuthStore();

  if (isConnecting) return <LoadingScreen message="CONNECTING TO ROOM..." />;
  if (error && !roomData) return <ErrorScreen message={error} />;

  const renderContent = () => {
    const status = roomData?.status;

    // Nếu chưa có roomData hoặc đang ở sảnh chờ
    if (!status || status === 'WAITING' || status === 'READY') {
      return (
        <GameRoom
          roomData={roomData}
          currentUserId={user?.id}
          onReady={handleReady}
          onLeave={handleLeaveRoom}
          disconnectCountdown={disconnectCountdown}
        />
      );
    }

    // Nếu đang trong trận đấu
    if (status === 'PLAYING') {
      if (!isHydrated) return <LoadingScreen message="PREPARING BOARD..." />;
      return <OnlineArena roomData={roomData} currentUserId={user?.id} />;
    }

    return null;
  };

  return (
    // 1. Root: Khóa cứng màn hình 100vh, không cho scroll
    <div className="h-screen w-screen bg-[#0d0d1a] text-on-surface overflow-hidden overscroll-none relative flex flex-col">

      {/* 2. Hiệu ứng nền (Luôn nằm dưới cùng - z thấp) */}
      <ScanLines />
      <div className="fixed inset-0 bg-[url('/assets/images/pixel-grid.png')] opacity-[0.03] pointer-events-none z-0" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-[1] shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" aria-hidden="true" />

      {/* 3. Navigation: Nằm trong luồng flex, chiều cao tự nhiên */}
      {roomData?.status !== 'PLAYING' && (
        <header className="relative z-50 flex-none">
          <Navigation />
        </header>
      )}

      {/* 4. Nội dung chính: flex-1 sẽ tự động chiếm toàn bộ phần còn lại của màn hình */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {/* 5. HUD Components: Dùng absolute/fixed để không làm xô lệch layout */}
      {(roomData?.status === 'READY' || roomData?.status === 'PLAYING') && (
        <ChatBox roomId={roomData?.id} currentUserId={user?.id} currentUsername={user?.username} />
      )}
    </div>
  );
} 