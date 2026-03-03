import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { Mic, Square, Save } from 'lucide-react';

type Props = {
    onUploadComplete: () => void;
};

export const AudioRecorder: React.FC<Props> = ({ onUploadComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [chunks, setChunks] = useState<Blob[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(0);
    const [timerId, setTimerId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            const localChunks: Blob[] = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) localChunks.push(e.data);
            };

            mr.onstop = () => {
                const blob = new Blob(localChunks, { type: 'audio/webm' });
                setChunks(localChunks);
                setPreviewUrl(URL.createObjectURL(blob));
            };

            mr.start();
            startTimeRef.current = Date.now();

            const id = window.setInterval(() => {
                if (startTimeRef.current) {
                    setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 500);
            setTimerId(id);
            setMediaRecorder(mr);
            setIsRecording(true);
            setPreviewUrl(null);
        } catch (err) {
            console.error("Could not start recording:", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }
        if (timerId) {
            window.clearInterval(timerId);
            setTimerId(null);
        }
        setIsRecording(false);
    };

    const handleSave = async () => {
        if (!chunks.length || !title.trim()) return;
        setIsSaving(true);
        try {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            formData.append('title', title.trim());
            formData.append('durationSeconds', String(duration));

            await api.post('/voice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            discard();
            onUploadComplete();
        } catch (err) {
            console.error(err);
            alert("Failed to save audio");
        } finally {
            setIsSaving(false);
        }
    };

    const discard = () => {
        setChunks([]);
        setPreviewUrl(null);
        setTitle('');
        setDuration(0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 max-w-lg mx-auto w-full text-center">
            <div className="mb-6">
                <div className="text-3xl font-light text-gray-800 mb-2">Talk to your future self</div>
                <p className="text-gray-500 text-sm">Record a short message, a confession, or an affirmation.</p>
            </div>

            <div className="mb-8 flex justify-center">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 transition-all shadow-sm border border-emerald-100"
                    >
                        <Mic size={32} className="relative z-10" />
                        <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:animate-ping"></div>
                    </button>
                ) : (
                    <div className="space-y-4 w-full">
                        <div className="text-emerald-600 animate-pulse font-mono text-xl">{formatTime(duration)}</div>
                        <button
                            onClick={stopRecording}
                            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
                        >
                            <Square size={24} fill="currentColor" />
                        </button>
                    </div>
                )}
            </div>

            {previewUrl && !isRecording && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <audio controls src={previewUrl} className="w-full h-10" />
                    <input
                        type="text"
                        placeholder="Give this a thoughtful title..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !title.trim()}
                            className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save to Vault'}
                        </button>
                        <button
                            onClick={discard}
                            disabled={isSaving}
                            className="px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
