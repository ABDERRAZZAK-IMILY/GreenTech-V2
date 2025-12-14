import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const AddMemberModal = ({ isOpen, onClose, onSave, departments }) => {
    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    // Reset form when modal opens or closes to ensure a fresh state
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = (data) => {
        onSave(data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[5px]"
            onClick={onClose}
        >
            {/* Modal Content Card */}
            <div
                className="w-full max-w-[600px] m-4 rounded-[20px] border-2 border-[#667eea]/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-fadeIn"
                // Keep the complex gradient background inline or add to config
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 39, 46, 0.98) 0%, rgba(45, 52, 54, 0.98) 100%)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)]">
                    <h3 className="flex items-center gap-3 m-0 text-xl font-bold text-white">
                        <i className="fas fa-user-plus"></i> Ajouter un membre
                    </h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="flex items-center justify-center w-[35px] h-[35px] text-white bg-white/20 rounded-full transition-all duration-300 hover:bg-white/30"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                    {/* Full Name Input */}
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-semibold text-white">
                            <i className="fas fa-user mr-2 text-[var(--primary-color)]"></i>
                            Nom complet
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Youssef Alami"
                            {...register('name', { required: 'Le nom complet est requis' })}
                            className={`w-full px-4 py-3 text-sm text-white bg-white/5 border-2 rounded-[10px] 
                         outline-none transition-all duration-300 placeholder-gray-500
                         ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[var(--primary-color)]'}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    {/* Email Input */}
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-semibold text-white">
                            <i className="fas fa-envelope mr-2 text-[var(--primary-color)]"></i>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="youssef.alami@greentech.com"
                            {...register('email', {
                                required: 'L\'email est requis',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Adresse email invalide',
                                },
                            })}
                            className={`w-full px-4 py-3 text-sm text-white bg-white/5 border-2 rounded-[10px] 
                         outline-none transition-all duration-300 placeholder-gray-500
                         ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[var(--primary-color)]'}`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                    </div>

                    {/* Grid for Department & Poste */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        {/* Department Select */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-white">
                                <i className="fas fa-building mr-2 text-[var(--primary-color)]"></i>
                                Département
                            </label>
                            <select
                                {...register('department', { required: 'Veuillez sélectionner un département' })}
                                className={`w-full px-4 py-3 text-sm text-white bg-white/5 border-2 rounded-[10px] 
                           outline-none transition-all duration-300 cursor-pointer appearance-none
                           ${errors.department ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[var(--primary-color)]'}`}
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Sélectionner...</option>
                                {departments && departments.map((dep) => (
                                    <option key={dep.id} value={dep.name} className="bg-slate-900 text-white">
                                        {dep.name}
                                    </option>
                                ))}
                            </select>
                            {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department.message}</p>}
                        </div>

                        {/* Poste Input */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-white">
                                <i className="fas fa-briefcase mr-2 text-[var(--primary-color)]"></i>
                                Poste
                            </label>
                            <input
                                type="text"
                                placeholder="Développeur, Manager..."
                                {...register('jobTitle', { required: 'Le poste est requis' })}
                                className={`w-full px-4 py-3 text-sm text-white bg-white/5 border-2 rounded-[10px] 
                           outline-none transition-all duration-300 placeholder-gray-500
                           ${errors.jobTitle ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[var(--primary-color)]'}`}
                            />
                            {errors.jobTitle && <p className="mt-1 text-xs text-red-400">{errors.jobTitle.message}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 text-sm font-semibold text-white bg-white/10 border-2 border-white/20 rounded-[10px] 
                         transition-all duration-300 hover:bg-white/15 cursor-pointer"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white rounded-[10px] border-none cursor-pointer
                         bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)]
                         shadow-[0_4px_15px_rgba(102,126,234,0.4)]
                         transition-all duration-300 transform
                         hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)]"
                        >
                            <i className="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;