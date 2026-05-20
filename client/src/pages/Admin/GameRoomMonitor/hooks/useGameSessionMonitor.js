import { useCallback, useEffect, useState } from "react";
import { gameRoomMonitorService } from "../services/gameRoomMonitor.service";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getParticipantName = (participant, fallback) => {
  return participant?.usernameSnapshot || participant?.username || participant?.name || fallback;
};

const normalizeSession = (session) => {
  const status = String(session.status || session.viewerResult || "").toUpperCase();
  const startedAt = session.startedAt || session.startTime || session.createdAt;
  const endedAt = session.endedAt || session.endTime;

  return {
    ...session,
    id: session.id,
    sessionNumber: session.sessionNumber || session.id,
    gameType: session.gameType || "ONLINE_MATCH",
    boardSize: session.boardSize,
    opponentName: session.opponentName || getParticipantName(session.opponent, "UNKNOWN"),
    opponentAvatar: session.opponentAvatar || session.opponent?.avatarSnapshot || null,
    viewerResult: session.viewerResult || status || "FINISHED",
    status,
    startedAt,
    endedAt,
    startTimeDisplay: formatDateTime(startedAt),
    endTimeDisplay: formatDateTime(endedAt),
  };
};

export const useGameSessionMonitor = (filters = {}) => {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 5;

  const fetchSessions = useCallback(async (pageToLoad = 1, localFilters = {}) => {
    try {
      setLoading(true);
      const params = { page: pageToLoad, limit: pageSize, ...localFilters };
      const response = await gameRoomMonitorService.getSessions(params);
      const payload = response?.data || response || {};
      const items = Array.isArray(payload.items) ? payload.items : [];

      setSessions(items.map(normalizeSession));
      setTotalSessions(Number(payload.total) || items.length);
      setPage(Number(payload.page) || pageToLoad);
      setError(null);
    } catch (err) {
      setSessions([]);
      setTotalSessions(0);
      setError(err.message || "Failed to load game sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    fetchSessions(1, filters);
  }, []);

  // Auto-refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchSessions(1, filters);
  }, [filters, fetchSessions]);

  const totalPages = Math.max(1, Math.ceil(totalSessions / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const changePage = (nextPage) => {
    const normalizedPage = Math.min(Math.max(1, nextPage), totalPages);
    fetchSessions(normalizedPage, filters);
  };

  return {
    refreshSessions: fetchSessions,
    sessions,
    allSessions: sessions,
    loading,
    error,
    totalSessions,
    page,
    pageSize,
    totalPages,
    changePage,
    visibleSessions: sessions.length,
  };
};
