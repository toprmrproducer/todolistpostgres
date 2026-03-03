import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Check, Square } from 'lucide-react';

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'done';
};

export const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const loadTasks = async () => {
        const { data } = await api.get('/tasks');
        setTasks(data);
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await api.post('/tasks', { title: newTaskTitle });
        setNewTaskTitle('');
        loadTasks();
    };

    const toggleTask = async (task: Task) => {
        const newStatus = task.status === 'pending' ? 'done' : 'pending';
        await api.put(`/tasks/${task.id}`, { status: newStatus });
        loadTasks();
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold mb-6">Today's Tasks</h1>
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                        placeholder="What needs to be done?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        <span>Add</span>
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm group">
                        <button onClick={() => toggleTask(task)} className="text-gray-400 group-hover:text-blue-500 transition-colors">
                            <Square size={24} />
                        </button>
                        <span className="flex-1 text-gray-800">{task.title}</span>
                    </div>
                ))}
                {pendingTasks.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No pending tasks. You're all caught up!
                    </p>
                )}
            </div>

            {completedTasks.length > 0 && (
                <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-lg font-medium text-gray-600 mb-4">Completed</h2>
                    <div className="space-y-3">
                        {completedTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-75">
                                <button onClick={() => toggleTask(task)} className="text-blue-500">
                                    <Check size={24} />
                                </button>
                                <span className="flex-1 text-gray-500 line-through">{task.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
