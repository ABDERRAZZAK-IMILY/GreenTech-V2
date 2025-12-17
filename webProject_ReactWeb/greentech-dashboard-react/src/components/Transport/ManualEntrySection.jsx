import React from 'react';

// 1. Constants for cleaner rendering
const VEHICLE_TYPES = ["Camionnette", "Voiture", "Camion", "Utilitaire", "Moto"];
const STATUS_OPTIONS = [
    { value: "moving", label: "En route" },
    { value: "parked", label: "Stationné" }
];

const ManualEntrySection = () => {
    // Placeholder handler
    const handleSubmitTransportData = (e) => {
        e.preventDefault();
        console.log("Form Submitted");
    };

    // 2. Reusable Class Strings (Dry Code)
    const labelClasses = "block text-sm font-medium text-gray-400 mb-1.5";
    const inputClasses = "w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 transition-all";

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mt-8">
            {/* Header */}
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700 pb-4">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <i className="fas fa-keyboard" />
                </div>
                Saisie Manuelle - Transport
            </h4>

            <form onSubmit={handleSubmitTransportData}>
                {/* Form Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Nom du chauffeur */}
                    <div>
                        <label htmlFor="transportDriver" className={labelClasses}>Nom du chauffeur</label>
                        <input
                            type="text"
                            id="transportDriver"
                            className={inputClasses}
                            placeholder="Ex: Ahmed Benali"
                            required
                        />
                    </div>

                    {/* Type de véhicule */}
                    <div>
                        <label htmlFor="transportVehicleType" className={labelClasses}>Type de véhicule</label>
                        <div className="relative">
                            <select id="transportVehicleType" className={`${inputClasses} appearance-none`} required>
                                <option value="" className="text-gray-500">Sélectionner le type</option>
                                {VEHICLE_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>

                    {/* Immatriculation */}
                    <div>
                        <label htmlFor="transportPlate" className={labelClasses}>Immatriculation</label>
                        <input
                            type="text"
                            id="transportPlate"
                            className={`${inputClasses} uppercase`}
                            placeholder="Ex: MAR-1234"
                            required
                        />
                    </div>

                    {/* Carburant */}
                    <div>
                        <label htmlFor="transportFuel" className={labelClasses}>Carburant consommé (L)</label>
                        <input
                            type="number"
                            id="transportFuel"
                            className={inputClasses}
                            placeholder="Ex: 5.2"
                            min={0}
                            step="0.1"
                            required
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <label htmlFor="transportDestination" className={labelClasses}>Position actuelle</label>
                        <input
                            type="text"
                            id="transportDestination"
                            className={inputClasses}
                            placeholder="Ex: Zone Industrielle"
                            required
                        />
                    </div>

                    {/* Latitude */}
                    <div>
                        <label htmlFor="transportLatitude" className={labelClasses}>Latitude</label>
                        <input
                            type="number"
                            id="transportLatitude"
                            className={inputClasses}
                            placeholder="Ex: 33.5731"
                            step="any"
                            required
                        />
                    </div>

                    {/* Longitude */}
                    <div>
                        <label htmlFor="transportLongitude" className={labelClasses}>Longitude</label>
                        <input
                            type="number"
                            id="transportLongitude"
                            className={inputClasses}
                            placeholder="Ex: -7.5898"
                            step="any"
                            required
                        />
                    </div>

                    {/* Statut */}
                    <div>
                        <label htmlFor="transportStatus" className={labelClasses}>Statut</label>
                        <div className="relative">
                            <select id="transportStatus" className={`${inputClasses} appearance-none`} required>
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-center border-t border-gray-700 pt-6">
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                    >
                        <i className="fas fa-check" /> Enregistrer les données
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualEntrySection;