import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { createDepartment } from '../../services/departmentSerice';

const AddDepartment = ({ closeModals }) => {
    // 1. Initialize React Hook Form
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm();

    // 2. Handle Form Submission
    const onSubmit = async (data) => {
        const response = await createDepartment(data);
        if (response) {
            if (response.status === 200) {
            closeModals(false); 
        }else {
            console.log(response.data);
        }
        }
        
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => closeModals(false)}
        >
            {/* Modal Content */}
            <div
                className="w-full max-w-[600px] m-4 overflow-hidden rounded-[20px] border-2 border-[#667eea]/30 bg-gradient-to-br from-[#1e272e]/98 to-[#2d3436]/98 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-br from-blue-600 to-indigo-600 px-8 py-6">
                    <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                        <i className="fas fa-building"></i> Ajouter un département
                    </h3>
                    <button
                        onClick={() => closeModals(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-300 hover:bg-white/30"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                    
                    {/* Department Name Input */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-semibold text-gray-200">
                            <i className="fas fa-tag mr-2 text-blue-500"></i>
                            Nom du département
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Ressources Humaines"
                            className={`w-full rounded-xl border-2 bg-white/5 px-4 py-3 text-sm text-gray-200 outline-none transition-all duration-300 placeholder:text-gray-500 
                                ${errors.departmentName 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-white/10 focus:border-blue-500'
                                }`}
                            {...register("name", { 
                                required: "Le nom du département est requis",
                                minLength: {
                                    value: 1,
                                    message: "Le nom doit contenir au moins 3 caractères"
                                }
                            })}
                        />
                        {/* Error Message */}
                        {errors.departmentName && (
                            <p className="mt-2 text-xs font-semibold text-red-400 flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {errors.departmentName.message}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={() => closeModals(false)}
                            className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 p-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(102,126,234,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)]"
                        >
                            <i className="fas fa-plus"></i> Confirmer
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default AddDepartment;