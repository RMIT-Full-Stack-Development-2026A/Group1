import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";

export const AuthService = {
    registerUser: async (userData, res) => {
        const { email, password, confirmPassword, username, country } = userData;

        // Mandatory Fields
        if (!email || !password || !confirmPassword || !username || !country) {
            throw new Error("Missing fields. Cause: All fields are mandatory. Example: Provide email, username, password, confirmPassword, and country.");
        }

        if (password !== confirmPassword) {
            throw new Error("Password mismatch. Cause: Passwords do not match. Example: Ensure both password fields are identical.");
        }

        // Syntax Validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length >= 255) {
            throw new Error("Invalid email format. Cause: Missing '@' or '.', or length exceeds 254 characters. Example: user@example.com.");
        }
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            throw new Error("Invalid username. Cause: Contains prohibited characters. Example: valid_User-123.");
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error("Password too weak. Cause: Missing uppercase, number, or special character, or less than 8 characters. Example: StrongPass1!");
        }

        // Database Checks
        const existingUser = await AuthRepository.findByEmailOrUsername(email);
        if (existingUser) {
            throw new Error("User exists. Cause: Email or Username is already taken. Example: Choose a different identifier.");
        }

        // Creation
        const hashedPassword = await bcryptjs.hash(password, 10); // Hashing required
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country,
            // verificationToken,
            // verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // Expires in 15 minutes
        });

        // NOTE: You should call your email utility here to send the code!
        // await sendVerificationEmail(newUser.email, verificationToken);

        generateTokenAndSetCookie(res, newUser._id, newUser.role); // JWT generation
        return { user: newUser };
    },

    loginUser: async (identifier, password, res) => {
        if (!identifier || !password) {
            throw new Error("Missing credentials. Cause: Identifier or password omitted. Example: Provide email/username and password.");
        }

        const user = await AuthRepository.findByEmailOrUsername(identifier);
        if (!user) {
            throw new Error("Invalid credentials. Cause: User not found. Example: Check your spelling.");
        }

        // Deactivation Check
        if (!user.isActive) {
            throw new Error("Account deactivated. Cause: Admin disabled this account. Please contact support.");
        }

        // Brute-force Check
        if (user.lockUntil && user.lockUntil > Date.now()) {
            throw new Error("Account locked. Cause: 5 failed attempts. Please wait 60 seconds and try again.");
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            await AuthRepository.incrementLoginAttempts(user);
            throw new Error("Invalid credentials. Cause: Incorrect password. Example: Try again.");
        }

        await AuthRepository.resetLoginAttempts(user);
        await AuthRepository.updateLastLogin(user._id);
        generateTokenAndSetCookie(res, user._id, user.role); // Provide JWS token
        return { user };
    },

    // // NEW: Verify Email Service
    // verifyEmailToken: async (code) => {
    //     const user = await AuthRepository.findByVerificationToken(code);
    //     if (!user) {
    //         throw new Error("Invalid or expired verification code.");
    //     }
    //
    //     const verifiedUser = await AuthRepository.verifyUser(user._id);
    //     return { user: verifiedUser };
    // },

    checkAuthUser: async (userId) => {
        const user = await AuthRepository.findById(userId);
        if (!user) throw new Error("User not found");
        return { user };
    }
};