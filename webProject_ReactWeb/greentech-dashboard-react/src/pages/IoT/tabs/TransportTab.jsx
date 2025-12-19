import React, { useEffect, useState } from 'react';
import DriverList from '../../../components/Transport/DriverList';
import ManualEntrySection from '../../../components/Transport/ManualEntrySection';
import DriverMap from '../../../components/map/DriverMap';
import useDriverStore from '../../../State/useDriverStore';
import transporService from '../../../services/transporService';

const TransportTab = () => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [totaleDistanceToday, settotaleDistanceToday] = useState(1)
  const { drivers, fetchDrivers } = useDriverStore();

  useEffect(() => {
    fetchDrivers();
    const fecthtotaleDistance = async () => {
      const data = await transporService.totaleDistanceToday();
      settotaleDistanceToday(data.totalDistance);
    }

    fecthtotaleDistance();
    const intervalId = setInterval(fetchDrivers, 2000);
    return () => clearInterval(intervalId);
  }, [fetchDrivers]);

  const toggleTransportOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  return (
    <div className="p-6 space-y-8  min-h-screen">

      {/* Page Title */}
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
          <i className="fas fa-map-marked-alt" />
        </div>
        Suivi en Temps Réel des Véhicules
      </h3>

      {/* 1. Collapsible Overview Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg transition-all duration-300">
        <div
          className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors ${isOverviewOpen ? 'bg-gray-750 border-b border-gray-700' : ''}`}
          onClick={toggleTransportOverview}
        >
          <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-200">
            <i className="fas fa-chart-pie text-purple-400" /> Vue d'ensemble par type de véhicule
          </h4>
          <i className={`fas fa-chevron-${isOverviewOpen ? 'up' : 'down'} text-gray-400 transition-transform duration-300`} />
        </div>

        {/* Collapsible Content */}
        <div className={`transition-all duration-300 ease-in-out ${isOverviewOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-blue-900/40 text-blue-100 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg"><i className="fas fa-car mr-2" /> Type</th>
                  <th className="px-6 py-4"><i className="fas fa-users mr-2" /> Actifs</th>
                  <th className="px-6 py-4"><i className="fas fa-road mr-2" /> Distance</th>
                  <th className="px-6 py-4"><i className="fas fa-gas-pump mr-2" /> Carburant</th>
                  <th className="px-6 py-4"><i className="fas fa-leaf mr-2" /> CO2</th>
                  <th className="px-6 py-4 rounded-tr-lg"><i className="fas fa-clock mr-2" /> Temps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Example Row 1: Camionnette */}
                <tr className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <span className="text-xl hue-rotate-[200deg]">🚐</span> Camionnette
                  </td>
                  <td className="px-6 py-4">0 véhicules</td>
                  <td className="px-6 py-4">0.0 km</td>
                  <td className="px-6 py-4">0.0 L</td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-900/30 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-900/50">
                      0.0 kg CO2
                    </span>
                  </td>
                  <td className="px-6 py-4">0min</td>
                </tr>

                {/* Example Row 2: Voiture */}
                <tr className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <span className="text-xl hue-rotate-[80deg]">🚗</span> Voiture
                  </td>
                  <td className="px-6 py-4">2 véhicules</td>
                  <td className="px-6 py-4">68.0 km</td>
                  <td className="px-6 py-4">6.8 L</td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-900/30 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-900/50">
                      16.0 kg CO2
                    </span>
                  </td>
                  <td className="px-6 py-4">3h 00min</td>
                </tr>

                {/* Add other static rows here similarly... */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-green-400 to-emerald-500">
            <i className="fas fa-car text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Véhicules Actifs</h4>
            <div className="text-2xl font-bold text-white">3/5</div>
            <div className="text-xs text-green-400 font-medium">En déplacement</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <i className="fas fa-road text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Distance Totale</h4>
            <div className="text-2xl font-bold text-white">{totaleDistanceToday.toFixed(2)} km</div>
            <div className="text-xs text-indigo-400 font-medium">Aujourd'hui</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <i className="fas fa-gas-pump text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Carburant</h4>
            <div className="text-2xl font-bold text-white">24.7 L</div>
            <div className="text-xs text-orange-400 font-medium">Consommé</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-pink-500 to-rose-500">
            <i className="fas fa-leaf text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Émissions CO2</h4>
            <div className="text-2xl font-bold text-white">58.2 kg</div>
            <div className="text-xs text-rose-400 font-medium">Rejeté</div>
          </div>
        </div>
      </div>

      {/* 3. Map Section */}
      <div className="w-full">
        <DriverMap drivers={drivers} />
      </div>

      {/* 4. Driver List Component */}
      <DriverList />

      {/* 5. Manual Entry Form */}
      <ManualEntrySection />

      {/* 6. History Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-history text-gray-400" /> Historique des Trajets
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-700/50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Date & Heure</th>
                <th className="px-6 py-3">Chauffeur</th>
                <th className="px-6 py-3">Véhicule</th>
                <th className="px-6 py-3">Immatriculation</th>
                <th className="px-6 py-3">Carburant (L)</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody id="transportHistoryTableBody" className="divide-y divide-gray-700">
              {/* Dynamic rows would go here. Empty state example: */}
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                  Aucun historique récent disponible
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TransportTab;