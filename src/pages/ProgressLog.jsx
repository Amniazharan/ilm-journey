import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Trash2, CheckCircle, Circle, Edit2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProgressLog() {
    const { childId, subjectId, milestoneId } = useParams();
    const navigate = useNavigate();

    const [milestoneName, setMilestoneName] = useState('');
    const [logs, setLogs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingLogId, setEditingLogId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        page: ''
    });

    useEffect(() => {
        const storedChildren = JSON.parse(localStorage.getItem('children') || '[]');
        const child = storedChildren.find(c => c.id === childId);
        if (child) {
            const subject = child.subjects?.find(s => s.id === subjectId);
            if (subject) {
                if (subject.isSystem) {
                    setMilestoneName(decodeURIComponent(milestoneId));
                } else {
                    const milestone = subject.milestones?.find(m => m.id === milestoneId);
                    if (milestone) {
                        setMilestoneName(milestone.description);
                        setIsCompleted(milestone.completed);
                    }
                }

                const savedLogs = subject.logs?.[milestoneId] || [];
                setLogs(savedLogs.sort((a, b) => new Date(b.date) - new Date(a.date)));
            }
        }
    }, [childId, subjectId, milestoneId]);

    const saveLog = (e) => {
        e.preventDefault();
        const storedChildren = JSON.parse(localStorage.getItem('children') || '[]');
        const updatedChildren = storedChildren.map(child => {
            if (child.id === childId) {
                const subjects = child.subjects || [];
                const subject = subjects.find(s => s.id === subjectId);

                if (subject) {
                    const currentLogs = subject.logs || {};
                    const milestoneLogs = currentLogs[milestoneId] || [];

                    let updatedMilestoneLogs;
                    if (editingLogId) {
                        updatedMilestoneLogs = milestoneLogs.map(log =>
                            log.id === editingLogId ? { ...log, ...formData } : log
                        );
                    } else {
                        updatedMilestoneLogs = [...milestoneLogs, { ...formData, id: crypto.randomUUID(), timestamp: new Date().toISOString() }];
                    }

                    const updatedLogs = {
                        ...currentLogs,
                        [milestoneId]: updatedMilestoneLogs
                    };

                    const updatedSubject = { ...subject, logs: updatedLogs };

                    return {
                        ...child,
                        subjects: subjects.map(s => s.id === subjectId ? updatedSubject : s)
                    };
                }
            }
            return child;
        });

        localStorage.setItem('children', JSON.stringify(updatedChildren));

        // Update local state
        const child = updatedChildren.find(c => c.id === childId);
        const subject = child.subjects.find(s => s.id === subjectId);
        setLogs(subject.logs[milestoneId].sort((a, b) => new Date(b.date) - new Date(a.date)));

        resetForm();
    };

    const deleteLog = (logId) => {
        if (!confirm('Padam rekod ini?')) return;

        const storedChildren = JSON.parse(localStorage.getItem('children') || '[]');
        const updatedChildren = storedChildren.map(child => {
            if (child.id === childId) {
                const subject = child.subjects.find(s => s.id === subjectId);
                const currentLogs = subject.logs || {};
                const milestoneLogs = currentLogs[milestoneId] || [];

                const updatedLogs = {
                    ...currentLogs,
                    [milestoneId]: milestoneLogs.filter(l => l.id !== logId)
                };

                return {
                    ...child,
                    subjects: child.subjects.map(s => s.id === subjectId ? { ...subject, logs: updatedLogs } : s)
                };
            }
            return child;
        });

        localStorage.setItem('children', JSON.stringify(updatedChildren));

        const child = updatedChildren.find(c => c.id === childId);
        const subject = child.subjects.find(s => s.id === subjectId);
        setLogs(subject.logs[milestoneId].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const startEdit = (log) => {
        setFormData({
            date: log.date,
            notes: log.notes,
            page: log.page
        });
        setEditingLogId(log.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingLogId(null);
        setFormData({ date: new Date().toISOString().split('T')[0], notes: '', page: '' });
    };

    const toggleCompletion = () => {
        const storedChildren = JSON.parse(localStorage.getItem('children') || '[]');
        const updatedChildren = storedChildren.map(child => {
            if (child.id === childId) {
                const subjects = child.subjects || [];
                const subject = subjects.find(s => s.id === subjectId);

                if (subject && !subject.isSystem) {
                    const updatedMilestones = subject.milestones.map(m => {
                        if (m.id === milestoneId) {
                            return { ...m, completed: !m.completed, date: !m.completed ? new Date().toISOString() : null };
                        }
                        return m;
                    });

                    return {
                        ...child,
                        subjects: subjects.map(s => s.id === subjectId ? { ...subject, milestones: updatedMilestones } : s)
                    };
                }
            }
            return child;
        });

        localStorage.setItem('children', JSON.stringify(updatedChildren));
        setIsCompleted(!isCompleted);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{milestoneName}</h1>
                        <p className="text-xs text-gray-500">Rekod Perkembangan</p>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {/* Completion Toggle */}
                {subjectId !== 'quran-syllabus' && (
                    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                        <span className="font-medium text-gray-900">Status</span>
                        <button
                            onClick={toggleCompletion}
                            className={cn(
                                "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                                isCompleted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                            )}
                        >
                            {isCompleted ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Selesai</span>
                                </>
                            ) : (
                                <>
                                    <Circle className="h-4 w-4" />
                                    <span>Belum Selesai</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Add/Edit Log Form */}
                {isAdding ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <h3 className="mb-4 font-semibold text-gray-900">{editingLogId ? 'Kemaskini Rekod' : 'Tambah Rekod Baru'}</h3>
                        <form onSubmit={saveLog} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tarikh</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Progres</label>
                                <input
                                    type="text"
                                    value={formData.page}
                                    onChange={e => setFormData({ ...formData, page: e.target.value })}
                                    placeholder="Contoh: Ms 12 atau Ayat 1-5"
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-transparent py-4 text-gray-500 hover:border-primary hover:text-primary"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Tambah Rekod
                    </button>
                )}

                {/* Logs List */}
                <div className="space-y-4">
                    {logs.length === 0 && !isAdding && (
                        <p className="text-center text-sm text-gray-500 py-8">Tiada rekod lagi.</p>
                    )}

                    {logs.map((log) => (
                        <div key={log.id} className="relative rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => startEdit(log)}
                                        className="text-gray-400 hover:text-blue-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {log.page && (
                                <div className="mb-2 inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                    {log.page}
                                </div>
                            )}

                            {log.notes && (
                                <p className="text-gray-800 whitespace-pre-wrap">{log.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
