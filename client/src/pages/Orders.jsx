import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Target,
    Calendar,
    Eye,
    Receipt
} from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toast = useToast();

    useEffect(() => {
        const timeout = setTimeout(() => fetchOrders(), 500);
        return () => clearTimeout(timeout);
    }, [page, search, statusFilter, dateStart, dateEnd]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search,
                status: statusFilter,
                startDate: dateStart,
                endDate: dateEnd
            };
            const res = await api.get('/orders', { params });
            setOrders(res.data.orders);
            setTotalPages(res.data.totalPages);
            setTotalOrders(res.data.totalOrders);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const LoadingRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded-lg" /></td>
        </tr>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title="Orders History" />

                <div className="p-8 flex-1">
                    {/* Filters */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative col-span-1 md:col-span-2">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search Customer or Order ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Target className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateStart}
                                onChange={e => setDateStart(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-indigo-500 outline-none"
                            />
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={e => setDateEnd(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <LoadingRow key={i} />)
                                ) : orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{order.order_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-800">{order.customer_name}</div>
                                                <div className="text-xs text-gray-400">{order.customer_contact || 'No Contact'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                                ₹{order.total_amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                                    ${order.payment_status === 'paid' ? 'bg-green-100 text-green-600' :
                                                        order.payment_status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                            'bg-red-100 text-red-600'}
                                                `}>
                                                    {order.payment_status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <Receipt size={48} className="mb-4 opacity-20" />
                                                <p>No orders found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Details Modal */}
                {isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Details</p>
                                    <h2 className="text-xl font-bold text-gray-800 mt-1">{selectedOrder.order_id}</h2>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <span className="text-xl">&times;</span>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-4 bg-indigo-50 rounded-2xl">
                                        <p className="text-xs text-indigo-400 font-bold uppercase mb-1">Customer</p>
                                        <p className="font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                                        <p className="text-sm text-gray-500">{selectedOrder.customer_contact || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold
                                            ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}
                                        `}>
                                            {selectedOrder.payment_status.toUpperCase()}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Receipt size={18} className="text-indigo-500" /> Purchased Items
                                </h3>

                                <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Item</th>
                                                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500">Qty</th>
                                                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">Price</th>
                                                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedOrder.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {item.medicine_id?.name || 'Deleted Item'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 text-right">₹{item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                                                        ₹{(item.quantity * item.price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end">
                                    <div className="bg-gray-900 text-white p-6 rounded-2xl w-full md:w-1/2 flex justify-between items-center shadow-lg transform hover:scale-[1.02] transition-transform">
                                        <span className="text-gray-400 font-medium">Grand Total</span>
                                        <span className="text-2xl font-bold">₹{selectedOrder.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
