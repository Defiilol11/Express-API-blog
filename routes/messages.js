const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { success, error } = require("../utils/response");
const auth = require("../middlewares/auth");

// Crear mensaje (requiere login)
router.post("/", auth, async (req, res, next) => {
    const user_id = req.user.id;
    const { content } = req.body;

    try {
        if (!content) return error(res, "El contenido es requerido", 400);
        if (content.length > 280)
            return error(res, "El mensaje excede 280 caracteres", 400);

        const result = await db.query(
            `INSERT INTO messages (user_id, content)
       VALUES ($1, $2) 
       RETURNING id, user_id, content, created_at`,
            [user_id, content]
        );

        return success(res, result.rows[0], "Mensaje creado");
    } catch (err) {
        next(err);
    }
});

// 🔹 Main global (todos los mensajes)
router.get("/all", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT m.id, m.content, m.created_at,
              u.id AS user_id, u.email,
              p.display_name, p.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY m.created_at DESC`
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// 🔹 Últimos 10 mensajes globales
router.get("/latest", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT m.id, m.content, m.created_at,
              u.id AS user_id, u.email,
              p.display_name, p.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY m.created_at DESC
       LIMIT 10`
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// 🔹 Feed personalizado (solo mensajes de gente a la que sigo)
router.get("/feed", auth, async (req, res, next) => {
    const user_id = req.user.id;
    try {
        const result = await db.query(
            `SELECT m.id, m.content, m.created_at,
              u.id AS user_id, u.email,
              p.display_name, p.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       JOIN follows f ON f.following_id = m.user_id
       WHERE f.follower_id = $1
       ORDER BY m.created_at DESC
       LIMIT 20`, // puedes subir o bajar el límite según quieras
            [user_id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Mensajes de un usuario específico
router.get("/user/:id", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT m.id, m.content, m.created_at,
              u.id AS user_id, u.email,
              p.display_name, p.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE m.user_id = $1
       ORDER BY m.created_at DESC`,
            [req.params.id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Buscar mensajes por coincidencia de texto (full-text search)
router.get("/search/:term", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT m.id, m.content, m.created_at,
              u.id AS user_id, u.email,
              p.display_name, p.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE to_tsvector('spanish', m.content) @@ plainto_tsquery('spanish', $1)
       ORDER BY m.created_at DESC`,
            [req.params.term]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Likes de un mensaje
router.get("/:id/likes", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT l.user_id, u.email, p.display_name, p.avatar_url
       FROM likes l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE l.message_id = $1`,
            [req.params.id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Dar like a un mensaje
router.post("/:id/like", auth, async (req, res, next) => {
    const user_id = req.user.id;
    const message_id = req.params.id;

    try {
        const result = await db.query(
            `INSERT INTO likes (user_id, message_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING user_id, message_id`,
            [user_id, message_id]
        );

        if (result.rows.length === 0)
            return error(res, "Ya diste like a este mensaje", 400);

        return success(res, result.rows[0], "Like agregado");
    } catch (err) {
        next(err);
    }
});

// Quitar like
router.delete("/:id/like", auth, async (req, res, next) => {
    const user_id = req.user.id;
    const message_id = req.params.id;

    try {
        const result = await db.query(
            `DELETE FROM likes 
       WHERE user_id = $1 AND message_id = $2
       RETURNING user_id, message_id`,
            [user_id, message_id]
        );

        if (result.rows.length === 0)
            return error(res, "No habías dado like a este mensaje", 404);

        return success(res, result.rows[0], "Like eliminado");
    } catch (err) {
        next(err);
    }
});

module.exports = router;
