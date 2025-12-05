import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, User, Mail, Lock, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Staff'); // Default role
    const { register, error, loading } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register({ name, email, password, role });
        if (success) {
            toast.success("Account created successfully!");
            navigate('/dashboard');
        } else {
            toast.error("Registration failed. Try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

            <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 transform transition-all duration-500 hover:scale-[1.01]">

                <div className="flex flex-col items-center mb-6">
                    <div className="bg-white/30 p-3 rounded-full mb-4 shadow-lg">
                        <HeartPulse size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
                    <p className="text-indigo-100 text-sm mt-2">Join QuickMed Workspace</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-indigo-100/70" size={20} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-indigo-100/70" size={20} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                            placeholder="Email Address"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-indigo-100/70" size={20} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                            placeholder="Password"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Briefcase className="absolute left-4 top-3.5 text-indigo-100/70" size={20} />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-12 py-3 text-white outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300 appearance-none cursor-pointer"
                        >
                            <option value="Staff" className="text-gray-800">Staff</option>
                            <option value="Owner" className="text-gray-800">Owner (Admin)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-indigo-100 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-white hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
