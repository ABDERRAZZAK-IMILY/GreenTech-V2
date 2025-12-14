import React from 'react';

const MembersTable = ({
    members = [],
    loading = false,
    onOpenPoints,
    onEdit,
    onDelete
}) => {

    // Filter active members (logic extracted from your original code)
    const activeMembers = members.filter(m => m.status === 'active');

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/[0.03]">

                {/* Table Header */}
                <thead className="sticky top-0 z-10 bg-[#1e272e]/98 text-white">
                    <tr>
                        {['Nom', 'Département', 'Eco-Coins', 'Gagnés', 'Dépensés', 'Actions', 'Niveau', 'Gestion'].map((header, index) => (
                            <th
                                key={index}
                                className={`p-3 border-b-2 border-white/10 ${header === 'Gestion' ? 'text-center' : 'text-left'}`}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className="text-white">
                    {loading ? (
                        <tr>
                            <td colSpan="8" className="p-10 text-center text-gray-400">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <i className="fas fa-spinner fa-spin"></i> Chargement des membres...
                                </div>
                            </td>
                        </tr>
                    ) : activeMembers.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="p-10 text-center text-gray-400">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <i className="fas fa-users-slash"></i> Aucun membre actif trouvé
                                </div>
                            </td>
                        </tr>
                    ) : (
                        activeMembers.map((member) => (
                            <tr
                                key={member.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                            >
                                {/* Name & Email */}
                                <td className="p-3">
                                    <div>
                                        <div className="font-semibold">{member.name}</div>
                                        <div className="text-xs text-gray-400">{member.email}</div>
                                    </div>
                                </td>

                                {/* Department */}
                                <td className="p-3">{member.department}</td>

                                {/* Eco-Coins */}
                                <td className="p-3">
                                    <span className="font-bold text-[#feca57]">{member.ecoCoins}</span>
                                </td>

                                {/* Earned */}
                                <td className="p-3">
                                    <span className="text-emerald-400">+{member.pointsEarned}</span>
                                </td>

                                {/* Spent */}
                                <td className="p-3">
                                    <span className="text-red-400">-{member.pointsSpent}</span>
                                </td>

                                {/* Actions Completed */}
                                <td className="p-3">{member.actionsCompleted}</td>

                                {/* Level Badge */}
                                <td className="p-3">
                                    <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full shadow-[0_2px_8px_rgba(102,126,234,0.3)] 
                                   bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)]">
                                        Niv. {member.level}
                                    </span>
                                </td>

                                {/* Management Buttons */}
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-2">

                                        {/* Points Button (Blue/Indigo) */}
                                        <button
                                            onClick={() => onOpenPoints(member)}
                                            title="Attribuer/Retirer points"
                                            className="group flex items-center justify-center w-9 h-9 text-white rounded-[10px] border-none cursor-pointer
                                 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)]
                                 shadow-[0_3px_10px_rgba(102,126,234,0.4)]
                                 transition-all duration-300 transform
                                 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_15px_rgba(102,126,234,0.6)]"
                                        >
                                            <i className="fas fa-coins"></i>
                                        </button>

                                        {/* Edit Button (Gold/Orange) */}
                                        <button
                                            onClick={() => onEdit(member)}
                                            title="Modifier"
                                            className="group flex items-center justify-center w-9 h-9 text-white rounded-[10px] border-none cursor-pointer
                                 bg-gradient-to-br from-[#c9971f] to-[#d47d1f]
                                 shadow-[0_3px_10px_rgba(201,151,31,0.4)]
                                 transition-all duration-300 transform
                                 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_15px_rgba(201,151,31,0.6)]"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>

                                        {/* Delete Button (Red) */}
                                        <button
                                            onClick={() => onDelete(member.id)}
                                            title="Supprimer"
                                            className="group flex items-center justify-center w-9 h-9 text-white rounded-[10px] border-none cursor-pointer
                                 bg-gradient-to-br from-[#c94b4b] to-[#b84855]
                                 shadow-[0_3px_10px_rgba(201,75,75,0.4)]
                                 transition-all duration-300 transform
                                 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_15px_rgba(201,75,75,0.6)]"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MembersTable;