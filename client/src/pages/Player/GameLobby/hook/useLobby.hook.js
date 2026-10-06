/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect, useCallback } from "react";
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

    const loadLobbyData = useCallback(async () => {
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
    }, [page, limit, waitingOnly]);

    // Initialize lobby data from backend
    useEffect(() => {
        const initializeLobby = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);
                
                

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
    }, [page, limit, waitingOnly, loadLobbyData]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        let refreshTimer;
        const handleRoomsChanged = () => {
            clearTimeout(refreshTimer);
            // Re-fetch the current page so filters, totals and pagination remain
            // correct when another player creates, fills or removes a room.
            refreshTimer = setTimeout(() => {
                loadLobbyData().catch((err) => setError(err.message));
            }, 100);
        };

        socket.on('lobby:rooms_changed', handleRoomsChanged);
        handleRoomsChanged(); // Recover list changes missed during disconnection.

        return () => {
            clearTimeout(refreshTimer);
            socket.off('lobby:rooms_changed', handleRoomsChanged);
        };
    }, [socket, isConnected, loadLobbyData]);

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
