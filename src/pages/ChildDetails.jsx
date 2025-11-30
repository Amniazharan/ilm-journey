import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle, Circle, ChevronRight, Edit2, X, Save, Settings, Copy, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import QuranSyllabus from '../components/QuranSyllabus';
import { useSupabaseData } from '../hooks/useSupabaseData';

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
        loading
    } = useSupabaseData();

    const [child, setChild] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [allChildren, setAllChildren] = useState([]);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [expandedSubject, setExpandedSubject] = useState(null);

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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                {/* Quran Syllabus */}
                {child.quran_enabled && (
                    <section>
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Hafalan Al-Quran</h2>
                        <QuranSyllabus childId={id} />
                    </section>
                )}

                {/* Custom Subjects */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Subjek Lain</h2>

                    {loading && subjects.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {subjects.map(subject => (
                                <div key={subject.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                                        {editingSubjectId === subject.id ? (
                                            <div className="flex flex-1 items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={editSubjectName}
                                                    onChange={e => setEditSubjectName(e.target.value)}
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => saveEditSubject(subject.id)}
                                                    className="rounded-lg bg-primary p-2 text-white hover:bg-primary/90"
                                                >
                                                    <Save className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingSubjectId(null)}
                                                    className="rounded-lg bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                                                    className="flex-1 text-left font-semibold text-gray-800"
                                                >
                                                    {subject.name}
                                                </button>
                                                {isEditMode && (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => startEditSubject(subject)}
                                                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSubject(subject.id)}
                                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {expandedSubject === subject.id && (
                                        <div className="p-4 space-y-3">
                                            {subject.milestones?.map(milestone => (
                                                <div key={milestone.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                                    {editingMilestoneId === milestone.id ? (
                                                        <div className="flex flex-1 items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={editMilestoneDesc}
                                                                onChange={e => setEditMilestoneDesc(e.target.value)}
                                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => saveEditMilestone(subject.id, milestone.id)}
                                                                className="rounded-lg bg-primary p-2 text-white hover:bg-primary/90"
                                                            >
                                                                <Save className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingMilestoneId(null)}
                                                                className="rounded-lg bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/child/${id}/subject/${subject.id}/milestone/${milestone.id}`)}
                                                                className="flex-1 text-left text-sm font-medium text-gray-700"
                                                            >
                                                                {milestone.description}
                                                            </button>
                                                            <div className="flex items-center space-x-2">
                                                                {isEditMode && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => startEditMilestone(milestone)}
                                                                            className="text-blue-500 hover:text-blue-600"
                                                                        >
                                                                            <Edit2 className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteMilestone(subject.id, milestone.id)}
                                                                            className="text-red-500 hover:text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Milestone */}
                                            {addingMilestoneToSubject === subject.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={newMilestoneDesc}
                                                        onChange={e => setNewMilestoneDesc(e.target.value)}
                                                        placeholder="Milestone baru..."
                                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleAddMilestone(subject.id)}
                                                        className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90"
                                                    >
                                                        Tambah
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAddingMilestoneToSubject(null);
                                                            setNewMilestoneDesc('');
                                                        }}
                                                        className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-300"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddingMilestoneToSubject(subject.id)}
                                                    className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-2 text-sm text-gray-500 hover:border-primary hover:text-primary"
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Tambah Milestone
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add Subject */}
                            {isAddingSubject ? (
                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                    <h3 className="mb-3 font-semibold text-gray-900">Tambah Subjek Baru</h3>
                                    <form onSubmit={handleAddSubject} className="space-y-3">
                                        <input
                                            type="text"
                                            value={newSubjectName}
                                            onChange={e => setNewSubjectName(e.target.value)}
                                            placeholder="Nama subjek..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            autoFocus
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Simpan'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSubject(false)}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>

                                    {/* Duplicate from other children */}
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="mb-2 text-sm font-medium text-gray-700">Atau duplikasi dari:</h4>
                                        <div className="max-h-40 space-y-2 overflow-y-auto">
                                            {getAvailableSubjects().map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleDuplicateSubject(s)}
                                                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-2 text-left hover:bg-gray-50"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                                        <p className="text-xs text-gray-500">{s.childName}</p>
                                                    </div>
                                                    <Copy className="h-4 w-4 text-gray-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingSubject(true)}
                                    className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-4 text-gray-500 hover:border-primary hover:text-primary"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Tambah Subjek
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
