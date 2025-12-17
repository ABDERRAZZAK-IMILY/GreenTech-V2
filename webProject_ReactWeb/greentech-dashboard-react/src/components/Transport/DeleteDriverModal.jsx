import React from 'react';

const DeleteDriverModal = ({ isOpen, onClose, onConfirm, driverName }) => {
    // Return null if not open
    if (!isOpen) return null;

    return (
        // Overlay
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-red-500"></i> Confirmer la suppression
                    </h3>
                    <button 
                        className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                        Êtes-vous sûr de vouloir supprimer le chauffeur <br />
                        <span className="font-bold text-white text-lg">{driverName}</span> ?
                    </p>

                    {/* Warning Alert Box */}
                    <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 mb-8 flex items-center justify-center gap-2 text-red-400 text-sm">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>Cette action est irréversible.</span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-3">
                        <button 
                            className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 hover:text-white transition-colors focus:ring-2 focus:ring-gray-500"
                            onClick={onClose}
                        >
                            <i className="fas fa-times mr-2"></i> Annuler
                        </button>
                        <button 
                            className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg hover:shadow-red-900/40 transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            onClick={onConfirm}
                        >
                            <i className="fas fa-trash mr-2"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteDriverModal;