import { useEffect, useState } from 'react';
import AddDriverModal from './AddDriverModel';
import EditDriverModal from './EditDriverModal';
import DeleteDriverModal from './DeleteDriverModal';
import transporService from '../../services/transporService';
import useDriverStore from '../../State/useDriverStore';

const DriverList = () => {

    const { drivers, fetchDrivers, setFocusedLocation } = useDriverStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [driverData, setDriverData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // all Drivers
    useEffect(() => {
        fetchDrivers();
    }, [showAddModal, showEditModal, showDeleteModal])

    // Placeholder handlers (replace with your actual logic)
    const handleAddVehicleGPS = () => {
        setShowAddModal(true);
    };
    const closeAddModal = () => {
        setShowAddModal(false);
    };
    const handleTrackDriver = (driver) => {
        if (driver.lat && driver.longe) {
            // Call the store action
            setFocusedLocation(driver.lat, driver.longe);
            // Optional: Scroll to top if map is at the top
            window.scrollTo({ top: 500, behavior: 'smooth' });
        } else {
            alert("Ce chauffeur n'a pas de coordonnées GPS valides.");
        }
    };
    const handleEditDriver = (id) => {
        const driver = drivers.find(d => d.id === id);
        console.log(driver);
        setDriverData(driver);
        setShowEditModal(true);
    };
    const handleDeleteDriver = (id) => {
        transporService.deleteVehicle(id)
    }


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
                {drivers.map((driver) => (
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
                                    <h5 className="font-bold text-white">{driver.user.username}</h5>
                                    {/* <h5 className="font-bold text-white">{driver.name}</h5> */}
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{driver.model}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid - Dark Background */}


                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-700">
                            <button
                                className="flex-1 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 py-2 rounded text-sm font-medium transition-colors border border-blue-900/50"
                                onClick={() => handleTrackDriver(driver)}
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
                        {showDeleteModal && <DeleteDriverModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} driverName={driverData ? driverData.name : ''} onConfirm={() => {
                            handleDeleteDriver(driver.id);
                            setShowDeleteModal(false);
                        }} />}
                    </div>

                ))}
            </div>

            {showAddModal && <AddDriverModal isOpen={showAddModal} onClose={closeAddModal} />}
            {showEditModal && <EditDriverModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} driverData={driverData} setDriverData={setDriverData} />}

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