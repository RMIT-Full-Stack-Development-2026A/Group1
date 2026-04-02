/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 */

import { useState, useEffect } from "react";
import { LobbyService } from "./lobby.service";

export const useLobby = () => {
    const [rooms, setRooms] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Initialize lobby data
    useEffect(() => {
        const initializeLobby = async () => {
            try {
                setLoading(true);
                // In production, these would be async API calls
                const roomsData = LobbyService.getRooms();
                const statsData = LobbyService.getPlayerStats();
                const activityData = LobbyService.getRecentActivity();
                const onlineData = LobbyService.getOnlineCount();

                setRooms(roomsData);
                setPlayerStats(statsData);
                setRecentActivity(activityData);
                setOnlineCount(onlineData);
            } catch (error) {
                console.error("Failed to load lobby data:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeLobby();
    }, []);

    // Get available rooms
    const availableRooms = LobbyService.getAvailableRooms(rooms);

    return {
        rooms,
        playerStats,
        recentActivity,
        onlineCount,
        availableRooms,
        loading,
    };
};
