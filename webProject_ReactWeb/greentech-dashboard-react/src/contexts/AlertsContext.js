import React, { createContext, useContext, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const AlertsContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider');
  }
  return context;
};

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [marketplaceNotifications, setMarketplaceNotifications] = useState([]);

  const addSensorAlert = (alert) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const handleMarketplaceUpdate = (notification) => {
    setMarketplaceNotifications((prev) => [notification, ...prev]);
  };

  useNotifications(addSensorAlert, handleMarketplaceUpdate);

  const value = {
    alerts,
    addSensorAlert,
    removeAlert,
    clearAlerts,
    marketplaceNotifications,
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};
