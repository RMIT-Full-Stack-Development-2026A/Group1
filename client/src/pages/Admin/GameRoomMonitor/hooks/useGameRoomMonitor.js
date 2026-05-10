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

const normalizeRoom = (room) => {
  const isClosed = room.status === "closed";
  const isWaiting = room.status === "waiting";
  const isInProgress = room.status === "in-progress";

  return {
    ...room,
    statusLabel: isClosed ? "CLOSED" : isInProgress ? "MATCH IN PROGRESS" : "WAITING FOR PLAYER",
    statusTone: isClosed ? "closed" : isInProgress ? "in-progress" : "waiting",
    canClose: !isClosed,
    startTimeDisplay: formatDateTime(room.startTime),
    endTimeDisplay: isClosed ? formatDateTime(room.endTime) : "ACTIVE",
    playerTwoName: isWaiting ? "WAITING" : room.playerTwoName,
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
      const response = await gameRoomMonitorService.closeRoom(room.id);
      const updatedRoom = response?.data?.room || response?.room || null;

      if (updatedRoom) {
        setRooms((currentRooms) =>
          currentRooms.map((currentRoom) =>
            currentRoom.id === updatedRoom.id ? normalizeRoom(updatedRoom) : currentRoom
          )
        );
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to close the game room.");
    } finally {
      setClosingRoomId(null);
    }
  };

  return {
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
