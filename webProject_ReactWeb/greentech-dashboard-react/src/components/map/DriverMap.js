import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapController from './MapController';

// --- 1. Define your Icons Mapping Here ---
const getVehicleIcon = (model) => {
    // Default styling for the icon container
    const iconBaseClass = "flex items-center justify-center bg-white rounded-full border-2 border-white shadow-md";
    const iconSize = [32, 32]; // Width, Height in pixels

    let iconHtml = '';

    // Switch based on your VEHICLE_TYPES array
    switch (model) {
        case "Voiture":
            // Blue Car
            iconHtml = `<div class="${iconBaseClass} w-8 h-8"><i class="fas fa-car text-blue-600 text-sm"></i></div>`;
            break;
        case "Camion":
            // Red Truck
            iconHtml = `<div class="${iconBaseClass} w-8 h-8"><i class="fas fa-truck text-red-600 text-sm"></i></div>`;
            break;
        case "Camionnette":
        case "Utilitaire":
            // Orange Van
            iconHtml = `<div class="${iconBaseClass} w-8 h-8"><i class="fas fa-shuttle-van text-orange-500 text-sm"></i></div>`;
            break;
        case "Moto":
            // Green Motorcycle
            iconHtml = `<div class="${iconBaseClass} w-8 h-8"><i class="fas fa-motorcycle text-green-600 text-sm"></i></div>`;
            break;
        default:
            // Grey Default
            iconHtml = `<div class="${iconBaseClass} w-8 h-8"><i class="fas fa-map-marker-alt text-gray-600 text-base"></i></div>`;
    }

    return L.divIcon({
        className: 'custom-vehicle-icon', // Leave this empty to rely on Tailwind inside html
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: [16, 16], // Center the icon (half of width/height)
        popupAnchor: [0, -16], // Popup appears above icon
    });
};

const DriverMap = ({ drivers = [] }) => {
    const validDrivers = drivers.filter(d => d.lat !== null && d.longe !== null);
    const defaultCenter = [33.5731, -7.5898];

    // Calculate center
    const mapCenter = validDrivers.length > 0 
        ? [validDrivers[0].lat, validDrivers[0].longe] 
        : defaultCenter;

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
            <MapContainer 
                center={mapCenter} 
                zoom={6} 
                style={{ height: '100%', width: '100%' }}
            >
                <MapController />
                
                {/* Colorful Map Style */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validDrivers.map((driver) => (
                    <Marker 
                        key={driver.id} 
                        position={[driver.lat, driver.longe]}
                        // 2. Use the dynamic icon function here
                        icon={getVehicleIcon(driver.model)}
                    >
                        
                        <Popup className="custom-leaflet-popup">
                            <div className="text-center min-w-[150px]">
                                <h4 className="font-bold text-gray-800 text-sm mb-1">
                                    {driver.user?.username || "Inconnu"}
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p className="font-semibold flex items-center justify-center gap-1">
                                        {/* Optional: Show small icon in popup too */}
                                        {driver.model === 'Moto' ? <i className="fas fa-motorcycle"/> : <i className="fas fa-car"/>}
                                        {driver.model}
                                    </p>
                                    <p className="bg-gray-100 rounded px-1 py-0.5 inline-block border border-gray-200">
                                        {driver.licensePlate}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 text-xs shadow-xl font-medium">
                <i className="fas fa-car text-blue-500 mr-2"></i>
                Active Vehicles: <strong>{validDrivers.length}</strong>
            </div>
        </div>
    );
};

export default DriverMap;