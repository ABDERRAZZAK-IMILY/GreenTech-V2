import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import useDriverStore from '../../State/useDriverStore';

const MapController = () => {
    const map = useMap();
    const { focusedLocation } = useDriverStore();

    useEffect(() => {
        if (focusedLocation) {
            // Leaflet method to smoothly animate the camera
            map.flyTo(
                [focusedLocation.lat, focusedLocation.lng], 
                15, // Zoom level
                { duration: 2 } // Animation duration in seconds
            );
        }
    }, [focusedLocation, map]);

    return null; // This component renders nothing visually
};

export default MapController;