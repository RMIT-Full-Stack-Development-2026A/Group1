import { AuthRepository } from '../modules/auth/repositories/auth.repository.js';

export const validateRegisterInput = (data) => {
    const { username, email, password, confirmPassword, country } = data;
    const errors = [];

    if (!email || !password || !confirmPassword || !username || !country) {
        errors.push({
            field: "all",
            error: "MISSING_FIELDS",
            cause: "One or more mandatory fields are empty.",
            example: "Provide email, username, password, confirmPassword, and country."
        });
        return errors; 
    }

    if (password !== confirmPassword) {
        errors.push({
            field: "confirmPassword",
            error: "PASSWORD_MISMATCH",
            cause: "The password and confirmPassword fields do not match.",
            example: "Ensure both fields are exactly identical."
        });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{9,}$/; 
    if (!usernameRegex.test(username)) {
        errors.push({
            field: "username",
            error: "INVALID_USERNAME",
            cause: "Must be greater than 8 characters and contain only letters, numbers, hyphens, or underscores.",
            example: "TicTacMaster_99"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length >= 255) {
        errors.push({
            field: "email",
            error: "INVALID_EMAIL",
            cause: "Must be a valid email address with '@' and '.' and under 255 characters.",
            example: "player@example.com"
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
    if (!passwordRegex.test(password)) {
        errors.push({
            field: "password",
            error: "WEAK_PASSWORD",
            cause: "Must be > 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special char.",
            example: "StrongP@ssw0rd!"
        });
    }

    return errors;
};

export const validateRegisterConflicts = async (email, username) => {
    const emailConflict = await AuthRepository.findByEmailOrUsername(email);
    const usernameConflict = await AuthRepository.findByEmailOrUsername(username);
    
    if (emailConflict) {
        throw {
            status: 409,
            error: "EMAIL_ALREADY_EXISTS",
            message: "Registration failed. Email is already in use.",
            cause: "The provided email address is already registered to another account.",
            example: "new_player@example.com"
        };
    }

    if (usernameConflict) {
        throw {
            status: 409,
            error: "USERNAME_ALREADY_TAKEN",
            message: "Registration failed. Username is already taken.",
            cause: "The provided username is already claimed by another player.",
            example: "Unique_Player_99"
        };
    }
};

export const validateLoginInput = (data) => {
    const { identifier, password } = data;
    const errors = [];

    if (!identifier || !password) {
        errors.push({
            field: "all",
            error: "MISSING_FIELDS",
            cause: "Identifier (email/username) or password is missing.",
            example: "Provide identifier and password."
        });
    }

    return errors;
};