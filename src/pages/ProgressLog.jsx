import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Trash2, Edit2, Loader2, CheckCircle } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function ProgressLog() {
    // FIX: Destructure 'id' from params and rename to 'childId' to match route definition
    const { id: childId, subjectId, milestoneId } = useParams();
    const navigate = useNavigate();
    const { fetchLogs, addLog, deleteLog, loading } = useSupabaseData();

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
        loadLogs();
        // Set milestone name from URL (for Quran syllabus) or fetch from DB
        if (subjectId === 'quran-syllabus') {
            setMilestoneName(decodeURIComponent(milestoneId));
        } else {
            // For regular milestones, we'll just use the ID for now
            // In a real app, you might want to fetch the milestone details
            setMilestoneName(`Milestone ${milestoneId.substring(0, 8)}`);
        }
    }, [childId, subjectId, milestoneId]);

    const loadLogs = async () => {
        const data = await fetchLogs(subjectId, milestoneId, childId);
        setLogs(data);
        // Check if completed
        const completedLog = data.find(l => l.page === 'SELESAI');
        setIsCompleted(!!completedLog);
    };

    const toggleCompletion = async () => {
        if (isCompleted) {
            // Find the completion log and delete it
            const completedLog = logs.find(l => l.page === 'SELESAI');
            if (completedLog) {
                if (!confirm('Tanda sebagai belum selesai?')) return;
                try {
                    await deleteLog(completedLog.id);
                    setLogs(logs.filter(l => l.id !== completedLog.id));
                    setIsCompleted(false);
                } catch (error) {
                    console.error('Failed to unmark completion:', error);
                    alert('Gagal mengemaskini status.');
                }
            }
        } else {
            // Add completion log
            if (!confirm('Tanda sebagai selesai?')) return;
            try {
                const logData = {
                    subject_id: subjectId === 'quran-syllabus' ? null : subjectId,
                    milestone_id: subjectId === 'quran-syllabus' ? null : milestoneId,
                    milestone_name: subjectId === 'quran-syllabus' ? decodeURIComponent(milestoneId) : null,
                    child_id: childId,
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Telah selesai menghafal.',
                    page: 'SELESAI'
                };
                const newLog = await addLog(logData);
                if (newLog) {
                    setLogs([newLog, ...logs]);
                    setIsCompleted(true);
                }
            } catch (error) {
                console.error('Failed to mark completion:', error);
                alert('Gagal menanda selesai.');
            }
        }
    };

    const saveLog = async (e) => {
        e.preventDefault();
        try {
            const logData = {
                subject_id: subjectId === 'quran-syllabus' ? null : subjectId,
                milestone_id: subjectId === 'quran-syllabus' ? null : milestoneId,
                milestone_name: subjectId === 'quran-syllabus' ? decodeURIComponent(milestoneId) : null,
                child_id: childId, // IMPORTANT: Link to specific child
                date: formData.date,
                notes: formData.notes || null,
                page: formData.page || null
            };

            console.log('Saving log with data:', logData);
            const newLog = await addLog(logData);
            if (newLog) {
                setLogs([newLog, ...logs]);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save log:', error);
            console.error('Error details:', error.message, error.code, error.details);
            alert(`Gagal menyimpan rekod: ${error.message}`);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm('Padam rekod ini?')) return;
        try {
            await deleteLog(logId);
            const updatedLogs = logs.filter(l => l.id !== logId);
            setLogs(updatedLogs);
            // Re-check completion status in case the deleted log was the completion log
            const completedLog = updatedLogs.find(l => l.page === 'SELESAI');
            setIsCompleted(!!completedLog);
        } catch (error) {
            console.error('Failed to delete log:', error);
            alert('Gagal memadam rekod.');
        }
    };

    const startEdit = (log) => {
        setFormData({
            date: log.date,
            notes: log.notes || '',
            page: log.page || ''
        });
        setEditingLogId(log.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingLogId(null);
        setFormData({ date: new Date().toISOString().split('T')[0], notes: '', page: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100">
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{milestoneName}</h1>
                            <p className="text-xs text-gray-500">Rekod Perkembangan</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleCompletion}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Selesai</span>
                            </>
                        ) : (
                            <span>Tanda Selesai</span>
                        )}
                    </button>
                </div>
            </header>

            <main className="p-6 space-y-6">
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
                                    disabled={loading}
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Simpan'}
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
                    {loading && logs.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 && !isAdding ? (
                        <p className="text-center text-sm text-gray-500 py-8">Tiada rekod lagi.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className={`relative rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${log.page === 'SELESAI' ? 'bg-green-50 border border-green-100' : 'bg-white'}`}>
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
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {log.page && (
                                    <div className={`mb-2 inline-block rounded-md px-2 py-1 text-xs font-semibold ${log.page === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {log.page}
                                    </div>
                                )}

                                {log.notes && (
                                    <p className="text-gray-800 whitespace-pre-wrap">{log.notes}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
