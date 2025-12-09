import React, { createContext, useState, useContext } from 'react';

const EmployeeContext = createContext();

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  // Solde initial de l'employé
  const [ecoCoins, setEcoCoins] = useState(3450);

  // Historique des demandes d'achat
  const [purchaseHistory, setPurchaseHistory] = useState([
    {
      id: 1,
      productName: "Café Gratuit - 1 Semaine",
      cost: 500,
      date: "2024-12-01",
      status: "approved",
      icon: "☕"
    },
    {
      id: 2,
      productName: "Parking Premium - 1 Mois",
      cost: 1000,
      date: "2024-11-28",
      status: "approved",
      icon: "🅿️"
    },
    {
      id: 3,
      productName: "Journée Télétravail Bonus",
      cost: 1500,
      date: "2024-11-25",
      status: "pending",
      icon: "🏠"
    },
    {
      id: 4,
      productName: "Bon d'achat Jumia",
      cost: 2000,
      date: "2024-11-20",
      status: "approved",
      icon: "🎁"
    },
    {
      id: 5,
      productName: "Café Gratuit - 1 Semaine",
      cost: 500,
      date: "2024-11-15",
      status: "rejected",
      icon: "☕"
    }
  ]);

  // Actions soumises en attente de validation
  const [pendingActions, setPendingActions] = useState([]);

  // Ajouter des Eco-Coins (quand une action est validée)
  const addEcoCoins = (amount) => {
    setEcoCoins(prev => prev + amount);
  };

  // Déduire des Eco-Coins (lors d'un achat)
  const deductEcoCoins = (amount) => {
    setEcoCoins(prev => prev - amount);
  };

  // Ajouter un achat à l'historique
  const addPurchaseToHistory = (product) => {
    const newPurchase = {
      id: Date.now(),
      productName: product.name,
      cost: product.cost,
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      icon: product.icon
    };
    setPurchaseHistory(prev => [newPurchase, ...prev]);
  };

  // Ajouter une action en attente de validation
  const submitActionForApproval = (action) => {
    const newAction = {
      id: Date.now(),
      employeeName: action.employeeName,
      actionName: action.actionName,
      points: action.points,
      proofImage: action.proofImage,
      date: new Date().toISOString(),
      status: 'pending'
    };
    setPendingActions(prev => [newAction, ...prev]);
  };

  const value = {
    ecoCoins,
    setEcoCoins,
    addEcoCoins,
    deductEcoCoins,
    purchaseHistory,
    setPurchaseHistory,
    addPurchaseToHistory,
    pendingActions,
    setPendingActions,
    submitActionForApproval
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};
