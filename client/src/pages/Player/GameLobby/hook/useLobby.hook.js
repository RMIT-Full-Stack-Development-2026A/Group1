/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect } from "react";
import { LobbyService } from "../service/lobby.service";

export const useLobby = () => {
    const [rooms, setRooms] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);

    // Initialize lobby data from backend
    useEffect(() => {
        const initializeLobby = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);
                
                console.log('[useLobby] Initializing lobby data...');
                
                // Fetch all data in parallel
                const [roomsData, statsData, activityData] = await Promise.all([
                    LobbyService.getRooms(),
                    LobbyService.getPlayerStats(),
                    LobbyService.getRecentActivity(),
                ]);

                console.log('[useLobby] Data fetched:', {
                    roomsData,
                    statsData,
                    activityData,
                });

                // Check if we're using mock data
                const isMockData = roomsData === LobbyService._getMockRooms() || 
                                   (Array.isArray(roomsData) && roomsData[0]?.roomNumber === 42);
                setUsingMockData(isMockData);

                setRooms(roomsData || []);
                setPlayerStats(statsData || null);
                setRecentActivity(activityData || []);
                setOnlineCount(LobbyService.getOnlineCount());
                
                console.log('[useLobby] Lobby initialized:', {
                    roomsCount: (roomsData || []).length,
                    stats: statsData,
                    activityCount: (activityData || []).length,
                    usingMock: isMockData,
                });
            } catch (err) {
                console.error("[useLobby] Failed to load lobby data:", err);
                setError(err.message || "Failed to load lobby data");
                setRooms([]);
                setPlayerStats(null);
                setRecentActivity([]);
                setUsingMockData(true);
            } finally {
                setLoading(false);
            }
        };

        initializeLobby();
    }, []);

    // Get available rooms (filter by status)
    const availableRooms = LobbyService.getAvailableRooms(rooms);

    // Refresh lobby data manually
    const refreshLobby = async () => {
        try {
            setLoading(true);
            const [roomsData, statsData, activityData] = await Promise.all([
                LobbyService.getRooms(),
                LobbyService.getPlayerStats(),
                LobbyService.getRecentActivity(),
            ]);

            setRooms(roomsData);
            setPlayerStats(statsData);
            setRecentActivity(activityData);
            setOnlineCount(LobbyService.getOnlineCount());
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
        playerStats,
        recentActivity,
        onlineCount,
        availableRooms,
        loading,
        error,
        usingMockData,
        refreshLobby,
    };
};
