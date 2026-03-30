import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) { return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid or expired token" }); }

        req.user = { id: decoded.userId, role: decoded.role };

        next();
    } catch (error) {
        console.log("Error in verifyToken", error);
        return res.status(401).json({ error: "TOKEN_VERIFICATION_FAILED", message: error.message });
    }
};