import { useEffect, useRef } from 'react';

export const useTransportMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const vehicleCounterRef = useRef(6); // Start from 6 since we have driver2-5

  useEffect(() => {
    // Check if Leaflet is loaded
    if (!window.L) {
      console.error('Leaflet library not loaded');
      return;
    }

    const mapElement = document.getElementById('transportMap');
    if (!mapElement || mapRef.current) return;

    // Initialize map centered on Casablanca, Morocco
    mapRef.current = window.L.map('transportMap', {
      scrollWheelZoom: true,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      wheelPxPerZoomLevel: 120
    }).setView([33.5731, -7.5898], 12);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Driver locations (only 4 drivers)
    const drivers = [
      {
        id: 'driver2',
        name: 'Fatima El Amrani',
        vehicle: 'Voiture Service - MAR-5678',
        lat: 33.5900,
        lng: -7.6030,
        status: 'moving',
        icon: '🚗',
        distance: '52 km',
        fuel: '5.2 L',
        co2: '12.2 kg',
        destination: 'Centre Ville'
      },
      {
        id: 'driver3',
        name: 'Youssef Berrada',
        vehicle: 'Camion Transport - MAR-9012',
        lat: 33.5650,
        lng: -7.5700,
        status: 'moving',
        icon: '🚚',
        distance: '89 km',
        fuel: '8.9 L',
        co2: '21.0 kg',
        destination: 'Route de Rabat'
      },
      {
        id: 'driver4',
        name: 'Karim Tazi',
        vehicle: 'Utilitaire - MAR-3456',
        lat: 33.5731,
        lng: -7.5898,
        status: 'parked',
        icon: '🚙',
        distance: '23 km',
        fuel: '2.3 L',
        co2: '5.4 kg',
        destination: 'Parking Entreprise'
      },
      {
        id: 'driver5',
        name: 'Samir Alami',
        vehicle: 'Voiture Commerciale - MAR-7890',
        lat: 33.5820,
        lng: -7.5950,
        status: 'parked',
        icon: '🚗',
        distance: '16 km',
        fuel: '1.6 L',
        co2: '3.8 kg',
        destination: 'Parking Entreprise'
      }
    ];

    // Add markers for each driver
    drivers.forEach(driver => {
      const iconHtml = `
        <div style="
          background: ${driver.status === 'moving' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'};
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          position: relative;
        ">
          <span style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            line-height: 1;
          ">${driver.icon}</span>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #667eea;"><i class="fas fa-user"></i> ${driver.name}</h4>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-car" style="margin-right: 6px; color: #667eea;"></i><strong>Véhicule:</strong> ${driver.vehicle}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-circle" style="margin-right: 6px; color: ${driver.status === 'moving' ? '#43e97b' : '#95a5a6'};"></i><strong>Statut:</strong> ${driver.status === 'moving' ? 'En route' : 'Stationné'}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-road" style="margin-right: 6px; color: #667eea;"></i><strong>Distance:</strong> ${driver.distance}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-gas-pump" style="margin-right: 6px; color: #f59e0b;"></i><strong>Carburant:</strong> ${driver.fuel}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-leaf" style="margin-right: 6px; color: #43e97b;"></i><strong>CO2:</strong> ${driver.co2}</p>
          <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-map-marker-alt" style="margin-right: 6px; color: #f5576c;"></i><strong>Destination:</strong> ${driver.destination}</p>
        </div>
      `;

      const marker = window.L.marker([driver.lat, driver.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

      markersRef.current[driver.id] = marker;
    });

    console.log('Transport map initialized with drivers');

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Function to add a new driver marker to the map
  const addDriverMarker = (driver) => {
    if (!mapRef.current || !window.L) {
      console.error('Map not initialized or Leaflet not loaded');
      return;
    }

    console.log('Adding marker for driver:', driver);

    const iconHtml = `
      <div style="
        background: ${driver.status === 'moving' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'};
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        position: relative;
      ">
        <span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
          line-height: 1;
        ">${driver.icon}</span>
      </div>
    `;

    const customIcon = window.L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 10px 0; color: #667eea;"><i class="fas fa-user"></i> ${driver.name}</h4>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-car" style="margin-right: 6px; color: #667eea;"></i><strong>Véhicule:</strong> ${driver.vehicle}</p>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-circle" style="margin-right: 6px; color: ${driver.status === 'moving' ? '#43e97b' : '#95a5a6'};"></i><strong>Statut:</strong> ${driver.status === 'moving' ? 'En route' : 'Stationné'}</p>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-road" style="margin-right: 6px; color: #667eea;"></i><strong>Distance:</strong> ${driver.distance}</p>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-gas-pump" style="margin-right: 6px; color: #f59e0b;"></i><strong>Carburant:</strong> ${driver.fuel}</p>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-leaf" style="margin-right: 6px; color: #43e97b;"></i><strong>CO2:</strong> ${driver.co2}</p>
        <p style="margin: 5px 0; font-size: 13px;"><i class="fas fa-map-marker-alt" style="margin-right: 6px; color: #f5576c;"></i><strong>Destination:</strong> ${driver.destination}</p>
      </div>
    `;

    const marker = window.L.marker([driver.lat, driver.lng], { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

    markersRef.current[driver.id] = marker;

    console.log('Marker added successfully at:', driver.lat, driver.lng);
    console.log('Total markers:', Object.keys(markersRef.current).length);
  };

  return { mapRef, markersRef, vehicleCounterRef, addDriverMarker };
};
