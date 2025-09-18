const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { success, error } = require("../utils/response");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 
const auth = require("../middlewares/auth");

// Crear usuario + perfil
router.post("/", async (req, res, next) => {
    const { email, password, display_name } = req.body;
    try {
        if (!email || !password || !display_name) {
            return error(res, "Email, password y display_name son requeridos", 400);
        }

        // Encriptar password (opcional si solo quieres prototipo)
        const hashed = await bcrypt.hash(password, 10);

        // Crear usuario
        const userResult = await db.query(
            `INSERT INTO users (email, password_hash)
       VALUES ($1, $2) 
       RETURNING id, email, created_at`,
            [email, hashed]
        );
        const userId = userResult.rows[0].id;

        // Crear perfil
        await db.query(
            `INSERT INTO profiles (user_id, display_name)
       VALUES ($1, $2)`,
            [userId, display_name]
        );

        return success(res, userResult.rows[0], "Usuario y perfil creados");
    } catch (err) {
        if (err.code === "23505") {
            return error(res, "El email ya está registrado", 400);
        }
        next(err);
    }
});

// Inicio de sesión (con JWT)
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await db.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [email]
        );
        if (result.rows.length === 0)
            return error(res, "Usuario no encontrado", 404);

        const user = result.rows[0];

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return error(res, "Contraseña incorrecta", 401);

        // Crear token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "2h" }
        );

        return success(res, { token }, "Login exitoso");
    } catch (err) {
        next(err);
    }
});

// Información de usuario + perfil
router.get("/:id", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.email, u.created_at,
              p.display_name, p.bio, p.avatar_url, p.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0)
            return error(res, "Usuario no encontrado", 404);

        return success(res, result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Borrar usuario (solo si eres el dueño)
router.delete("/:id", auth, async (req, res, next) => {
    try {
        if (parseInt(req.params.id) !== req.user.id) {
            return error(res, "No puedes eliminar a otro usuario", 403);
        }

        const result = await db.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, email",
            [req.params.id]
        );
        if (result.rows.length === 0)
            return error(res, "Usuario no encontrado", 404);

        return success(
            res,
            result.rows[0],
            "Usuario eliminado (mensajes, perfil y follows eliminados automáticamente)"
        );
    } catch (err) {
        next(err);
    }
});

module.exports = router;
