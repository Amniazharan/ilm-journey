import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Kata laluan tidak sepadan');
        }

        setLoading(true);

        try {
            const { error } = await signUp({ email, password });
            if (error) throw error;
            // Redirect to login or a "check email" page. 
            // Since we have an approval system, maybe redirect to a "Pending" page or Login with message.
            alert('Pendaftaran berjaya! Sila tunggu kelulusan admin.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">Ilm Journey</h1>
                    <p className="mt-2 text-gray-600">Daftar akaun baru</p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Emel</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kata Laluan</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sahkan Kata Laluan</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Daftar'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Sudah mempunyai akaun?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                        Log masuk
                    </Link>
                </div>
            </div>
        </div>
    );
}
