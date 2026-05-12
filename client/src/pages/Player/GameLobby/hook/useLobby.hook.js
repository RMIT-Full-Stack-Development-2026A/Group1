/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect } from "react";
import { useSocketStore } from "@/stores/socket/SocketStore";
import { LobbyService } from "../service/lobby.service";

export const useLobby = () => {
    const [rooms, setRooms] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);
    const socket = useSocketStore((state) => state.socket);
    const isConnected = useSocketStore((state) => state.isConnected);

    // Initialize lobby data from backend
    useEffect(() => {
        const initializeLobby = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);
                
                console.log('[useLobby] Initializing lobby data...');
                
                // Fetch all data in parallel
                const [roomsData, activityData] = await Promise.all([
                    LobbyService.getRooms(),
                    LobbyService.getRecentActivity(),
                ]);

                console.log('[useLobby] Data fetched:', {
                    roomsData,
                    activityData,
                });

                // Check if we're using mock data
                const isMockData = roomsData === LobbyService._getMockRooms() || 
                                   (Array.isArray(roomsData) && roomsData[0]?.roomNumber === 42);
                setUsingMockData(isMockData);

                setRooms(roomsData || []);
                setRecentActivity(activityData || []);
                setOnlineCount(LobbyService.getOnlineCount(roomsData || []));
                
                console.log('[useLobby] Lobby initialized:', {
                    roomsCount: (roomsData || []).length,
                    activityCount: (activityData || []).length,
                    usingMock: isMockData,
                });
            } catch (err) {
                console.error("[useLobby] Failed to load lobby data:", err);
                setError(err.message || "Failed to load lobby data");
                setRooms([]);
                setRecentActivity([]);
                setUsingMockData(true);
            } finally {
                setLoading(false);
            }
        };

        initializeLobby();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoomUpdated = ({ room } = {}) => {
            if (!room) return;

            const normalizedRoom = LobbyService.normalizeRoom(room);
            setRooms((prevRooms) => {
                const currentRooms = Array.isArray(prevRooms) ? prevRooms : [];

                if (normalizedRoom.status !== 'waiting') {
                    const filteredRooms = currentRooms.filter((existingRoom) => existingRoom.id !== normalizedRoom.id);
                    setOnlineCount(LobbyService.getOnlineCount(filteredRooms));
                    return filteredRooms;
                }

                const existingIndex = currentRooms.findIndex((existingRoom) => existingRoom.id === normalizedRoom.id);
                const nextRooms = existingIndex === -1
                    ? [normalizedRoom, ...currentRooms]
                    : currentRooms.map((existingRoom) => (
                        existingRoom.id === normalizedRoom.id ? { ...existingRoom, ...normalizedRoom } : existingRoom
                    ));

                setOnlineCount(LobbyService.getOnlineCount(nextRooms));
                return nextRooms;
            });
        };

        const handleRoomRemoved = ({ roomId } = {}) => {
            if (!roomId) return;

            setRooms((prevRooms) => {
                const nextRooms = (Array.isArray(prevRooms) ? prevRooms : []).filter((room) => room.id !== roomId);
                setOnlineCount(LobbyService.getOnlineCount(nextRooms));
                return nextRooms;
            });
        };

        socket.on('room:updated', handleRoomUpdated);
        socket.on('room:removed', handleRoomRemoved);

        return () => {
            socket.off('room:updated', handleRoomUpdated);
            socket.off('room:removed', handleRoomRemoved);
        };
    }, [socket, isConnected]);

    // Get available rooms (filter by status)
    const availableRooms = LobbyService.getAvailableRooms(rooms);

    // Refresh lobby data manually
    const refreshLobby = async () => {
        try {
            setLoading(true);
            const [roomsData, activityData] = await Promise.all([
                LobbyService.getRooms(),
                LobbyService.getRecentActivity(),
            ]);

            setRooms(roomsData);
            setRecentActivity(activityData);
            setOnlineCount(LobbyService.getOnlineCount(roomsData));
            setError(null);
        } catch (err) {
            console.error("[useLobby] Failed to refresh lobby:", err);
            setError(err.message || "Failed to refresh lobby");
        } finally {
            setLoading(false);
        }
    };

    return {
        rooms,
        recentActivity,
        onlineCount,
        availableRooms,
        loading,
        error,
        usingMockData,
        refreshLobby,
    };
};
