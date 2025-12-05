import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SupplierModal from '../components/SupplierModal';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import { Plus, Search, Edit2, Trash2, Truck, Mail, Phone, ExternalLink } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSuppliers, setTotalSuppliers] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const toast = useToast();

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSuppliers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, page]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/suppliers', {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined
                }
            });
            setSuppliers(res.data.suppliers);
            setTotalPages(res.data.totalPages);
            setTotalSuppliers(res.data.totalSuppliers);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
            toast.error("Failed to fetch suppliers");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure? Deleting a supplier does not delete their medicines, but unlinks them.')) {
            try {
                await api.delete(`/suppliers/${id}`);
                toast.success("Supplier deleted successfully");
                fetchSuppliers();
            } catch (error) {
                console.error("Failed to delete", error);
                toast.error("Failed to delete supplier");
            }
        }
    };

    const handleModalSubmit = async (data) => {
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier._id}`, data);
                toast.success("Supplier updated successfully");
            } else {
                await api.post('/suppliers', data);
                toast.success("Supplier added successfully");
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save supplier");
        }
    };

    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded-lg" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title="Supplier Directory" />

                <div className="p-8">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-gray-500 text-sm">Managing {totalSuppliers} partners</p>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Supplier
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search suppliers..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid of Cards (Visual preference for Suppliers usually nicer than table if fewer props, but user asked for table. I will provide a responsive Table) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : suppliers.length > 0 ? (
                                    suppliers.map((supplier) => (
                                        <tr key={supplier._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <Truck size={20} />
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{supplier.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {supplier.contact}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {supplier.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(supplier)}
                                                        className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(supplier._id)}
                                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No suppliers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                        <p>Page {page} of {totalPages}</p>
                        {/* Simplified pagination for brevity */}
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="hover:underline disabled:opacity-50">Previous</button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="hover:underline disabled:opacity-50">Next</button>
                        </div>
                    </div>

                    <SupplierModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleModalSubmit}
                        initialData={editingSupplier}
                    />
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
