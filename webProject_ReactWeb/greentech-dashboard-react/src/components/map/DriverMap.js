import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. Fix for broken Marker Icons in React ---
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
// ------------------------------------------------

const DriverMap = ({ 
    latitude = 33.5731, 
    longitude = -7.5898, 
    driverName = "Chauffeur",
    vehicle = "Véhicule"
}) => {
    // Guard clause: If no coordinates
    if (!latitude || !longitude) {
        return (
            <div className="h-[400px] w-full bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center text-gray-500">
                <i className="fas fa-map-slash mr-2"></i> Pas de position GPS
            </div>
        );
    }

    const position = [latitude, longitude];

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
            <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                {/* 2. Free OpenStreetMap Tiles (Dark Mode via CartoDB) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* 3. The Marker */}
                <Marker position={position}>
                    <Popup className="custom-leaflet-popup">
                        <div className="text-center">
                            <h4 className="font-bold text-gray-800 text-sm">{driverName}</h4>
                            <p className="text-xs text-gray-600 m-0">{vehicle}</p>
                            <div className="mt-1 text-[10px] text-gray-400">
                                {latitude.toFixed(4)}, {longitude.toFixed(4)}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default DriverMap;