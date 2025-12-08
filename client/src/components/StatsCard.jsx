import React from 'react';
const StatsCard = ({ title, value, icon, gradient, trend, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1 opacity-90">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    {trend && (
                        <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-full mt-2 backdrop-blur-sm">
                            {trend}
                        </p>
                    )}
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md shadow-inner">
                    {icon}
                </div>
            </div>
            {}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </div>
    );
};
export default StatsCard;
