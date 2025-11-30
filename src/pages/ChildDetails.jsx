import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Settings, BookOpen,
    ChevronRight, Copy, X, Save, Edit2, CheckCircle, Loader2
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { cn } from '../lib/utils';
import QuranSyllabus from '../components/QuranSyllabus';

export default function ChildDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        fetchChildren,
        fetchSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        fetchCompletionStatus,
        loading
    } = useSupabaseData();

    const [child, setChild] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [allChildren, setAllChildren] = useState([]);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [completedMilestones, setCompletedMilestones] = useState({});

    // Edit states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState(null);
    const [editSubjectName, setEditSubjectName] = useState('');
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [editMilestoneDesc, setEditMilestoneDesc] = useState('');

    // Milestone add states
    const [addingMilestoneToSubject, setAddingMilestoneToSubject] = useState(null);
    const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        const children = await fetchChildren();
        setAllChildren(children);
        const foundChild = children.find(c => c.id === id);
        if (foundChild) {
            setChild(foundChild);
            const subjectsData = await fetchSubjects(id);
            setSubjects(subjectsData);

            // Fetch completion status
            const completedLogs = await fetchCompletionStatus(id);
            const statusMap = {};
            completedLogs.forEach(log => {
                if (log.milestone_id) {
                    statusMap[log.milestone_id] = true;
                }
            });
            setCompletedMilestones(statusMap);
        } else {
            navigate('/dashboard');
        }
    };

    // Subject CRUD
    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        try {
            const newSubject = await addSubject({
                child_id: id,
                name: newSubjectName
            });
            if (newSubject) {
                setSubjects([...subjects, { ...newSubject, milestones: [] }]);
                setNewSubjectName('');
                setIsAddingSubject(false);
            }
        } catch (error) {
            console.error('Failed to add subject:', error);
            alert('Gagal menambah subjek.');
        }
    };

    const handleDuplicateSubject = async (sourceSubject) => {
        try {
            const newSubject = await addSubject({
                child_id: id,
                name: sourceSubject.name
            });

            if (newSubject && sourceSubject.milestones?.length > 0) {
                // Add milestones
                for (const m of sourceSubject.milestones) {
                    await addMilestone({
                        subject_id: newSubject.id,
                        description: m.description
                    });
                }
                // Reload subjects to get updated data
                const subjectsData = await fetchSubjects(id);
                setSubjects(subjectsData);
            } else if (newSubject) {
                setSubjects([...subjects, { ...newSubject, milestones: [] }]);
            }
            setIsAddingSubject(false);
        } catch (error) {
            console.error('Failed to duplicate subject:', error);
            alert('Gagal menduplikasi subjek.');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!confirm('Padam subjek ini? Semua data akan hilang.')) return;
        try {
            await deleteSubject(subjectId);
            setSubjects(subjects.filter(s => s.id !== subjectId));
        } catch (error) {
            console.error('Failed to delete subject:', error);
            alert('Gagal memadam subjek.');
        }
    };

    const startEditSubject = (subject) => {
        setEditingSubjectId(subject.id);
        setEditSubjectName(subject.name);
    };

    const saveEditSubject = async (subjectId) => {
        if (!editSubjectName.trim()) return;
        try {
            await updateSubject(subjectId, { name: editSubjectName });
            setSubjects(subjects.map(s =>
                s.id === subjectId ? { ...s, name: editSubjectName } : s
            ));
            setEditingSubjectId(null);
        } catch (error) {
            console.error('Failed to update subject:', error);
            alert('Gagal mengemaskini subjek.');
        }
    };

    // Milestone CRUD
    const handleAddMilestone = async (subjectId) => {
        if (!newMilestoneDesc.trim()) return;
        try {
            const milestone = await addMilestone({
                subject_id: subjectId,
                description: newMilestoneDesc
            });
            if (milestone) {
                setSubjects(subjects.map(s =>
                    s.id === subjectId
                        ? { ...s, milestones: [...(s.milestones || []), milestone] }
                        : s
                ));
                setNewMilestoneDesc('');
                setAddingMilestoneToSubject(null);
            }
        } catch (error) {
            console.error('Failed to add milestone:', error);
            alert('Gagal menambah milestone.');
        }
    };

    const handleDeleteMilestone = async (subjectId, milestoneId) => {
        if (!confirm('Padam milestone ini?')) return;
        try {
            await deleteMilestone(milestoneId);
            setSubjects(subjects.map(s =>
                s.id === subjectId
                    ? { ...s, milestones: s.milestones.filter(m => m.id !== milestoneId) }
                    : s
            ));
        } catch (error) {
            console.error('Failed to delete milestone:', error);
            alert('Gagal memadam milestone.');
        }
    };

    const startEditMilestone = (milestone) => {
        setEditingMilestoneId(milestone.id);
        setEditMilestoneDesc(milestone.description);
    };

    const saveEditMilestone = async (subjectId, milestoneId) => {
        if (!editMilestoneDesc.trim()) return;
        try {
            await updateMilestone(milestoneId, { description: editMilestoneDesc });
            setSubjects(subjects.map(s =>
                s.id === subjectId
                    ? {
                        ...s,
                        milestones: s.milestones.map(m =>
                            m.id === milestoneId ? { ...m, description: editMilestoneDesc } : m
                        )
                    }
                    : s
            ));
            setEditingMilestoneId(null);
        } catch (error) {
            console.error('Failed to update milestone:', error);
            alert('Gagal mengemaskini milestone.');
        }
    };

    // Get available subjects for duplication
    const getAvailableSubjects = () => {
        const availableSubjects = [];
        allChildren.forEach(c => {
            (c.subjects || []).forEach(s => {
                if (!s.isSystem) {
                    availableSubjects.push({
                        ...s,
                        childName: c.name,
                        childId: c.id
                    });
                }
            });
        });
        return availableSubjects;
    };

    if (!child) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 -ml-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">{child?.name}</h1>
                                <p className="text-xs font-medium text-slate-500">Silibus & Perkembangan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                isEditMode
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {isEditMode ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Selesai</span>
                                </>
                            ) : (
                                <>
                                    <Settings className="h-4 w-4" />
                                    <span>Urus</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Quran Syllabus Section */}
                {child.quran_enabled && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Hafalan Al-Quran</h2>
                        </div>
                        <QuranSyllabus childId={id} />
                    </section>
                )}

                {/* Custom Subjects Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Copy className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Subjek Lain</h2>
                        </div>
                    </div>

                    {loading && subjects.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subjects.map(subject => (
                                <div
                                    key={subject.id}
                                    className={cn(
                                        "group relative flex flex-col bg-white rounded-2xl border transition-all duration-200",
                                        expandedSubject === subject.id
                                            ? "border-indigo-200 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100"
                                            : "border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100"
                                    )}
                                >
                                    {/* Subject Header */}
                                    <div className="p-5 flex items-start justify-between gap-4">
                                        {editingSubjectId === subject.id ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editSubjectName}
                                                    onChange={e => setEditSubjectName(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                                                    autoFocus
                                                />
                                                <button onClick={() => saveEditSubject(subject.id)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                                    <Save className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setEditingSubjectId(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-slate-900 truncate">{subject.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {subject.milestones?.length || 0} milestone
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1">
                                            {isEditMode ? (
                                                <>
                                                    <button onClick={() => startEditSubject(subject)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteSubject(subject.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        expandedSubject === subject.id
                                                            ? "bg-indigo-50 text-indigo-600"
                                                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                    )}
                                                >
                                                    {expandedSubject === subject.id ? (
                                                        <ChevronRight className="h-5 w-5 rotate-90 transition-transform" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5 transition-transform" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Milestones List */}
                                    {expandedSubject === subject.id && (
                                        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1">
                                                {subject.milestones?.map(milestone => {
                                                    const isCompleted = completedMilestones[milestone.id];
                                                    return (
                                                        <div
                                                            key={milestone.id}
                                                            className={cn(
                                                                "group/item flex items-center justify-between p-3 rounded-xl border transition-all",
                                                                isCompleted
                                                                    ? "bg-emerald-50 border-emerald-100"
                                                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                                                            )}
                                                        >
                                                            {editingMilestoneId === milestone.id ? (
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editMilestoneDesc}
                                                                        onChange={e => setEditMilestoneDesc(e.target.value)}
                                                                        className="flex-1 px-3 py-1.5 rounded-lg border border-indigo-200 text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <button onClick={() => saveEditMilestone(subject.id, milestone.id)} className="p-1.5 bg-indigo-600 text-white rounded-md">
                                                                        <Save className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => navigate(`/child/${id}/subject/${subject.id}/milestone/${milestone.id}`)}
                                                                    className="flex-1 text-left flex items-center gap-2"
                                                                >
                                                                    <span className={cn(
                                                                        "text-sm font-medium transition-colors",
                                                                        isCompleted ? "text-emerald-800" : "text-slate-700 group-hover/item:text-indigo-700"
                                                                    )}>
                                                                        {milestone.description}
                                                                    </span>
                                                                    {isCompleted && (
                                                                        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 shadow-sm">
                                                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                                            <span className="text-xs font-bold text-emerald-700">Selesai</span>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            )}

                                                            <div className="flex items-center gap-1 ml-2">
                                                                {isEditMode ? (
                                                                    <>
                                                                        <button onClick={() => startEditMilestone(milestone)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md">
                                                                            <Edit2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteMilestone(subject.id, milestone.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover/item:text-indigo-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Add Milestone Input */}
                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                {addingMilestoneToSubject === subject.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={newMilestoneDesc}
                                                            onChange={e => setNewMilestoneDesc(e.target.value)}
                                                            placeholder="Nama milestone..."
                                                            className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleAddMilestone(subject.id)} className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                                                            Tambah
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAddingMilestoneToSubject(null);
                                                                setNewMilestoneDesc('');
                                                            }}
                                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAddingMilestoneToSubject(subject.id)}
                                                        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-dashed border-slate-200 hover:border-indigo-200 transition-all"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Tambah Milestone
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add Subject Card */}
                            <div className={cn(
                                "flex flex-col rounded-2xl border-2 border-dashed transition-all duration-200",
                                isAddingSubject
                                    ? "bg-white border-indigo-200 shadow-lg shadow-indigo-50 ring-1 ring-indigo-100 col-span-1 md:col-span-2"
                                    : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                            )}>
                                {isAddingSubject ? (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-bold text-slate-900">Tambah Subjek Baru</h3>
                                            <button onClick={() => setIsAddingSubject(false)} className="text-slate-400 hover:text-slate-600">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleAddSubject} className="flex gap-3 mb-6">
                                            <input
                                                type="text"
                                                value={newSubjectName}
                                                onChange={e => setNewSubjectName(e.target.value)}
                                                placeholder="Contoh: Matematik, Sains..."
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading || !newSubjectName.trim()}
                                                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                                            >
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Simpan'}
                                            </button>
                                        </form>

                                        {/* Duplicate Section */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atau salin dari adik-beradik lain</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {getAvailableSubjects().map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleDuplicateSubject(s)}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-slate-700 group-hover:text-indigo-700">{s.name}</p>
                                                            <p className="text-xs text-slate-500">dari {s.childName}</p>
                                                        </div>
                                                        <Copy className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                                                    </button>
                                                ))}
                                                {getAvailableSubjects().length === 0 && (
                                                    <p className="text-sm text-slate-400 italic col-span-full">Tiada subjek untuk disalin.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingSubject(true)}
                                        className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <span className="font-medium">Tambah Subjek</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
