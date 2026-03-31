import { AuthDTO } from "../dtos/auth.dto.js";
import { AuthRepository } from "../repositories/auth.repository.js";

export const   UserInterface = {
    /**
     * Used by other modules to verify a user exists.
     * @param {string} userId
     * @returns {Object|null}
     */
    getUserStatus: async (userId) => {
        // Calls its own internal service layer
        const user = await AuthRepository.findById(userId);
        if (!user) return null;

        // Return all user data except password
        return AuthDTO.toUserResponse(user);
    }
};