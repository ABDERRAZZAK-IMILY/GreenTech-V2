import React from 'react';

const AdminStatistics = ({
    totalEmployees = 0,
    totalActionsCompleted = 0,
    totalBadgesEarned = 0,
    pendingRequests = 0,
    participationRate = 0
}) => {

    // Configuration for each stat card to keep the JSX clean
    const stats = [
        {
            id: 1,
            icon: "👥",
            value: totalEmployees,
            label: "Employés Actifs",
            // Purple theme
            bg: "bg-[#764ba2]/25",
            border: "border-[#764ba2]/40",
            text: "text-[#a78bfa]"
        },
        {
            id: 2,
            icon: "✅",
            value: totalActionsCompleted.toLocaleString(),
            label: "Actions Complétées",
            // Green theme
            bg: "bg-[#43e97b]/20",
            border: "border-[#43e97b]/30",
            text: "text-[#43e97b]"
        },
        {
            id: 3,
            icon: "🏆",
            value: totalBadgesEarned,
            label: "Badges Obtenus",
            // Yellow theme
            bg: "bg-[#feca57]/20",
            border: "border-[#feca57]/30",
            text: "text-[#feca57]"
        },
        {
            id: 4,
            icon: "⏳",
            value: pendingRequests,
            label: "Demandes en Attente",
            // Pink theme
            bg: "bg-[#f093fb]/20",
            border: "border-[#f093fb]/30",
            text: "text-[#f093fb]"
        },
        {
            id: 5,
            icon: "📊",
            value: `${participationRate}%`,
            label: "Taux de Participation",
            // Orange theme
            bg: "bg-[#ff9f40]/20",
            border: "border-[#ff9f40]/30",
            text: "text-[#ff9f40]"
        }
    ];

    return (
        <div className="mb-8 rounded-2xl border border-[#667eea]/30 bg-gradient-to-br from-[#667eea]/15 to-[#764ba2]/15 p-6 backdrop-blur-md">

            {/* Section Title */}
            <h3 className="mb-5 flex items-center gap-2.5 text-lg font-bold text-white">
                <i className="fas fa-chart-pie"></i> Statistiques des Employés
            </h3>

            {/* Grid Container */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className={`flex flex-col items-center justify-center rounded-xl border p-5 text-center transition-transform duration-300 hover:-translate-y-1 ${stat.bg} ${stat.border}`}
                    >
                        <div className="mb-2 text-3xl">{stat.icon}</div>
                        <div className={`mb-1 text-2xl font-bold ${stat.text}`}>
                            {stat.value}
                        </div>
                        <div className="text-xs font-medium text-gray-400">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStatistics;