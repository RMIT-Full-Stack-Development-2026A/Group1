import http from '@/utils/httpHelper';
import { API_ENDPOINTS } from '@/config/apiConfig';

export const matchReplayService = {
  getReplayById: async (gameId) => {
    // API Call thực tế:
    return http.get(API_ENDPOINTS.GAME.DETAILS(gameId));
    
    // TRONG LÚC DEV: Mock data từ JSON bạn gửi để test UI
    // return {
    //   _id: "69df6db30c81cedee548f6dc",
    //   sessionNumber: "GS-01KP...",
    //   boardSize: 15,
    //   createdAt: "2026-04-16T09:20:29.862Z",
    //   endedAt: "2026-04-16T09:25:42.477Z",
    //   status: "FINISHED",
    //   endedReason: "WIN",
    //   participants: [
    //     { usernameSnapshot: "quyvuonggiadao", role: "HUMAN", mark: "X" },
    //     { usernameSnapshot: "Neural", role: "AI", mark: "O", aiDifficulty: "HARD" }
    //   ],
    //   firstTurnParticipantIndex: 0,
    //   winnerParticipantIndex: 1,
    //   winningLine: [
    //     { row: 3, col: 3, coordinate: "D4" },
    //     { row: 4, col: 4, coordinate: "E5" },
    //     // ... (Giả lập winning line)
    //   ],
    //   moves: [
    //     { moveNumber: 1, byParticipantIndex: 0, row: 7, col: 7, coordinate: "H8" },
    //     { moveNumber: 2, byParticipantIndex: 1, row: 8, col: 8, coordinate: "I9" },
    //     { moveNumber: 3, byParticipantIndex: 0, row: 6, col: 8, coordinate: "G9" },
    //     { moveNumber: 4, byParticipantIndex: 1, row: 5, col: 9, coordinate: "F10" }
    //     // ...
    //   ]
    // };
  }
};