/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect } from "react";
import { useSocketStore } from "@/stores/socket/SocketStore";
import { LobbyService } from "../service/lobby.service";

export const useLobby = ({ page = 1, limit = 5, waitingOnly = false } = {}) => {
    const [rooms, setRooms] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);
    const [pagination, setPagination] = useState({ page, limit, total: 0 });
    const socket = useSocketStore((state) => state.socket);
    const isConnected = useSocketStore((state) => state.isConnected);

    const loadLobbyData = async () => {
        const roomsData = await LobbyService.getRooms({
            page,
            limit,
            status: waitingOnly ? 'WAITING' : undefined,
        });

        const activityData = await LobbyService.getRecentActivity();

        const normalizedRooms = roomsData?.items || [];

        const isMockData = roomsData?.total === LobbyService._getMockRooms().length ||
                           (Array.isArray(normalizedRooms) && normalizedRooms[0]?.roomNumber === 42);

        setUsingMockData(isMockData);
        setRooms(normalizedRooms);
        setRecentActivity(activityData || []);
        setOnlineCount(roomsData?.total ?? normalizedRooms.length ?? 0);
        setPagination({
            page: roomsData?.page ?? page,
            limit: roomsData?.limit ?? limit,
            total: roomsData?.total ?? normalizedRooms.length ?? 0,
        });
    };

    // Initialize lobby data from backend
    useEffect(() => {
        const initializeLobby = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);
                
                console.log('[useLobby] Initializing lobby data...');

                await loadLobbyData();
                
                console.log('[useLobby] Lobby initialized:', {
                    page,
                    limit,
                    waitingOnly,
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
    }, [page, limit, waitingOnly]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoomUpdated = ({ room } = {}) => {
            if (!room) return;

            const normalizedRoom = LobbyService.normalizeRoom(room);
            setRooms((prevRooms) => {
                const currentRooms = Array.isArray(prevRooms) ? prevRooms : [];

                const ACTIVE_LOBBY_STATUSES = ['waiting', 'ready', 'playing'];
                if (!ACTIVE_LOBBY_STATUSES.includes(normalizedRoom.status)) {
                    // Terminal status (aborted, closed) — remove from list
                    const filteredRooms = currentRooms.filter((r) => r.id !== normalizedRoom.id);
                    setOnlineCount((prev) => Math.max(0, prev - 1));
                    return filteredRooms;
                }

                const existingIndex = currentRooms.findIndex((existingRoom) => existingRoom.id === normalizedRoom.id);
                const nextRooms = existingIndex === -1
                    ? [normalizedRoom, ...currentRooms]
                    : currentRooms.map((existingRoom) => (
                        existingRoom.id === normalizedRoom.id ? { ...existingRoom, ...normalizedRoom } : existingRoom
                    ));

                if (existingIndex === -1) {
                    setOnlineCount((prev) => prev + 1);
                }

                return nextRooms;
            });
        };

        const handleRoomRemoved = ({ roomId } = {}) => {
            if (!roomId) return;

            setRooms((prevRooms) => {
                const nextRooms = (Array.isArray(prevRooms) ? prevRooms : []).filter((room) => room.id !== roomId);
                setOnlineCount((prev) => Math.max(0, prev - 1));
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
            await loadLobbyData();
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
        pagination,
        refreshLobby,
    };
};
