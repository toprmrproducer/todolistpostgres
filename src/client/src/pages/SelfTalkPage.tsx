import React, { useEffect, useState } from 'react';
import { AudioRecorder } from '../components/AudioRecorder';
import { api } from '../lib/api';
import { Trash2 } from 'lucide-react';

type VoiceEntry = {
    id: string;
    title: string;
    audioUrl: string;
    durationSeconds: number | null;
    createdAt: string;
};

export const SelfTalkPage: React.FC = () => {
    const [entries, setEntries] = useState<VoiceEntry[]>([]);

    const loadEntries = async () => {
        try {
            const res = await api.get('/voice');
            setEntries(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadEntries();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/voice/${id}`);
            setEntries((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-12">
            <AudioRecorder onUploadComplete={loadEntries} />

            <div className="space-y-6">
                <h2 className="text-xl font-medium text-gray-800">Your Vault</h2>
                {entries.length === 0 && (
                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No recordings yet. Your future self is waiting to hear from you.
                    </p>
                )}
                <div className="grid gap-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between group"
                        >
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">{entry.title}</div>
                                <div className="text-xs text-gray-500 mb-3">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                    {entry.durationSeconds ? ` • ${Math.floor(entry.durationSeconds / 60)}:${(entry.durationSeconds % 60).toString().padStart(2, '0')}` : ''}
                                </div>
                                <audio controls src={entry.audioUrl} className="w-full max-w-md h-10" />
                            </div>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                title="Delete recording"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
