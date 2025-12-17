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
    // If modal is closed, do not render anything
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Gather data logic would go here
        onSubmit();
    };

    return (
        // Overlay (Fixed position, semi-transparent background)
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-car text-blue-600"></i> Ajouter un Véhicule avec GPS
                    </h3>
                    <button
                        className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        onClick={onClose}
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form id="addVehicleGPSForm" onSubmit={handleSubmit} className="space-y-5">

                        {/* Driver Name Input */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="gpsDriverName" className="text-sm font-semibold text-gray-700">
                                Nom du chauffeur <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="gpsDriverName"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                                placeholder="Ex: Ahmed Benali"
                                required
                            />
                        </div>

                        {/* Vehicle Type Select (Mapped) */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="gpsVehicleType" className="text-sm font-semibold text-gray-700">
                                Type de véhicule <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="gpsVehicleType"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                >
                                    <option value="">Sélectionner le type</option>
                                    {/* 2. Mapping over the array */}
                                    {VEHICLE_TYPES.map((type, index) => (
                                        <option key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom Arrow Icon for Select */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Plate Number Input */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="gpsPlateNumber" className="text-sm font-semibold text-gray-700">
                                Numéro d'immatriculation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="gpsPlateNumber"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 uppercase"
                                placeholder="Ex: MAR-1234"
                                required
                            />
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
                                onClick={onClose}
                            >
                                <i className="fas fa-times mr-2"></i> Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                                <i className="fas fa-check mr-2"></i> Ajouter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddDriverModal;