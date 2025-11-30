import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle, Circle, ChevronRight, Edit2, X, Save, Settings, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import QuranSyllabus from '../components/QuranSyllabus';

export default function ChildDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [child, setChild] = useState(null);
    const [allChildren, setAllChildren] = useState([]); // Store all children for duplication
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [expandedSubject, setExpandedSubject] = useState(null);

    // Edit states
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState(null);
    const [editSubjectName, setEditSubjectName] = useState('');
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [editMilestoneDesc, setEditMilestoneDesc] = useState('');

    useEffect(() => {
        const storedChildren = localStorage.getItem('children');
        if (storedChildren) {
            const children = JSON.parse(storedChildren);
            setAllChildren(children);
            const foundChild = children.find(c => c.id === id);
            if (foundChild) {
                setChild(foundChild);
            } else {
                navigate('/dashboard');
            }
        }
    }, [id, navigate]);

    const saveChild = (updatedChild) => {
        setChild(updatedChild);
        const storedChildren = JSON.parse(localStorage.getItem('children') || '[]');
        const updatedChildren = storedChildren.map(c => c.id === updatedChild.id ? updatedChild : c);
        localStorage.setItem('children', JSON.stringify(updatedChildren));
        setAllChildren(updatedChildren); // Update local allChildren as well
    };

    // Subject CRUD
    const handleAddSubject = (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        const newSubject = {
            id: crypto.randomUUID(),
            name: newSubjectName,
            milestones: []
        };

        saveChild({
            ...child,
            subjects: [...(child.subjects || []), newSubject]
        });
        setNewSubjectName('');
        setIsAddingSubject(false);
    };

    const handleDuplicateSubject = (sourceSubject) => {
        const newSubject = {
            id: crypto.randomUUID(),
            name: sourceSubject.name,
            milestones: (sourceSubject.milestones || []).map(m => ({
                id: crypto.randomUUID(),
                description: m.description,
                completed: false,
                date: null
            })),
            logs: {} // Don't copy logs
        };

        saveChild({
            ...child,
            subjects: [...(child.subjects || []), newSubject]
        });
        setIsAddingSubject(false);
    };

    const handleDeleteSubject = (subjectId) => {
        if (!confirm('Padam subjek ini? Semua data akan hilang.')) return;
        saveChild({
            ...child,
            subjects: child.subjects.filter(s => s.id !== subjectId)
        });
    };

    const startEditSubject = (subject) => {
        setEditingSubjectId(subject.id);
        setEditSubjectName(subject.name);
    };

    const saveEditSubject = (subjectId) => {
        if (!editSubjectName.trim()) return;
        const updatedSubjects = child.subjects.map(s =>
            s.id === subjectId ? { ...s, name: editSubjectName } : s
        );
        saveChild({ ...child, subjects: updatedSubjects });
        setEditingSubjectId(null);
    };

    // Milestone CRUD
    const handleAddMilestone = (subjectId, description) => {
        const updatedSubjects = child.subjects.map(s => {
            if (s.id === subjectId) {
                return {
                    ...s,
                    milestones: [...(s.milestones || []), {
                        id: crypto.randomUUID(),
                        description,
                        completed: false,
                        date: null
                    }]
                };
            }
            return s;
        });
        saveChild({ ...child, subjects: updatedSubjects });
    };

    const handleDeleteMilestone = (subjectId, milestoneId) => {
        if (!confirm('Padam milestone ini?')) return;
        const updatedSubjects = child.subjects.map(s => {
            if (s.id === subjectId) {
                return {
                    ...s,
                    milestones: s.milestones.filter(m => m.id !== milestoneId)
                };
            }
            return s;
        });
        saveChild({ ...child, subjects: updatedSubjects });
    };

    const startEditMilestone = (milestone) => {
        setEditingMilestoneId(milestone.id);
        setEditMilestoneDesc(milestone.description);
    };

    const saveEditMilestone = (subjectId, milestoneId) => {
        if (!editMilestoneDesc.trim()) return;
        const updatedSubjects = child.subjects.map(s => {
            if (s.id === subjectId) {
                return {
                    ...s,
                    milestones: s.milestones.map(m =>
                        m.id === milestoneId ? { ...m, description: editMilestoneDesc } : m
                    )
                };
            }
            return s;
        });
        saveChild({ ...child, subjects: updatedSubjects });
        setEditingMilestoneId(null);
    };

    // Get available subjects for duplication
    const getAvailableSubjects = () => {
        const subjects = [];
        allChildren.forEach(c => {
            // Don't exclude current child, user might want to duplicate their own subject structure
            (c.subjects || []).forEach(s => {
                if (!s.isSystem) { // Exclude system subjects like Quran
                    subjects.push({
                        ...s,
                        childName: c.name,
                        childId: c.id
                    });
                }
            });
        });
        return subjects;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-slate-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{child?.name}</h1>
                        <p className="text-xs text-gray-500">Silibus & Perkembangan</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        isEditMode
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    {isEditMode ? 'Selesai' : 'Ubah'}
                </button>
            </header>

            <main className="p-6 space-y-6">
                {/* Subjects List */}
                {(child?.subjects || []).map(subject => (
                    <div key={subject.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all">
                        {editingSubjectId === subject.id ? (
                            <div className="flex items-center space-x-2 p-4">
                                <input
                                    type="text"
                                    value={editSubjectName}
                                    onChange={(e) => setEditSubjectName(e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    autoFocus
                                />
                                <button onClick={() => saveEditSubject(subject.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                    <Save className="h-5 w-5" />
                                </button>
                                <button onClick={() => setEditingSubjectId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex cursor-pointer items-center justify-between bg-white p-5 hover:bg-gray-50"
                                onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                            >
                                <h3 className="font-bold text-gray-900">{subject.name}</h3>
                                <div className="flex items-center space-x-2">
                                    {isEditMode && !subject.isSystem && (
                                        <div className="flex items-center space-x-1 mr-2 animate-in fade-in slide-in-from-right-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEditSubject(subject); }}
                                                className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-full"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                                                className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    <ChevronRight className={cn("h-5 w-5 text-gray-400 transition-transform", expandedSubject === subject.id && "rotate-90")} />
                                </div>
                            </div>
                        )}

                        {expandedSubject === subject.id && (
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                {subject.id === 'quran-syllabus' ? (
                                    <QuranSyllabus
                                        childId={child.id}
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        {/* Milestones */}
                                        {(subject.milestones || []).map(milestone => (
                                            <div key={milestone.id} className="group flex items-center space-x-2">
                                                {editingMilestoneId === milestone.id ? (
                                                    <div className="flex flex-1 items-center space-x-2 rounded-lg bg-white p-2">
                                                        <input
                                                            type="text"
                                                            value={editMilestoneDesc}
                                                            onChange={(e) => setEditMilestoneDesc(e.target.value)}
                                                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => saveEditMilestone(subject.id, milestone.id)} className="text-green-600">
                                                            <Save className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setEditingMilestoneId(null)} className="text-red-600">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/child/${child.id}/subject/${subject.id}/milestone/${milestone.id}`)}
                                                            className="flex flex-1 items-center justify-between rounded-lg border border-gray-100 bg-white p-3 hover:bg-gray-50"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {milestone.completed ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <Circle className="h-5 w-5 text-gray-300" />
                                                                )}
                                                                <div className="text-left">
                                                                    <span className={cn("text-sm font-medium text-gray-700", milestone.completed && "line-through opacity-75")}>
                                                                        {milestone.description}
                                                                    </span>
                                                                    {milestone.completed && milestone.date && (
                                                                        <p className="text-xs text-green-600">
                                                                            Selesai: {new Date(milestone.date).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        </button>

                                                        {isEditMode && (
                                                            <div className="flex flex-col space-y-1 sm:flex-row sm:space-x-1 sm:space-y-0 animate-in fade-in slide-in-from-right-2">
                                                                <button
                                                                    onClick={() => startEditMilestone(milestone)}
                                                                    className="rounded bg-white p-2 text-gray-400 shadow-sm hover:text-blue-500"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMilestone(subject.id, milestone.id)}
                                                                    className="rounded bg-white p-2 text-gray-400 shadow-sm hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Milestone Input */}
                                        {isEditMode && (
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const input = e.target.elements.milestone;
                                                    if (input.value.trim()) {
                                                        handleAddMilestone(subject.id, input.value.trim());
                                                        input.value = '';
                                                    }
                                                }}
                                                className="mt-4 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2"
                                            >
                                                <input
                                                    name="milestone"
                                                    type="text"
                                                    placeholder="Tambah milestone baru..."
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                                                />
                                                <button
                                                    type="submit"
                                                    className="rounded-lg bg-primary p-2 text-white hover:bg-primary/90"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Subject Section - Only in Edit Mode */}
                {isEditMode && (
                    isAddingSubject ? (
                        <div className="rounded-2xl bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h3 className="mb-4 font-semibold text-gray-900">Tambah Subjek Baru</h3>

                            {/* Option 1: Create New */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Nama Subjek Baru</label>
                                <form onSubmit={handleAddSubject} className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                        placeholder="Contoh: Coding, Renang"
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:ring-primary"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                    >
                                        Tambah
                                    </button>
                                </form>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-sm text-gray-500">Atau duplicate dari sedia ada</span>
                                </div>
                            </div>

                            {/* Option 2: Duplicate Existing */}
                            <div className="space-y-3">
                                {getAvailableSubjects().length === 0 ? (
                                    <p className="text-center text-sm text-gray-500">Tiada subjek lain untuk diduplicate.</p>
                                ) : (
                                    getAvailableSubjects().map((s, idx) => (
                                        <button
                                            key={`${s.id}-${idx}`}
                                            onClick={() => handleDuplicateSubject(s)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 hover:border-primary hover:bg-blue-50 text-left transition-all"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{s.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Daripada: <span className="font-medium text-blue-600">{s.childName}</span>
                                                </p>
                                            </div>
                                            <Copy className="h-4 w-4 text-gray-400" />
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAddingSubject(false)}
                                className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingSubject(true)}
                            className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-transparent py-4 text-gray-500 hover:border-primary hover:text-primary animate-in fade-in"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Tambah Subjek
                        </button>
                    )
                )}
            </main>
        </div>
    );
}
