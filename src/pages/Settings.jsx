import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newChild, setNewChild] = useState({
        name: '',
        gender: 'male',
        dob: '',
        quranEnabled: false
    });

    // Edit State
    const [editingChildId, setEditingChildId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        gender: 'male',
        dob: ''
    });

    useEffect(() => {
        const storedChildren = localStorage.getItem('children');
        if (storedChildren) {
            setChildren(JSON.parse(storedChildren));
        }
    }, []);

    const saveChildren = (updatedChildren) => {
        setChildren(updatedChildren);
        localStorage.setItem('children', JSON.stringify(updatedChildren));
    };

    const handleAddChild = (e) => {
        e.preventDefault();
        const child = {
            ...newChild,
            id: crypto.randomUUID(),
            subjects: []
        };

        // Add Quran syllabus if enabled
        if (child.quranEnabled) {
            child.subjects.push({
                id: 'quran-syllabus',
                name: 'Hafalan Al-Quran',
                isSystem: true,
                milestones: [] // We'll populate this dynamically or structurally in the details view
            });
        }

        saveChildren([...children, child]);
        setNewChild({ name: '', gender: 'male', dob: '', quranEnabled: false });
        setIsAdding(false);
    };

    const handleDeleteChild = (id) => {
        if (confirm('Adakah anda pasti mahu memadam data anak ini?')) {
            saveChildren(children.filter(c => c.id !== id));
        }
    };

    const toggleQuran = (childId) => {
        const updated = children.map(c => {
            if (c.id === childId) {
                return { ...c, quranEnabled: !c.quranEnabled };
            }
            return c;
        });
        saveChildren(updated);
    };

    // Edit Handlers
    const handleEditClick = (child) => {
        setEditingChildId(child.id);
        setEditFormData({
            name: child.name,
            gender: child.gender,
            dob: child.dob
        });
    };

    const handleCancelEdit = () => {
        setEditingChildId(null);
        setEditFormData({ name: '', gender: 'male', dob: '' });
    };

    const handleUpdateChild = (e) => {
        e.preventDefault();
        const updatedChildren = children.map(c => {
            if (c.id === editingChildId) {
                return {
                    ...c,
                    name: editFormData.name,
                    gender: editFormData.gender,
                    dob: editFormData.dob
                };
            }
            return c;
        });
        saveChildren(updatedChildren);
        setEditingChildId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Tetapan</h1>
                </div>
            </header>

            <main className="p-6 space-y-8">
                {/* Add Child Section */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Tambah Anak</h2>

                    {isAdding ? (
                        <form onSubmit={handleAddChild} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={newChild.name}
                                    onChange={e => setNewChild({ ...newChild, name: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jantina</label>
                                    <select
                                        value={newChild.gender}
                                        onChange={e => setNewChild({ ...newChild, gender: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="male">Lelaki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tarikh Lahir</label>
                                    <input
                                        type="date"
                                        required
                                        value={newChild.dob}
                                        onChange={e => setNewChild({ ...newChild, dob: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="quran"
                                    checked={newChild.quranEnabled}
                                    onChange={e => setNewChild({ ...newChild, quranEnabled: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="quran" className="text-sm font-medium text-gray-700">
                                    Aktifkan Hafalan Al-Quran
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
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
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-4 text-gray-500 hover:border-primary hover:text-primary"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Tambah Anak Baru
                        </button>
                    )}
                </section>

                {/* Children List */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Senarai Anak</h2>
                    {children.map(child => (
                        <div key={child.id} className="rounded-xl bg-white p-4 shadow-sm">
                            {editingChildId === child.id ? (
                                <form onSubmit={handleUpdateChild} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                                        <input
                                            type="text"
                                            required
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Jantina</label>
                                            <select
                                                value={editFormData.gender}
                                                onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            >
                                                <option value="male">Lelaki</option>
                                                <option value="female">Perempuan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tarikh Lahir</label>
                                            <input
                                                type="date"
                                                required
                                                value={editFormData.dob}
                                                onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
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
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{child.name}</h3>
                                        <p className="text-sm text-gray-500">{new Date(child.dob).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleQuran(child.id)}
                                            className={cn(
                                                "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                                                child.quranEnabled
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {child.quranEnabled ? 'Quran: ON' : 'Quran: OFF'}
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(child)}
                                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChild(child.id)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
