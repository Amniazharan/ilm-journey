import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Edit2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function Settings() {
    const navigate = useNavigate();
    const { fetchChildren, addChild, updateChild, deleteChild, loading: dataLoading } = useSupabaseData();
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
        loadChildren();
    }, [fetchChildren]);

    const loadChildren = async () => {
        const data = await fetchChildren();
        setChildren(data);
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        try {
            // Map frontend field names to database field names
            const childData = {
                name: newChild.name,
                gender: newChild.gender,
                dob: newChild.dob,
                quran_enabled: newChild.quranEnabled
            };
            console.log('Sending child data:', childData);
            const child = await addChild(childData);
            if (child) {
                setChildren([...children, child]);
                setNewChild({ name: '', gender: 'male', dob: '', quranEnabled: false });
                setIsAdding(false);
            }
        } catch (error) {
            console.error('Failed to add child:', error);
            console.error('Error details:', error.message, error.details, error.hint);
            alert(`Gagal menambah anak: ${error.message}`);
        }
    };

    const handleDeleteChild = async (id) => {
        if (confirm('Adakah anda pasti mahu memadam data anak ini?')) {
            try {
                await deleteChild(id);
                setChildren(children.filter(c => c.id !== id));
            } catch (error) {
                console.error('Failed to delete child:', error);
                alert('Gagal memadam anak.');
            }
        }
    };

    const toggleQuran = async (child) => {
        try {
            const updated = await updateChild(child.id, { quran_enabled: !child.quran_enabled });
            if (updated) {
                setChildren(children.map(c => c.id === child.id ? updated : c));
            }
        } catch (error) {
            console.error('Failed to toggle Quran:', error);
            alert('Gagal mengemaskini status Quran.');
        }
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

    const handleUpdateChild = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateChild(editingChildId, {
                name: editFormData.name,
                gender: editFormData.gender,
                dob: editFormData.dob
            });

            if (updated) {
                setChildren(children.map(c => c.id === editingChildId ? updated : c));
                setEditingChildId(null);
            }
        } catch (error) {
            console.error('Failed to update child:', error);
            alert('Gagal mengemaskini maklumat anak.');
        }
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
                                    disabled={dataLoading}
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {dataLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Simpan'}
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
                    {dataLoading && children.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        children.map(child => (
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
                                                disabled={dataLoading}
                                                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {dataLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Simpan'}
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
                                                onClick={() => toggleQuran(child)}
                                                className={cn(
                                                    "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                                                    child.quran_enabled
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {child.quran_enabled ? 'Quran: ON' : 'Quran: OFF'}
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
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}
