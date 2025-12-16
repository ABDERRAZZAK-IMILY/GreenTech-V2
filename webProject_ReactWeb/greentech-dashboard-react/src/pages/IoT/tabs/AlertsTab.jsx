import axios from 'axios';
import React, { useState, useEffect } from 'react';

// Imports
import DashboardStats from '../../Dashboard/DashboardStats'; 
import AlertsFeed from './AlertsFeed';
import AlertDetailsModal from '../../../utils/AlertDetailsModal'; // <-- IMPORT JDID

const AlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // STATE JDID POUR LE MODAL
  const [selectedAlert, setSelectedAlert] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIQUE FETCH (Rien ne change ici) ---
  const fetchAiAlerts = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/ai/alerts');
      setAlerts(response.data);
      localStorage.setItem('cachedAiAlerts', JSON.stringify(response.data));
      localStorage.setItem('lastAiUpdate', new Date().toLocaleTimeString());
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      if (alerts.length === 0) setError("Impossible de contacter le serveur IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('cachedAiAlerts');
    if (cachedData) {
      setAlerts(JSON.parse(cachedData));
      setLastUpdated(localStorage.getItem('lastAiUpdate'));
      setLoading(false);
      fetchAiAlerts(true);
    } else {
      fetchAiAlerts(false);
    }
    const interval = setInterval(() => fetchAiAlerts(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const acknowledgeAlert = (alertId) => {
    const newAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(newAlerts);
    localStorage.setItem('cachedAiAlerts', JSON.stringify(newAlerts));
  };

  // NOUVELLE FONCTION viewAlertDetails
  const viewAlertDetails = (alertId) => {
    const alertData = alerts.find(a => a.id === alertId);
    if (alertData) {
      setSelectedAlert(alertData); // On stocke l'alerte cliquée
      setIsModalOpen(true);        // On ouvre le modal
    }
  };

  const stats = {
    critical: alerts.filter(a => a.type === 'critical').length,
    offline: alerts.filter(a => a.type === 'offline').length,
    total: alerts.length
  };

  return (
    <div>
      {/* 1. Stats */}
      <DashboardStats 
        lastUpdated={lastUpdated} loading={loading} 
        onRefresh={() => fetchAiAlerts(false)} stats={stats}
      />

      {/* 2. Liste */}
      <AlertsFeed 
        alerts={alerts} loading={loading} error={error} 
        onAck={acknowledgeAlert} onDetails={viewAlertDetails} 
      />

      {/* 3. LE MODAL (Invisible tant que isModalOpen est false) */}
      <AlertDetailsModal 
        isOpen={isModalOpen}
        alert={selectedAlert}
        onClose={() => setIsModalOpen(false)}
        onAck={acknowledgeAlert}
      />
    </div>
  );
};

export default AlertsTab;