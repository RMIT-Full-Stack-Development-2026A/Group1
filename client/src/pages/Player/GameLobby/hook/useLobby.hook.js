/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect } from "react";
import { LobbyService } from "../service/lobby.service";

export const useLobby = () => {
    const [rooms, setRooms] = useState([]);
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
