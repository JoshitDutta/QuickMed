import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                {}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${isDangerous ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        {isDangerous && (
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle className="text-red-500" size={20} />
                            </div>
                        )}
                        <h3 className={`font-bold text-lg ${isDangerous ? 'text-red-900' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-black/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
                {}
                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>
                {}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white font-medium rounded-xl shadow-lg transition-all flex items-center gap-2 ${isDangerous
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                    >
                        {isDangerous && <Trash2 size={16} />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmationModal;
