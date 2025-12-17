import React from 'react';

// 1. Data Array for Dropdown
const VEHICLE_TYPES = [
    "Camionnette",
    "Voiture",
    "Camion",
    "Utilitaire",
    "Moto"
];

const EditDriverModal = ({ isOpen, onClose, onSave, driverData, setDriverData }) => {
    // 2. Return null if not open (standard React Modal pattern)
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    // Helper to handle input changes cleanly
    const handleChange = (field, value) => {
        setDriverData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-edit text-blue-400"></i> Modifier le Chauffeur
                    </h3>
                    <button 
                        className="text-gray-400 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-300">Nom du chauffeur</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <i className="fas fa-user text-xs"></i>
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={driverData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Type de véhicule</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        value={driverData.vehicleType}
                                        onChange={(e) => handleChange('vehicleType', e.target.value)}
                                        required
                                    >
                                        {VEHICLE_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                        <i className="fas fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-300">Immatriculation</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                        <i className="fas fa-hashtag text-xs"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder-gray-500"
                                        value={driverData.plate}
                                        onChange={(e) => handleChange('plate', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-2">
                            <button 
                                type="button" 
                                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                onClick={onClose}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-md"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDriverModal;