import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut, ChevronDown, AlertTriangle, Calendar, Activity, Tag, ShoppingBag, Truck } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
    const notificationRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ medicines: [], orders: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const [lowStockRes, expiringRes] = await Promise.all([
                    api.get('/medicines?filterLowStock=true&limit=10'),
                    api.get(`/medicines?expiryStart=${new Date().toISOString()}&expiryEnd=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}&limit=10`)
                ]);
                setAlerts({
                    lowStock: lowStockRes.data.medicines,
                    expiring: expiringRes.data.medicines
                });
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            }
        };
        fetchAlerts();
    }, []);
    const totalAlerts = alerts.lowStock.length + alerts.expiring.length;
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                setShowSearchDropdown(true);
                try {
                    const [medsRes, ordersRes] = await Promise.all([
                        api.get(`/medicines?search=${searchQuery}&limit=3`),
                        api.get(`/orders?search=${searchQuery}&limit=3`)
                    ]);
                    setSearchResults({
                        medicines: medsRes.data.medicines || [],
                        orders: ordersRes.data.orders || []
                    });
                } catch (error) {
                    console.error("Global search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ medicines: [], orders: [] });
                setShowSearchDropdown(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);
    const handleSearchResultClick = (type, item) => {
        setSearchQuery('');
        setShowSearchDropdown(false);
        switch (type) {
            case 'medicine':
                navigate(`/inventory?search=${item.name}`); 
                break;
            case 'order':
                navigate(`/orders?search=${item.order_id || item.customer_name}`);
                break;
            default:
                break;
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const handleAlertClick = (type) => {
        setNotificationsOpen(false);
        if (type === 'lowStock') {
            navigate('/inventory?filterLowStock=true');
        } else if (type === 'expiring') {
            navigate('/inventory');
        }
    };
    return (
        <header className="flex justify-between items-center bg-white p-6 shadow-sm border-b border-gray-100 z-20 relative">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center gap-6">
                {}
                <div className="hidden md:flex relative items-center" ref={searchRef}>
                    <Search className="absolute left-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Global Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 w-80 transition-all shadow-sm focus:shadow-md"
                    />
                    {}
                    {showSearchDropdown && (
                        <div className="absolute top-12 left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                            {isSearching ? (
                                <div className="p-4 text-center text-gray-400 text-xs">Searching...</div>
                            ) : (
                                <>
                                    {}
                                    {searchResults.medicines.length > 0 && (
                                        <div className="p-2">
                                            <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory</p>
                                            {searchResults.medicines.map(item => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => handleSearchResultClick('medicine', item)}
                                                    className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2 group"
                                                >
                                                    <div className="bg-indigo-50 p-1.5 rounded-md text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                                        <Tag size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 truncate">{item.category}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {}
                                    {searchResults.orders.length > 0 && (
                                        <div className="p-2 border-t border-gray-50">
                                            <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</p>
                                            {searchResults.orders.map(item => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => handleSearchResultClick('order', item)}
                                                    className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-2 group"
                                                >
                                                    <div className="bg-purple-50 p-1.5 rounded-md text-purple-600 group-hover:bg-purple-100 transition-colors">
                                                        <ShoppingBag size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-700 truncate">#{item.order_id.slice(-6).toUpperCase()} - {item.customer_name}</p>
                                                        <p className="text-[10px] text-gray-400">₹{item.total_amount}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {}
                                    {Object.values(searchResults).every(arr => arr.length === 0) && (
                                        <div className="p-4 text-center text-gray-400 text-xs">
                                            No results found.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
                {}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-500 hover:text-indigo-600"
                    >
                        <Bell size={22} />
                        {totalAlerts > 0 && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    {}
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                            <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{totalAlerts} New</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {totalAlerts === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                        No new notifications
                                    </div>
                                ) : (
                                    <>
                                        {}
                                        {alerts.lowStock.length > 0 && (
                                            <div className="p-2">
                                                <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Low Stock</p>
                                                {alerts.lowStock.map(item => (
                                                    <div key={item._id} onClick={() => handleAlertClick('lowStock')} className="p-3 hover:bg-red-50 rounded-xl cursor-pointer transition-colors flex gap-3 group">
                                                        <div className="bg-red-100 p-2 rounded-lg h-fit group-hover:bg-red-200 transition-colors">
                                                            <Activity size={16} className="text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800 group-hover:text-red-700">{item.name}</p>
                                                            <p className="text-xs text-red-500 font-semibold">{item.quantity} remaining</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {}
                                        {alerts.expiring.length > 0 && (
                                            <div className="p-2 border-t border-gray-50">
                                                <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Expiring Soon</p>
                                                {alerts.expiring.map(item => (
                                                    <div key={item._id} onClick={() => handleAlertClick('expiring')} className="p-3 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors flex gap-3 group">
                                                        <div className="bg-orange-100 p-2 rounded-lg h-fit group-hover:bg-orange-200 transition-colors">
                                                            <Calendar size={16} className="text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800 group-hover:text-orange-700">{item.name}</p>
                                                            <p className="text-xs text-orange-500 font-semibold">{new Date(item.expiry_date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.username}</p>
                        <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wide">{user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;
