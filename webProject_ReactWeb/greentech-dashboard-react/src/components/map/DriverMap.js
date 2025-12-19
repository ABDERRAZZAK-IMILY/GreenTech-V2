import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapController from './MapController';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const DriverMap = ({ drivers = [] }) => {
    // 1. Filter out drivers with missing coordinates (null lat or longe)
    const validDrivers = drivers.filter(d => d.lat !== null && d.longe !== null);

    // Default center (Casablanca) if no drivers exist
    const defaultCenter = [33.5731, -7.5898];
    
    // Center the map on the first valid driver, or use default
    const mapCenter = validDrivers.length > 0 
        ? [validDrivers[0].lat, validDrivers[0].longe] 
        : defaultCenter;

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
            <MapContainer 
                center={mapCenter} 
                zoom={6} // Zoomed out a bit to see multiple markers
                style={{ height: '100%', width: '100%' }}
            >
            <MapController />
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* 2. Map through the valid drivers */}
                {validDrivers.map((driver) => (
                    <Marker 
                        key={driver.id} 
                        position={[driver.lat, driver.longe]}
                    >
                        <Popup className="custom-leaflet-popup">
                            <div className="text-center min-w-[150px]">
                                <h4 className="font-bold text-gray-800 text-sm mb-1">
                                    {driver.user?.username || "Inconnu"}
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p className="font-semibold">{driver.model}</p>
                                    <p className="bg-gray-100 rounded px-1 py-0.5 inline-block border border-gray-200">
                                        {driver.licensePlate}
                                    </p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
                                    Lat: {driver.lat.toFixed(4)} <br/> 
                                    Lon: {driver.longe.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Optional: Legend or Count Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-gray-800/90 backdrop-blur text-white px-3 py-1.5 rounded-lg border border-gray-600 text-xs shadow-xl">
                <i className="fas fa-car text-blue-400 mr-2"></i>
                Active Vehicles: <strong>{validDrivers.length}</strong>
            </div>
        </div>
    );
};

export default DriverMap;