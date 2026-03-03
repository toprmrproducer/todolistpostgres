import { Router } from 'express';
import multer from 'multer';
import { uploadAudio, deleteAudio } from '../r2Client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { db } from '../db';

const router = Router();
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } }); // 20 MB

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const rows = await db.voiceEntry.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
    });
    res.json(rows);
});

router.post('/', requireAuth, upload.single('audio'), async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();

    const userId = req.user.id;
    const { title, durationSeconds } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
        const { buffer, mimetype } = req.file;
        const { key, publicUrl } = await uploadAudio(userId, buffer, mimetype);

        const duration = durationSeconds ? Number(durationSeconds) : null;

        const row = await db.voiceEntry.create({
            data: {
                userId,
                title: title || 'Untitled Audio',
                durationSeconds: isNaN(Number(duration)) ? null : duration,
                audioKey: key,
                audioUrl: publicUrl,
            },
        });

        res.status(201).json(row);
    } catch (error) {
        console.error('Audio upload error:', error);
        res.status(500).json({ error: 'Failed to save audio file' });
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const userId = req.user.id;
    const id = req.params.id;

    const existing = await db.voiceEntry.findFirst({
        where: { id, userId },
    });

    if (!existing) {
        return res.status(404).json({ error: 'Voice entry not found' });
    }

    try {
        await deleteAudio(existing.audioKey);
    } catch (e) {
        console.warn(`Could not delete key ${existing.audioKey} from R2`, e);
    }

    await db.voiceEntry.delete({ where: { id } });
    res.status(204).end();
});

export default router;
