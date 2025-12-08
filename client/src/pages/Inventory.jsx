import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MedicineModal from '../components/MedicineModal';
import api from '../api/axios';

import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
    Check
} from 'lucide-react';

const Inventory = () => {
    // Basic State
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMedicines, setTotalMedicines] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingMedicine, setEditingMedicine] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);

    const toast = useToast();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Filter States
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [expiryStart, setExpiryStart] = useState('');
    const [expiryEnd, setExpiryEnd] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // UI States
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Hardcoded categories (In real app, fetch from DB distinct categories)
    const ALL_CATEGORIES = ['Antibiotic', 'Painkiller', 'Supplement', 'First Aid', 'Cardiovascular', 'Antiviral', 'Skin Care'];

    // Handle URL parameters on mount
    useEffect(() => {
        const filterLowStock = searchParams.get('filterLowStock');
        const filterExpiring = searchParams.get('filterExpiring');
        const searchQuery = searchParams.get('search');

        if (filterLowStock === 'true') {
            setShowLowStockOnly(true);
            setIsFiltersOpen(true);
        }

        if (filterExpiring === 'true') {
            // Set expiry filter for next 30 days
            const today = new Date();
            const thirtyDays = new Date();
            thirtyDays.setDate(today.getDate() + 30);
            setExpiryStart(today.toISOString().split('T')[0]);
            setExpiryEnd(thirtyDays.toISOString().split('T')[0]);
            setIsFiltersOpen(true);
        }

        if (searchQuery) {
            setSearch(searchQuery);
        }
    }, [location.search]);

    // Load data with debounce on simple filters
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchMedicines();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, page, sortBy, selectedCategories, showLowStockOnly, expiryStart, expiryEnd]); // Simple triggers auto-fetch

    // Manual fetch for range inputs to avoid too many calls while typing
    const applyAdvancedFilters = () => {
        setPage(1);
        fetchMedicines();
        setIsFiltersOpen(false);
    };

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search: search || undefined,
                filterLowStock: showLowStockOnly ? 'true' : undefined
            };

            if (sortBy) params.sortBy = sortBy;
            if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (expiryStart) params.expiryStart = expiryStart;
            if (expiryEnd) params.expiryEnd = expiryEnd;

            const res = await api.get(`/medicines`, { params });
            setMedicines(res.data.medicines);
            setTotalPages(res.data.totalPages);
            setTotalMedicines(res.data.totalMedicines);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
            toast.error("Failed to fetch inventory");
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        setPage(1);
    };

    const handleExportCSV = () => {
        if (medicines.length === 0) return toast.info("No data to export");

        const headers = ["Name", "Category", "Batch", "Quantity", "Price", "Expiry"];
        const rows = medicines.map(m => [
            m.name,
            m.category,
            m.batch_number,
            m.quantity,
            m.price,
            new Date(m.expiry_date).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "quickmed_inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Inventory exported successfully");
    };

    const handleAddClick = () => {
        setEditingMedicine(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (medicine) => {
        setEditingMedicine(medicine);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (medicine) => {
        setMedicineToDelete(medicine);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!medicineToDelete) return;

        try {
            await api.delete(`/medicines/${medicineToDelete._id}`);
            toast.success("Medicine deleted successfully");
            fetchMedicines();
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete medicine");
        } finally {
            setIsDeleteModalOpen(false);
            setMedicineToDelete(null);
        }
    };

    const handleModalSubmit = async (data) => {
        try {
            if (editingMedicine) {
                await api.put(`/medicines/${editingMedicine._id}`, data);
                toast.success("Medicine updated successfully");
            } else {
                await api.post('/medicines', data);
                toast.success("Medicine added successfully");
            }
            setIsModalOpen(false);
            fetchMedicines();
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save medicine");
        }
    };

    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded-lg" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title="Inventory Management" />

                <div className="p-8 flex-1">
                    {/* Toolbar */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">

                        {/* Top Row: Search & Actions */}
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search medicines..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                    className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-colors ${selectedCategories.length > 0 || minPrice || showLowStockOnly ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Filter size={18} /> Filters
                                </button>

                                <button
                                    onClick={handleExportCSV}
                                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Download size={18} /> Export
                                </button>

                                <button
                                    onClick={handleAddClick}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add New
                                </button>
                            </div>
                        </div>

                        {/* Filter Panel (Collapsible) */}
                        <div className={`overflow-hidden transition-all duration-300 ${isFiltersOpen ? 'max-h-[500px] opacity-100 pt-4 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Categories */}
                                <div className="md:col-span-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Categories</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(cat) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Price Range</p>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number" placeholder="Min"
                                            value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number" placeholder="Max"
                                            value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Expiry Date</p>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="date"
                                            value={expiryStart} onChange={e => setExpiryStart(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <input
                                            type="date"
                                            value={expiryEnd} onChange={e => setExpiryEnd(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Checks & Sort */}
                                <div className="flex flex-col gap-4">
                                    <div
                                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                                        className="flex items-center gap-2 cursor-pointer select-none"
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showLowStockOnly ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                                            {showLowStockOnly && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Show Low Stock Only</span>
                                    </div>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none w-full"
                                    >
                                        <option value="">Sort By: Default</option>
                                        <option value="expiry_date:asc">Expiry: Soonest</option>
                                        <option value="quantity:asc">Quantity: Low to High</option>
                                        <option value="price:desc">Price: High to Low</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={applyAdvancedFilters}
                                        className="w-full bg-gray-800 text-white py-2 rounded-xl font-medium hover:bg-black transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : medicines.length > 0 ? (
                                    medicines.map((med) => (
                                        <tr key={med._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{med.name}</div>
                                                <div className="text-xs text-gray-400">{med.manufacturer}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">{med.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-500">{med.batch_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${med.quantity <= med.reorder_level ? 'text-red-600' : 'text-gray-700'}`}>
                                                        {med.quantity}
                                                    </span>
                                                    {med.quantity <= med.reorder_level && (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Low Stock"></span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">₹{med.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                {new Date(med.expiry_date) < new Date() ? (
                                                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">Expired</span>
                                                ) : (
                                                    <span className={`text-sm ${new Date(med.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                        ? 'text-orange-500 font-medium'
                                                        : 'text-gray-600'
                                                        }`}>
                                                        {new Date(med.expiry_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(med)}
                                                        className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(med)}
                                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">No medicines found matching your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination */}
                    <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                        <p>Showing Page {page} of {totalPages} ({totalMedicines} items)</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <MedicineModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    initialData={editingMedicine}
                />

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Medicine"
                    message={`Are you sure you want to delete "${medicineToDelete?.name}"? This action cannot be undone.`}
                    confirmText="Delete Medicine"
                    isDangerous={true}
                />
            </div>
        </div>
    );
};

export default Inventory;
