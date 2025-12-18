import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // 1. Import Hook Form
import userService from '../../services/userService';
import transporService from '../../services/transporService';
import useDriverStore from '../../State/useDriverStore';

const VEHICLE_TYPES = [
    "Camionnette",
    "Voiture",
    "Camion",
    "Utilitaire",
    "Moto"
];

const AddDriverModal = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);

    // 2. Destructure hook form methods
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userData = await userService.getAllUsers();
                setUsers(Array.isArray(userData) ? userData : []);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUsers([]);
            }
        };

        if (isOpen) {
            fetchUsers();
            reset(); // 3. Reset form when modal opens
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    // 4. Wrapper for data submission
    const onFormSubmit = async (data) => {
        // data contains { driverId, vehicleType, plateNumber }
        try {
            const vehiculeData = {
                licensePlate: data.licensePlate,
                model: data.model,
                userId: data.userId,
                longe: -6.722442,
                lat: 33.987165
            }
            await transporService.addVehicle(vehiculeData);
        } catch (error) {
            console.log(error);
        }
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-car text-blue-400"></i> Ajouter un Véhicule
                    </h3>
                    <button
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        onClick={onClose}
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form className="space-y-5" onSubmit={handleSubmit(onFormSubmit)}>

                        {/* Driver Name Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Nom du chauffeur <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white focus:ring-2 outline-none appearance-none transition-colors
                                        ${errors.driverId
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    {...register("userId", {
                                        required: "Veuillez sélectionner un chauffeur"
                                    })}
                                >
                                    <option value="">Sélectionner un chauffeur</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name || `${user.firstName} ${user.lastName}`}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                            {/* Error Message */}
                            {errors.driverId && (
                                <p className="text-red-400 text-xs mt-0.5">{errors.driverId.message}</p>
                            )}
                        </div>

                        {/* Vehicle Type Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Type de véhicule <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white focus:ring-2 outline-none appearance-none transition-colors
                                        ${errors.vehicleType
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    {...register("model", {
                                        required: "Le type de véhicule est requis"
                                    })}
                                >
                                    <option value="">Sélectionner le type</option>
                                    {VEHICLE_TYPES.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                            {errors.vehicleType && (
                                <p className="text-red-400 text-xs mt-0.5">{errors.vehicleType.message}</p>
                            )}
                        </div>

                        {/* Plate Number Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-300">
                                Numéro d'immatriculation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white focus:ring-2 outline-none placeholder-gray-600 uppercase transition-colors
                                    ${errors.plateNumber
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder="Ex: MAR-1234"
                                {...register("licensePlate", {
                                    required: "L'immatriculation est requise",
                                    minLength: {
                                        value: 3,
                                        message: "Minimum 3 caractères"
                                    }
                                })}
                            />
                            {errors.plateNumber && (
                                <p className="text-red-400 text-xs mt-0.5">{errors.plateNumber.message}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-6">
                            <button
                                type="button"
                                className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                                onClick={onClose}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg"
                            >
                                Ajouter
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddDriverModal;