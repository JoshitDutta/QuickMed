import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail } from 'lucide-react';

const SupplierModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', contact: '', email: '' });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Supplier Name is required';
        if (!formData.contact) newErrors.contact = 'Contact Number is required';
        if (!formData.email) newErrors.email = 'Email Address is required';
        // Basic email regex
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up transform transition-all">
                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">
                            {initialData ? 'Edit Supplier' : 'New Supplier'}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">Manage your supply chain partners</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Floating Label Style Input Group */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 pb-2.5 pt-5 text-gray-900 bg-gray-50 border ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl appearance-none focus:outline-none focus:ring-0 peer transition-colors`}
                            placeholder=" "
                        />
                        <label
                            htmlFor="name"
                            className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${errors.name ? 'text-red-500' : 'text-gray-500 peer-focus:text-indigo-600'}`}
                        >
                            Supplier Name
                        </label>
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Phone size={18} />
                        </div>
                        <input
                            type="text"
                            name="contact"
                            id="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 pb-2.5 pt-5 text-gray-900 bg-gray-50 border ${errors.contact ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl appearance-none focus:outline-none focus:ring-0 peer transition-colors`}
                            placeholder=" "
                        />
                        <label
                            htmlFor="contact"
                            className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${errors.contact ? 'text-red-500' : 'text-gray-500 peer-focus:text-indigo-600'}`}
                        >
                            Contact Number
                        </label>
                        {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 pb-2.5 pt-5 text-gray-900 bg-gray-50 border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl appearance-none focus:outline-none focus:ring-0 peer transition-colors`}
                            placeholder=" "
                        />
                        <label
                            htmlFor="email"
                            className={`absolute text-sm duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 ${errors.email ? 'text-red-500' : 'text-gray-500 peer-focus:text-indigo-600'}`}
                        >
                            Email Address
                        </label>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {initialData ? 'Update Supplier' : 'Save Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierModal;
