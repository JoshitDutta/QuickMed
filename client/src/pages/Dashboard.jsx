import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import api from '../api/axios';
import {
    Package,
    AlertTriangle,
    CalendarClock,
    IndianRupee,
    Activity,
    ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStockCount: 0,
        expiringSoonCount: 0,
        todaysSales: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [expiringItems, setExpiringItems] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, lowStockRes, ordersRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/medicines?filterLowStock=true&limit=5'),
                    api.get('/orders?limit=5')
                ]);

                setStats(statsRes.data);
                setLowStockItems(lowStockRes.data.medicines);
                setRecentOrders(ordersRes.data.orders);

                // Expiring
                const today = new Date();
                const thirtyDays = new Date();
                thirtyDays.setDate(today.getDate() + 30);
                const expiryRes = await api.get(`/medicines?expiryStart=${today.toISOString()}&expiryEnd=${thirtyDays.toISOString()}&limit=5`);
                setExpiringItems(expiryRes.data.medicines);

            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex bg-gray-50 h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title="Dashboard Overview" />

                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Medicines"
                            value={stats.totalMedicines}
                            icon={<Package size={24} className="text-white" />}
                            gradient="from-blue-500 to-cyan-500"
                            onClick={() => navigate('/inventory')}
                        />
                        <StatsCard
                            title="Low Stock Alerts"
                            value={stats.lowStockCount}
                            icon={<AlertTriangle size={24} className="text-white" />}
                            gradient="from-orange-500 to-red-500"
                            trend="Action Needed"
                            onClick={() => navigate('/inventory?filterLowStock=true')}
                        />
                        <StatsCard
                            title="Expiring Soon"
                            value={stats.expiringSoonCount}
                            icon={<CalendarClock size={24} className="text-white" />}
                            gradient="from-purple-500 to-pink-500"
                            onClick={() => navigate('/inventory?filterExpiring=true')}
                        />
                        <StatsCard
                            title="Monthly Revenue"
                            value={`₹${stats.monthlyRevenue.toFixed(2)}`}
                            icon={<IndianRupee size={24} className="text-white" />}
                            gradient="from-emerald-500 to-teal-500"
                            trend="This Month"
                            onClick={() => navigate('/orders?filterMonth=current')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Orders - Spans 2 cols */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg">
                                        <ShoppingBag size={20} className="text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                                </div>
                                <button onClick={() => navigate('/orders')} className="text-sm text-indigo-600 hover:underline">View All</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Order ID</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Customer</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Items</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentOrders.length > 0 ? (
                                            recentOrders.map(order => (
                                                <tr key={order._id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{order.order_id.split('-')[1]}...</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{order.customer_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} items</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-800">₹{order.total_amount.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' :
                                                            order.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            {order.payment_status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No recent orders.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Alerts Column */}
                        <div className="space-y-6">
                            {/* Low Stock */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <Activity size={20} className="text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Critical Stock</h3>
                                </div>
                                <div className="space-y-3">
                                    {lowStockItems.length > 0 ? (
                                        lowStockItems.map(item => (
                                            <div key={item._id} className="flex justify-between items-center p-3 bg-red-50/30 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-red-500 font-bold">{item.quantity} left</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<p className="text-sm text-gray-400">Inventory looks good.</p>)}
                                </div>
                            </div>

                            {/* Expiring Soon */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-orange-50 p-2 rounded-lg">
                                        <CalendarClock size={20} className="text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Expiring Soon</h3>
                                </div>
                                <div className="space-y-3">
                                    {expiringItems.length > 0 ? (
                                        expiringItems.map(item => (
                                            <div key={item._id} className="flex justify-between items-center p-3 bg-orange-50/30 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-orange-600">{new Date(item.expiry_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<p className="text-sm text-gray-400">No expiring items.</p>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
