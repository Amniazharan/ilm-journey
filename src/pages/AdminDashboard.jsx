import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Check, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch all profiles that are NOT approved yet
            // Note: In a real app with thousands of users, you'd want pagination
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_approved', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Gagal mengambil senarai pengguna.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', userId);

            if (error) throw error;

            // Remove from local state
            setUsers(users.filter(u => u.id !== userId));
            alert('Pengguna berjaya diluluskan.');
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Gagal meluluskan pengguna.');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Keluar
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-lg font-semibold text-gray-900">Permohonan Pendaftaran ({users.length})</h2>

                    {users.length === 0 ? (
                        <p className="text-center text-gray-500">Tiada permohonan baru.</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Emel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tarikh Daftar</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                                                >
                                                    <Check className="mr-1 h-3 w-3" />
                                                    Luluskan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
