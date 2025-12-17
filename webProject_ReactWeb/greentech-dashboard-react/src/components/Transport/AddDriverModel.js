import React from 'react';

// 1. Data Array for the Select Loop
const VEHICLE_TYPES = [
    "Camionnette",
    "Voiture",
    "Camion",
    "Utilitaire",
    "Moto"
];

const AddDriverModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    // ... (submit logic) ...

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-car text-blue-400"></i> Ajouter un Véhicule
                    </h3>
                    <button 
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        onClick={onClose}
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form className="space-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Nom du chauffeur <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-600"
                                placeholder="Ex: Ahmed Benali" 
                                required 
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Type de véhicule <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="">Sélectionner le type</option>
                                    {VEHICLE_TYPES.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Numéro d'immatriculation <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-600 uppercase"
                                placeholder="Ex: MAR-1234" 
                                required 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-6">
                            <button 
                                type="button" 
                                className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                onClick={onClose}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg"
                            >
                                Ajouter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddDriverModal;