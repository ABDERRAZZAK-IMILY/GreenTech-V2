import React, { createContext, useState, useContext } from 'react';

const PendingActionsContext = createContext();

export const usePendingActions = () => {
  const context = useContext(PendingActionsContext);
  if (!context) {
    throw new Error('usePendingActions must be used within PendingActionsProvider');
  }
  return context;
};

export const PendingActionsProvider = ({ children }) => {
  // Pending action submissions awaiting admin approval
  const [pendingActions, setPendingActions] = useState([
    // Sample pending actions for demo
    {
      id: 1,
      employeeName: "Mohammed Alami",
      actionName: "Tri sélectif des déchets",
      points: 15,
      submittedDate: "2024-12-03",
      proofImage: null, // Will be base64 or URL
      status: "pending" // pending, approved, rejected
    },
    {
      id: 2,
      employeeName: "Mohammed Alami",
      actionName: "Utiliser gourde réutilisable",
      points: 10,
      submittedDate: "2024-12-02",
      proofImage: null,
      status: "pending"
    }
  ]);

  // Add new action submission with proof
  const submitActionForApproval = (actionData) => {
    const newSubmission = {
      id: Date.now(),
      employeeName: actionData.employeeName,
      actionName: actionData.actionName,
      points: actionData.points,
      submittedDate: new Date().toISOString().split('T')[0],
      proofImage: actionData.proofImage,
      status: "pending"
    };

    setPendingActions(prev => [newSubmission, ...prev]);
    return newSubmission.id;
  };

  // Approve action (admin function)
  const approveAction = (actionId) => {
    setPendingActions(prev =>
      prev.map(action =>
        action.id === actionId
          ? { ...action, status: "approved" }
          : action
      )
    );
  };

  // Reject action (admin function)
  const rejectAction = (actionId, reason = "") => {
    setPendingActions(prev =>
      prev.map(action =>
        action.id === actionId
          ? { ...action, status: "rejected", rejectionReason: reason }
          : action
      )
    );
  };

  // Get pending actions count
  const getPendingCount = () => {
    return pendingActions.filter(action => action.status === "pending").length;
  };

  // Get actions by status
  const getActionsByStatus = (status) => {
    return pendingActions.filter(action => action.status === status);
  };

  const value = {
    pendingActions,
    setPendingActions,
    submitActionForApproval,
    approveAction,
    rejectAction,
    getPendingCount,
    getActionsByStatus
  };

  return (
    <PendingActionsContext.Provider value={value}>
      {children}
    </PendingActionsContext.Provider>
  );
};
