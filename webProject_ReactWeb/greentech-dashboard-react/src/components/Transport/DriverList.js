import {useState} from 'react';
import AddDriverModal from './AddDriverModel';
import EditDriverModal from './EditDriverModal';
import DeleteDriverModal from './DeleteDriverModal';

// 1. Mock Data Array
const driversData = [
    {
        id: 'driver2',
        name: 'Fatima El Amrani',
        vehicle: 'Voiture Service - MAR-5678',
        status: 'moving', // status used for logic
        statusLabel: 'En route',
        stats: {
            distance: '52 km',
            fuel: '5.2 L',
            co2: '12.2 kg',
            duration: '2h 15min',
            position: 'Centre Ville'
        }
    },
    {
        id: 'driver3',
        name: 'Youssef Berrada',
        vehicle: 'Camion Transport - MAR-9012',
        status: 'moving',
        statusLabel: 'En livraison',
        stats: {
            distance: '89 km',
            fuel: '8.9 L',
            co2: '21.0 kg',
            duration: '4h 20min',
            position: 'Route de Rabat'
        }
    },
    {
        id: 'driver4',
        name: 'Karim Tazi',
        vehicle: 'Utilitaire - MAR-3456',
        status: 'parked',
        statusLabel: 'Stationné',
        stats: {
            distance: '23 km',
            fuel: '2.3 L',
            co2: '5.4 kg',
            duration: '1h 10min',
            position: 'Parking Entreprise'
        }
    },
    {
        id: 'driver5',
        name: 'Samir Alami',
        vehicle: 'Voiture Commerciale - MAR-7890',
        status: 'parked',
        statusLabel: 'Stationné',
        stats: {
            distance: '16 km',
            fuel: '1.6 L',
            co2: '3.8 kg',
            duration: '45min',
            position: 'Parking Entreprise'
        }
    }
];

const DriverList = () => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [driverData, setDriverData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // Placeholder handlers (replace with your actual logic)
    const handleAddVehicleGPS = () => {
        setShowAddModal(true);
    };
     const closeAddModal = () => {
    setShowAddModal(false);
  };
    const handleTrackDriver = (id) => console.log("Track", id);
    const handleEditDriver = (id) => {
        const driver = driversData.find(d => d.id === id);
        setDriverData(driver);
        setShowEditModal(true);
    };
    const handleDeleteDriver = (id) => {
        console.log("Delete", id);
    }

const getStatusStyles = (status) => {
        return status === 'moving'
            ? "bg-green-900/30 text-green-400 border-green-800"
            : "bg-gray-700/50 text-gray-300 border-gray-600";
    };

    const getStatusIconColor = (status) => {
        return status === 'moving' ? "text-green-500" : "text-gray-400";
    };

    return (
        <div className="p-6 min-h-screen text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="fas fa-users text-blue-400" /> Chauffeurs & Véhicules
                </h4>
                <button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 text-sm font-medium"
                    onClick={handleAddVehicleGPS}
                >
                    <i className="fas fa-plus" /> Ajouter un véhicule GPS
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-150px)] pb-4">
                {driversData.map((driver) => (
                    <div 
                        key={driver.id} 
                        className={`bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-5 transition-all hover:bg-gray-750 ${driver.status === 'moving' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-600'}`}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 text-lg border border-gray-600">
                                    <i className="fas fa-user" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white">{driver.name}</h5>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{driver.vehicle}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusStyles(driver.status)}`}>
                                <i className={`fas fa-circle text-[8px] ${getStatusIconColor(driver.status)}`} /> 
                                {driver.statusLabel}
                            </div>
                        </div>

                        {/* Stats Grid - Dark Background */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-300 mb-5 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                            <StatItem icon="fa-road" label="Distance" value={driver.stats.distance} />
                            <StatItem icon="fa-gas-pump" label="Carburant" value={driver.stats.fuel} />
                            <StatItem icon="fa-leaf" label="CO2" value={driver.stats.co2} />
                            <StatItem icon="fa-clock" label="Durée" value={driver.stats.duration} />
                            
                            <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-gray-700 mt-1">
                                <i className="fas fa-map-marker-alt text-red-500 w-5 text-center" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase">Position actuelle</span>
                                    <span className="font-semibold text-gray-200">{driver.stats.position}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-700">
                            <button
                                className="flex-1 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 py-2 rounded text-sm font-medium transition-colors border border-blue-900/50"
                                onClick={() => handleTrackDriver(driver.id)}
                            >
                                <i className="fas fa-crosshairs mr-1" /> Localiser
                            </button>
                            <button 
                                className="px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors"
                                onClick={() => handleEditDriver(driver.id)}
                            >
                                <i className="fas fa-edit" />
                            </button>
                            <button
                                className="px-3 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded text-sm transition-colors border border-red-900/30"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <i className="fas fa-trash" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {showAddModal && <AddDriverModal isOpen={showAddModal} onClose={closeAddModal} />}
            {showEditModal && <EditDriverModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} driverData={driverData} setDriverData={setDriverData}  />}
            {showDeleteModal && <DeleteDriverModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} driverName={driverData ? driverData.name : ''} onConfirm={() => {
                handleDeleteDriver(driverData.id);
                setShowDeleteModal(false);
            }} />}
        </div>
    );
};

const StatItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        <i className={`fas ${icon} text-gray-500 w-5 text-center`} />
        <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-500 uppercase">{label}</span>
            <span className="font-semibold text-gray-200">{value}</span>
        </div>
    </div>
);

export default DriverList;