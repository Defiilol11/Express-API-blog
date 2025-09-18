const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { success, error } = require("../utils/response");
const auth = require("../middlewares/auth");

// Seguir usuario
router.post("/", auth, async (req, res, next) => {
    const follower_id = req.user.id;
    const { following_id } = req.body;

    try {
        if (!following_id) return error(res, "following_id es requerido", 400);
        if (follower_id === following_id)
            return error(res, "No puedes seguirte a ti mismo", 400);

        const result = await db.query(
            `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2) 
       RETURNING follower_id, following_id, followed_at`,
            [follower_id, following_id]
        );
        return success(res, result.rows[0], "Ahora sigues a este usuario");
    } catch (err) {
        if (err.code === "23505") return error(res, "Ya sigues a este usuario", 400);
        next(err);
    }
});

// Dejar de seguir usuario
router.delete("/", auth, async (req, res, next) => {
    const follower_id = req.user.id;
    const { following_id } = req.body;

    try {
        const result = await db.query(
            `DELETE FROM follows 
       WHERE follower_id = $1 AND following_id = $2
       RETURNING follower_id, following_id`,
            [follower_id, following_id]
        );
        if (result.rows.length === 0)
            return error(res, "Relación no encontrada", 404);

        return success(res, result.rows[0], "Dejaste de seguir al usuario");
    } catch (err) {
        next(err);
    }
});

// Feed de mensajes de usuarios seguidos
router.get("/feed", auth, async (req, res, next) => {
    const follower_id = req.user.id;

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
       ORDER BY m.created_at DESC`,
            [follower_id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Ver a quién sigo (propio)
router.get("/following", auth, async (req, res, next) => {
    const follower_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT u.id AS following_id, u.email, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.following_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.follower_id = $1`,
            [follower_id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Ver seguidores (propio)
router.get("/followers", auth, async (req, res, next) => {
    const following_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT u.id AS follower_id, u.email, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.following_id = $1`,
            [following_id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Ver a quién sigue OTRO usuario
router.get("/:id/following", auth, async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT u.id AS following_id, u.email, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.following_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.follower_id = $1`,
            [req.params.id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

// Ver seguidores de OTRO usuario
router.get("/:id/followers", auth, async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT u.id AS follower_id, u.email, p.display_name, p.avatar_url
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.following_id = $1`,
            [req.params.id]
        );
        return success(res, result.rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
