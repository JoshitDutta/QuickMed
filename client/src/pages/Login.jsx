import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Command, HeartPulse } from 'lucide-react';
import { useToast } from '../context/ToastContext';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            toast.success("Welcome back!");
            navigate('/dashboard');
        } else {
            toast.error("Invalid credentials or server error");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 transform transition-all duration-500 hover:scale-[1.01]">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white/30 p-3 rounded-full mb-4 shadow-lg animate-pulse">
                        <HeartPulse size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">QuickMed</h1>
                    <p className="text-indigo-100 text-sm mt-2">Pharmacy Management System</p>
                </div>
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-8 text-center space-y-2">
                    <p className="text-xs text-indigo-200">
                        Forgot credentials? Contact Administrator
                    </p>
                    <p className="text-sm text-indigo-100">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-white hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
