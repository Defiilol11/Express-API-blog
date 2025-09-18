const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET || "defaultsecret", (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Token inválido o expirado" });
        }
        req.user = user; // { id, email }
        next();
    });
}

module.exports = authMiddleware;
