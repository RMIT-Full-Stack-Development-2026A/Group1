/**
 * Custom hook for lobby logic
 * Manages rooms, stats, and activity state
 * Fetches data from real backend endpoints
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketStore } from "@/stores/socket/SocketStore";
import { LobbyService } from "../service/lobby.service";

export const useLobby = ({ page = 1, limit = 5, waitingOnly = false } = {}) => {
    const [rooms, setRooms] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page, limit, total: 0 });
    const socket = useSocketStore((state) => state.socket);
    const isConnected = useSocketStore((state) => state.isConnected);

    const hasLoadedOnce = useRef(false);

    // Rooms and recent activity are independent, so they load in parallel. A live "rooms changed" refresh only
    // needs the rooms (withActivity: false); the activity list is kept as it is.
    const loadLobbyData = useCallback(async ({ withActivity = true } = {}) => {
        const [roomsData, activityData] = await Promise.all([
            LobbyService.getRooms({
                page,
                limit,
                status: waitingOnly ? 'WAITING' : undefined,
            }),
            withActivity ? LobbyService.getRecentActivity() : Promise.resolve(null),
        ]);

        const normalizedRooms = roomsData?.items || [];
        setRooms(normalizedRooms);
        if (activityData) setRecentActivity(activityData);
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
                
                

                await loadLobbyData();
                hasLoadedOnce.current = true;
            } catch (err) {
                console.error("[useLobby] Failed to load lobby data:", err);
                setError(err.message || "Failed to load lobby data");
                setRooms([]);
                setRecentActivity([]);
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
                loadLobbyData({ withActivity: false }).catch((err) => setError(err.message));
            }, 100);
        };

        socket.on('lobby:rooms_changed', handleRoomsChanged);

        return () => {
            clearTimeout(refreshTimer);
            socket.off('lobby:rooms_changed', handleRoomsChanged);
        };
    }, [socket, isConnected, loadLobbyData]);

    // Recover list changes missed while the socket was down: refresh once when it reconnects. This is tied to the
    // disconnected -> connected transition, so the first connection (the mount effect is already loading the list)
    // and page or filter changes do not trigger a second fetch.
    const wasConnected = useRef(isConnected);
    useEffect(() => {
        if (isConnected && !wasConnected.current && hasLoadedOnce.current) {
            loadLobbyData({ withActivity: false }).catch((err) => setError(err.message));
        }
        wasConnected.current = isConnected;
    }, [isConnected, loadLobbyData]);

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
        loading,
        error,
        pagination,
        refreshLobby,
    };
};
