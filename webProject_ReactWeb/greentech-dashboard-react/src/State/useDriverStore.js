import { create } from 'zustand';
import transporService from '../services/transporService'; // Adjust path as needed

const useDriverStore = create((set) => ({
    drivers: [],
    isLoading: false,
    error: null,
    focusedLocation: null,

    // Action to fetch drivers
    setFocusedLocation: (lat, lng) => set({ 
        focusedLocation: { lat, lng } 
    }),
    fetchDrivers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await transporService.getAllVehicles();
            set({ drivers: data, isLoading: false });
        } catch (error) {
            console.error("Error fetching drivers:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    // Optional: Action to add a driver locally (optimistic update)
    addDriver: (newDriver) => set((state) => ({ 
        drivers: [...state.drivers, newDriver] 
    })),

    // Optional: Action to remove a driver locally
    removeDriver: (driverId) => set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== driverId)
    }))
}));

export default useDriverStore;