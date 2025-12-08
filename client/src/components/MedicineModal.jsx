import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, ShoppingBag, IndianRupee, Calendar, Boxes, Tag, Truck } from 'lucide-react';
import api from '../api/axios';
const FloatingInput = ({ label, name, type = "text", icon: Icon, required = false, value, onChange, errors, ...props }) => (
    <div className="relative group w-full">
        {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Icon size={18} />
            </div>
        )}
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 pb-2.5 pt-5 text-gray-900 bg-gray-50 border ${errors[name] ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl appearance-none focus:outline-none focus:ring-0 peer transition-colors`}
            placeholder=" "
            required={required}
            {...props}
        />
        <label
            htmlFor={name}
            className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] ${Icon ? 'left-10' : 'left-3'} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${errors[name] ? 'text-red-500' : 'text-gray-500 peer-focus:text-indigo-600'}`}
        >
            {label}
        </label>
        {errors[name] && <p className="absolute -bottom-4 left-0 text-[10px] text-red-500">{errors[name]}</p>}
    </div>
);
const MedicineModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        manufacturer: '',
        batch_number: '',
        quantity: 0,
        price: 0,
        purchase_price: 0,
        expiry_date: '',
        reorder_level: 10
    });
    const [errors, setErrors] = useState({});
    const [profitMargin, setProfitMargin] = useState(null);
    useEffect(() => {
        if (initialData) {
            const date = initialData.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : '';
            setFormData({ ...initialData, expiry_date: date });
        } else {
            setFormData({
                name: '',
                category: '',
                manufacturer: '',
                batch_number: '',
                quantity: 0,
                price: 0,
                purchase_price: 0,
                expiry_date: '',
                reorder_level: 10
            });
        }
        setErrors({});
    }, [initialData, isOpen]);
    useEffect(() => {
        if (formData.price > 0 && formData.purchase_price > 0) {
            const margin = ((formData.price - formData.purchase_price) / formData.price) * 100;
            setProfitMargin(margin.toFixed(1));
        } else {
            setProfitMargin(null);
        }
    }, [formData.price, formData.purchase_price]);
    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Required';
        if (!formData.category) newErrors.category = 'Required';
        if (!formData.quantity && formData.quantity !== 0) newErrors.quantity = 'Required';
        if (!formData.price) newErrors.price = 'Required';
        if (!formData.expiry_date) newErrors.expiry_date = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(formData);
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                {}
                <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {initialData ? 'Edit Medicine' : 'Add New Medicine'}
                        </h3>
                        <p className="text-white/70 text-sm">Fill in the details below to update inventory.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                {}
                <div className="overflow-y-auto p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        {}
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Basic Information</h4>
                        </div>
                        <FloatingInput label="Medicine Name" name="name" icon={ShoppingBag} required value={formData.name} onChange={handleChange} errors={errors} />
                        <FloatingInput label="Category" name="category" icon={Tag} required value={formData.category} onChange={handleChange} errors={errors} />
                        <FloatingInput label="Manufacturer" name="manufacturer" icon={Boxes} value={formData.manufacturer} onChange={handleChange} errors={errors} />
                        {}
                        <div className="md:col-span-2 mt-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Inventory & Pricing</h4>
                        </div>
                        <FloatingInput label="Batch Number" name="batch_number" value={formData.batch_number} onChange={handleChange} errors={errors} />
                        <FloatingInput label="Current Quantity" name="quantity" type="number" required value={formData.quantity} onChange={handleChange} errors={errors} />
                        <FloatingInput label="Reorder Level" name="reorder_level" type="number" value={formData.reorder_level} onChange={handleChange} errors={errors} />
                        {}
                        <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                name="expiry_date"
                                id="expiry_date"
                                value={formData.expiry_date}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 pb-2.5 pt-5 text-gray-900 bg-gray-50 border ${errors.expiry_date ? 'border-red-300' : 'border-gray-200'} focus:border-indigo-500 rounded-xl appearance-none focus:outline-none focus:ring-0 peer transition-colors`}
                                required
                            />
                            <label
                                htmlFor="expiry_date"
                                className="absolute text-sm duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] left-10 text-gray-500 peer-focus:text-indigo-600"
                            >
                                Expiry Date
                            </label>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            <FloatingInput label="Selling Price (₹)" name="price" type="number" step="0.01" icon={IndianRupee} required value={formData.price} onChange={handleChange} errors={errors} />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <FloatingInput label="Purchase Price (₹)" name="purchase_price" type="number" step="0.01" icon={IndianRupee} value={formData.purchase_price} onChange={handleChange} errors={errors} />
                                </div>
                                {}
                                <div className="flex items-center justify-center min-w-[100px]">
                                    {profitMargin !== null ? (
                                        <div className={`text-center px-3 py-1 rounded-lg ${Number(profitMargin) >= 20 ? 'bg-green-100 text-green-700' : Number(profitMargin) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            <p className="text-xs font-bold uppercase">Margin</p>
                                            <p className="text-lg font-bold">{profitMargin}%</p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Enter prices to see margin</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                {}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
export default MedicineModal;
