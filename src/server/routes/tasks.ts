import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['pending', 'done']).optional(),
    dueDate: z.string().datetime().optional()
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const tasks = await db.task.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    try {
        const data = taskSchema.parse(req.body);
        const task = await db.task.create({
            data: {
                ...data,
                userId: req.user.id,
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    try {
        const data = taskSchema.partial().parse(req.body);
        const id = req.params.id;

        const task = await db.task.findFirst({ where: { id, userId: req.user.id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const updated = await db.task.update({
            where: { id },
            data
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const id = req.params.id;
    const task = await db.task.findFirst({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await db.task.delete({ where: { id } });
    res.status(204).end();
});

export default router;
