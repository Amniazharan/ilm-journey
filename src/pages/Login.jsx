import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Lock } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login - accept any pin for now or check specific one
        if (pin.length >= 4) {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Ilm Journey
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masukkan PIN untuk akses dashboard ibu bapa
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="pin" className="sr-only">
                            PIN
                        </label>
                        <input
                            id="pin"
                            name="pin"
                            type="password"
                            inputMode="numeric"
                            required
                            className={cn(
                                "block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "transition-all duration-200"
                            )}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
                    >
                        Log Masuk
                    </button>
                </form>
            </div >
        </div >
    );
}
