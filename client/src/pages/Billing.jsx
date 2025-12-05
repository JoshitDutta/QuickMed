import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
    Search,
    Plus,
    Trash2,
    CreditCard,
    User,
    Smartphone,
    Receipt,
    CheckCircle,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    // Search State
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    // Cart State
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Suggestions Debounced
    useEffect(() => {
        const fetchMedicines = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                // Using the existing search param
                const res = await api.get(`/medicines?search=${query}&limit=5`);
                setSuggestions(res.data.medicines);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Failed to search", error);
            }
        };

        const timeoutId = setTimeout(fetchMedicines, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const addToCart = (medicine) => {
        if (medicine.quantity <= 0) {
            toast.error("Medicine out of stock!");
            return;
        }

        // Check expiry warning
        const daysToExpiry = Math.ceil((new Date(medicine.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysToExpiry < 0) {
            toast.error("Cannot add expired medicine!");
            return;
        }

        const existing = cart.find(item => item._id === medicine._id);
        if (existing) {
            if (existing.buyQty + 1 > medicine.quantity) {
                toast.error(`Only ${medicine.quantity} in stock!`);
                return;
            }
            setCart(cart.map(item =>
                item._id === medicine._id ? { ...item, buyQty: item.buyQty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...medicine, buyQty: 1 }]);
        }
        setQuery('');
        setShowSuggestions(false);
        if (daysToExpiry <= 30) {
            toast.warning(`Warning: Matches expires in ${daysToExpiry} days`);
        }
    };

    const updateQty = (id, newQty, maxStock) => {
        if (newQty < 1) return;
        if (newQty > maxStock) {
            toast.error(`Using max available stock: ${maxStock}`);
            newQty = maxStock;
        }
        setCart(cart.map(item => item._id === id ? { ...item, buyQty: newQty } : item));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.buyQty), 0);
    const tax = subtotal * 0.10; // 10% tax example or 0
    const total = subtotal; // Assuming inclusive or simple calculation for now

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error("Cart is empty");
        if (!customerName) return toast.error("Customer name is required");

        setLoading(true);
        try {
            const orderData = {
                customer_name: customerName,
                customer_contact: customerContact,
                payment_status: 'paid', // Instant billing implies paid usually, or use paymentMethod
                items: cart.map(item => ({
                    medicine_id: item._id,
                    quantity: item.buyQty
                }))
            };

            await api.post('/orders', orderData);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setCart([]);
                setCustomerName('');
                setCustomerContact('');
                navigate('/orders'); // Redirect to orders list
                toast.success("Bill generated successfully!");
            }, 2000);

        } catch (error) {
            console.error("Checkout failed", error);
            toast.error(error.response?.data?.message || "Failed to generate bill");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-indigo-600 flex items-center justify-center">
                <div className="text-center text-white space-y-6 animate-scale-up">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <CheckCircle size={48} className="text-indigo-600" />
                    </div>
                    <h2 className="text-4xl font-bold">Payment Successful!</h2>
                    <p className="text-indigo-200">Processing your invoice...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col">
                <Header title="New Sale" />

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Panel: Search & Cart */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Search Bar */}
                        <div className="relative z-20" ref={searchRef}>
                            <div className="relative group">
                                <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Scan barcode or type medicine name..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg"
                                />
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
                                    <p className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase">Suggestions</p>
                                    {suggestions.map(med => {
                                        const isExpired = new Date(med.expiry_date) < new Date();
                                        const isExpiringSoon = !isExpired && (new Date(med.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

                                        return (
                                            <div
                                                key={med._id}
                                                onClick={() => addToCart(med)}
                                                className={`p-4 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center group
                                                    ${isExpired ? 'opacity-50 bg-red-50 hover:bg-red-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-800 group-hover:text-indigo-700">{med.name}</p>
                                                    <div className="flex gap-2 text-xs mt-1">
                                                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{med.batch_number}</span>
                                                        <span className="text-gray-500">{med.quantity} in stock</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">₹{med.price}</p>
                                                    {isExpiringSoon && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full mt-1">
                                                            <Clock size={10} /> Expiring Soon
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Receipt className="text-indigo-500" /> Current Bill
                            </h3>

                            {cart.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                                        <Plus size={32} className="opacity-20" />
                                    </div>
                                    <p>Search and add items to billing</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex flex-wrap items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100">
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                                                <p className="text-sm text-gray-500">₹{item.price} x {item.buyQty}</p>
                                            </div>

                                            <div className="flex items-center gap-6 mt-2 sm:mt-0">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm">
                                                    <button
                                                        onClick={() => updateQty(item._id, item.buyQty - 1, item.quantity)}
                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold rounded-l-xl transition-colors"
                                                    >-</button>
                                                    <span className="w-10 text-center font-bold text-gray-800">{item.buyQty}</span>
                                                    <button
                                                        onClick={() => updateQty(item._id, item.buyQty + 1, item.quantity)}
                                                        className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold rounded-r-xl transition-colors"
                                                    >+</button>
                                                </div>

                                                <span className="font-bold text-lg w-20 text-right">
                                                    ₹{(item.price * item.buyQty).toFixed(2)}
                                                </span>

                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Checkout */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-bold text-gray-800 text-lg mb-6">Customer Details</h3>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        placeholder="Customer Name"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        value={customerContact}
                                        onChange={e => setCustomerContact(e.target.value)}
                                        placeholder="Phone Number (Optional)"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (0%)</span>
                                    <span className="font-medium">₹0.00</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                {['cash', 'card'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`py-3 rounded-xl font-semibold capitalize flex items-center justify-center gap-2 border-2 transition-all
                                            ${paymentMethod === method
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'}
                                        `}
                                    >
                                        {method === 'card' && <CreditCard size={18} />}
                                        {method}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                                className="w-full mt-6 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Generate Bill'}
                                {!loading && <CheckCircle size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
