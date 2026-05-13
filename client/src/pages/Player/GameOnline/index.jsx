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

    if (status === 'PLAYING') {
      if (!isHydrated) return <LoadingScreen message="PREPARING BOARD..." />;
      return <OnlineArena roomData={roomData} currentUserId={user?.id} />;
    }

    return null;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      <ScanLines />
      <Navigation />
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
      </main>

      {(roomData?.status === 'READY' || roomData?.status === 'PLAYING') && (
        <ChatBox
          roomId={roomData?.id}
          currentUserId={user?.id}
          currentUsername={user?.username}
        />
      )}
    </div>
  );
}
