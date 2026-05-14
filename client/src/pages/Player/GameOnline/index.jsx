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
    // Root container: Ép chiều cao bằng màn hình, không cho scroll
    <div className="h-screen w-screen bg-background text-on-surface overflow-hidden relative flex flex-col">
      
      {/* 1. Các lớp hiệu ứng (Z-index thấp) */}
      <ScanLines /> 
      {/* Lớp phủ Pixel Grid: Để pointer-events-none để không chặn click chuột */}
      <div className="fixed inset-0 bg-[url('/assets/images/pixel-grid.png')] opacity-[0.03] pointer-events-none z-[1]" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-[2] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" aria-hidden="true" />

      {/* 2. Thanh điều hướng (Nằm trên cùng) */}
      <div className="relative z-50">
        <Navigation />
      </div>

      {/* 3. Nội dung chính: Dùng flex-1 để tự động lấp đầy phần còn lại */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {/* 4. ChatBox: Để absolute để không đẩy layout chính */}
      {(roomData?.status === 'READY' || roomData?.status === 'PLAYING') && (
        <div className="fixed bottom-6 right-6 z-40">
          <ChatBox
            roomId={roomData?.id}
            currentUserId={user?.id}
            currentUsername={user?.username}
          />
        </div>
      )}
    </div>
  );
} 