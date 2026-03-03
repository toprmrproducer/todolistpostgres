"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'done']).optional(),
    dueDate: zod_1.z.string().datetime().optional()
});
router.get('/', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    const tasks = await db_1.db.task.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    try {
        const data = taskSchema.parse(req.body);
        const task = await db_1.db.task.create({
            data: {
                ...data,
                userId: req.user.id,
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    try {
        const data = taskSchema.partial().parse(req.body);
        const id = req.params.id;
        const task = await db_1.db.task.findFirst({ where: { id, userId: req.user.id } });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        const updated = await db_1.db.task.update({
            where: { id },
            data
        });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).send();
    const id = req.params.id;
    const task = await db_1.db.task.findFirst({ where: { id, userId: req.user.id } });
    if (!task)
        return res.status(404).json({ error: 'Task not found' });
    await db_1.db.task.delete({ where: { id } });
    res.status(204).end();
});
exports.default = router;
