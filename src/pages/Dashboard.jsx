import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings as SettingsIcon, User, LogOut, Trophy, Star, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { fetchChildren, fetchRecentAchievements, loading } = useSupabaseData();
    const [children, setChildren] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [childrenData, achievementsData] = await Promise.all([
                fetchChildren(),
                fetchRecentAchievements()
            ]);
            console.log('Achievements Data:', achievementsData);
            setChildren(childrenData);
            setAchievements(achievementsData);
            setIsLoading(false);
        };
        if (user) {
            loadData();
        }
    }, [user]);

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 18) return 'Selamat Petang';
        return 'Selamat Malam';
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200/60">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/pwa-192x192.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-sm" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Ilm Journey</h1>
                            <p className="text-xs font-medium text-slate-500">Pantau Perkembangan Ilmu Anak</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/settings" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <SettingsIcon className="h-5 w-5" />
                        </Link>
                        <button onClick={handleLogout} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Welcome Section */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{getGreeting()}, Ibu Bapa!</h2>
                    <p className="text-slate-500">Lihat perkembangan terkini anak-anak anda.</p>
                </section>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : children.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="mb-4 rounded-full bg-indigo-50 p-6">
                            <User className="h-12 w-12 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Tiada Anak Ditambah</h3>
                        <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                            Mula dengan menambah profil anak anda untuk memantau perkembangan mereka.
                        </p>
                        <Link
                            to="/settings"
                            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Tambah Anak
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Recent Achievements Section - Moved to Top */}
                        {achievements.length > 0 && (
                            <section className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Trophy className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Pencapaian Terkini</h2>
                                </div>

                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                    {achievements.map((achievement, idx) => {
                                        // Handle potential array or object for children
                                        const child = Array.isArray(achievement.children)
                                            ? achievement.children[0]
                                            : achievement.children;

                                        // Handle potential array or object for milestones
                                        const milestoneDesc = achievement.milestone_name ||
                                            (Array.isArray(achievement.milestones)
                                                ? achievement.milestones[0]?.description
                                                : achievement.milestones?.description);

                                        return (
                                            <div
                                                key={achievement.id}
                                                className={cn(
                                                    "p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors",
                                                    idx !== achievements.length - 1 && "border-b border-slate-100"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white",
                                                    child?.gender === 'male' ? "bg-blue-500" : "bg-pink-500"
                                                )}>
                                                    {child?.name?.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        <span className="font-bold">{child?.name || 'Anak'}</span> telah menyelesaikan
                                                    </p>
                                                    <p className="text-sm text-indigo-600 font-bold truncate">
                                                        {milestoneDesc || 'Satu Pencapaian'}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(achievement.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                                                        <Star className="h-3 w-3 fill-amber-600" />
                                                        Selesai
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Children Grid */}
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {children.map((child) => (
                                <Link
                                    key={child.id}
                                    to={`/child/${child.id}`}
                                    className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-100 hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md transition-transform group-hover:scale-110",
                                            child.gender === 'male'
                                                ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200"
                                                : "bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-200"
                                        )}>
                                            {child.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 border border-slate-100">
                                            {calculateAge(child.dob)} Tahun
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">{child.name}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            {child.gender === 'male' ? 'Anak Lelaki' : 'Anak Perempuan'}
                                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-indigo-400" />
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            <Link
                                to="/settings"
                                className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-slate-400 transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-600 group"
                            >
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-bold">Tambah Anak</span>
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
