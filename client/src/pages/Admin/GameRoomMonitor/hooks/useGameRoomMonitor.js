import { useCallback, useEffect, useMemo, useState } from "react";
import { gameRoomMonitorService } from "../services/gameRoomMonitor.service";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

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

const normalizeRoom = (room) => {
  const status = String(room.status || "").toUpperCase();
  const participants = Array.isArray(room.participants) ? room.participants : [];
  const playerOne = getParticipantName(participants[0], "PLAYER 1");
  const playerTwo = getParticipantName(participants[1], status === "WAITING" ? "WAITING" : "PLAYER 2");
  const isClosed = status === "CLOSED" || status === "ABORTED";
  const isWaiting = status === "WAITING";
  const isReady = status === "READY";
  const isInProgress = status === "PLAYING";

  const statusLabel = isClosed
    ? "CLOSED"
    : isInProgress
      ? "MATCH IN PROGRESS"
      : isReady
        ? "READY TO START"
        : "WAITING FOR PLAYER";

  const startTimeValue = room.startedAt || room.startTime || room.createdAt;
  const endTimeValue = room.endedAt || room.endTime;

  return {
    ...room,
    status: isClosed ? "closed" : isInProgress ? "in-progress" : "waiting",
    playerOneName: playerOne,
    playerTwoName: playerTwo,
    statusLabel,
    statusTone: isClosed ? "closed" : isInProgress ? "in-progress" : "waiting",
    canClose: !isClosed,
    startTimeDisplay: formatDateTime(startTimeValue),
    endTimeDisplay: isClosed ? formatDateTime(endTimeValue) : "ACTIVE",
    playerTwoName: isWaiting ? "WAITING" : playerTwo,
  };
};

export const useGameRoomMonitor = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closingRoomId, setClosingRoomId] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gameRoomMonitorService.getRooms();
      const payload = response?.data || response || {};
      const items = Array.isArray(payload.items) ? payload.items : [];

      setRooms(items.map(normalizeRoom));
      setError(null);
    } catch (err) {
      setRooms([]);
      setError(err.message || "Failed to load game rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return rooms;
    }

    return rooms.filter((room) => {
      const roomNumber = String(room.roomNumber).toLowerCase();
      const playerOne = (room.playerOneName || "").toLowerCase();
      const playerTwo = (room.playerTwoName || "").toLowerCase();

      return (
        roomNumber.includes(normalizedSearch) ||
        playerOne.includes(normalizedSearch) ||
        playerTwo.includes(normalizedSearch)
      );
    });
  }, [rooms, searchTerm]);

  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((room) => room.status !== "closed").length;
  const waitingRooms = rooms.filter((room) => room.status === "waiting").length;
  const inProgressRooms = rooms.filter((room) => room.status === "in-progress").length;
  const closedRooms = rooms.filter((room) => room.status === "closed").length;

  const resetSearch = () => {
    setSearchTerm("");
  };

  const closeRoom = async (room) => {
    if (!room?.canClose) {
      return;
    }

    try {
      setClosingRoomId(room.id);
      await gameRoomMonitorService.closeRoom(room.id);
      await fetchRooms();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to close the game room.");
    } finally {
      setClosingRoomId(null);
    }
  };

  return {
    refreshRooms: fetchRooms,
    rooms: filteredRooms,
    searchTerm,
    setSearchTerm,
    resetSearch,
    loading,
    error,
    closeRoom,
    closingRoomId,
    totalRooms,
    activeRooms,
    waitingRooms,
    inProgressRooms,
    closedRooms,
    visibleRooms: filteredRooms.length,
  };
};
