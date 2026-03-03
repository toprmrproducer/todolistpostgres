"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const r2Client_1 = require("../r2Client");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ limits: { fileSize: 20 * 1024 * 1024 } }); // 20 MB
router.get('/', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    const rows = await db_1.db.voiceEntry.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
});
router.post('/', auth_1.requireAuth, upload.single('audio'), async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    const userId = req.user.id;
    const { title, durationSeconds } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }
    try {
        const { buffer, mimetype } = req.file;
        const { key, publicUrl } = await (0, r2Client_1.uploadAudio)(userId, buffer, mimetype);
        const duration = durationSeconds ? Number(durationSeconds) : null;
        const row = await db_1.db.voiceEntry.create({
            data: {
                userId,
                title: title || 'Untitled Audio',
                durationSeconds: isNaN(Number(duration)) ? null : duration,
                audioKey: key,
                audioUrl: publicUrl,
            },
        });
        res.status(201).json(row);
    }
    catch (error) {
        console.error('Audio upload error:', error);
        res.status(500).json({ error: 'Failed to save audio file' });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    const userId = req.user.id;
    const id = req.params.id;
    const existing = await db_1.db.voiceEntry.findFirst({
        where: { id, userId },
    });
    if (!existing) {
        return res.status(404).json({ error: 'Voice entry not found' });
    }
    try {
        await (0, r2Client_1.deleteAudio)(existing.audioKey);
    }
    catch (e) {
        console.warn(`Could not delete key ${existing.audioKey} from R2`, e);
    }
    await db_1.db.voiceEntry.delete({ where: { id } });
    res.status(204).end();
});
exports.default = router;
