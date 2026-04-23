export const ROOM_STATUS = {
    WAITING: 'WAITING',
    READY: 'READY',
    PLAYING: 'PLAYING',
    ABORTED: 'ABORTED',
    CLOSED: 'CLOSED'
};

// Extracted arrays for enums and queries
export const ALL_ROOM_STATUSES = Object.values(ROOM_STATUS);

export const ACTIVE_ROOM_STATUSES = [
    ROOM_STATUS.WAITING,
    ROOM_STATUS.READY,
    ROOM_STATUS.PLAYING
];