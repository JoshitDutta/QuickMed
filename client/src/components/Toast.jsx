import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ id, type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const styles = {
        success: 'bg-white border-l-4 border-green-500 text-gray-800',
        error: 'bg-white border-l-4 border-red-500 text-gray-800',
        info: 'bg-white border-l-4 border-blue-500 text-gray-800',
        warning: 'bg-white border-l-4 border-orange-500 text-gray-800',
    };

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertTriangle className="text-orange-500" size={20} />,
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg mb-3 w-80 transform transition-all duration-300 animate-slide-in ${styles[type] || styles.info}`}>
            <div className="mt-0.5">{icons[type] || icons.info}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
