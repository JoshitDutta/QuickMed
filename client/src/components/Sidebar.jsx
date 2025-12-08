import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Receipt,
    Truck,
    LogOut,
    HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/inventory', label: 'Inventory', icon: <Package size={20} /> },
        { path: '/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
        { path: '/billing', label: 'Billing', icon: <Receipt size={20} /> },

    ];

    return (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-10 shadow-sm">
            <div className="p-6 flex items-center space-x-3 border-b border-gray-50">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg shadow-md">
                    <HeartPulse size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        QuickMed
                    </h1>
                    <p className="text-xs text-gray-400 font-medium">Pharmacy System</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm font-semibold'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <div className="group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-700 truncate">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate capitalize">{user?.role || 'Staff'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-300 shadow-sm"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
