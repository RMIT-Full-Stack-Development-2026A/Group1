/**
 * useGameModeSelect Hook
 * Manages game mode selection logic, authentication, and state
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/auth/AuthStore';
import { useModeStore } from '../../../../stores/ai/ModeStore'; 
import { getGameModes, getGameModeRoute } from '../service/gameModeSelect.service';

export const useGameModeSelect = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { setGameMode, setAiDifficulty } = useModeStore();

  /**
   * Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  /**
   * Handle game mode selection
   * @param {string} modeId - ID of the selected game mode
   */
  const handleSelectMode = (modeId) => {
    setGameMode(modeId);
    
    if (modeId === 'SINGLE_PLAYER' && setAiDifficulty) {
        setAiDifficulty('HARD');
    } else {
        setAiDifficulty(null)
    }

    const route = getGameModeRoute(modeId);
    if (route) {
      navigate(route);
    }
  };

  /**
   * Get all available game modes
   * @returns {Array} Array of game mode objects
   */
  const gameModes = getGameModes();

  return {
    gameModes,
    handleSelectMode,
    user,
  };
};