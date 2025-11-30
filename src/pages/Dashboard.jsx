import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings as SettingsIcon, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { fetchChildren, loading } = useSupabaseData();
    const [children, setChildren] = useState([]);

    useEffect(() => {
        const loadChildren = async () => {
            const data = await fetchChildren();
            setChildren(data);
        };
        loadChildren();
    }, [fetchChildren]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Ilm Journey</h1>
                        <p className="text-sm text-gray-500">Pantau Perkembangan Ilmu Anak</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link to="/settings" className="rounded-full p-2 hover:bg-slate-100">
                            <SettingsIcon className="h-6 w-6 text-gray-600" />
                        </Link>
                        <button onClick={handleLogout} className="rounded-full p-2 hover:bg-slate-100 text-red-500">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : children.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-slate-100 p-6">
                            <User className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Tiada Anak Ditambah</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Mula dengan menambah profil anak anda.
                        </p>
                        <Link
                            to="/settings"
                            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Anak
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {children.map((child) => (
                            <Link
                                key={child.id}
                                to={`/child/${child.id}`}
                                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white",
                                            child.gender === 'male' ? "bg-blue-500" : "bg-pink-500"
                                        )}>
                                            {child.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{child.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {child.gender === 'male' ? 'Lelaki' : 'Perempuan'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 top-0 rounded-bl-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                        {calculateAge(child.dob)} Tahun
                                    </div>
                                </div>
                            </Link>
                        ))}

                        <Link
                            to="/settings"
                            className="flex min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-transparent p-6 text-gray-400 hover:border-primary hover:text-primary active:scale-[0.98]"
                        >
                            <Plus className="mb-2 h-6 w-6" />
                            <span className="text-sm font-medium">Tambah Anak</span>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
