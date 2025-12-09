import { useEffect, useRef } from 'react';
import { showNotification } from '../utils/notifications';


export const useNotifications = (onSensorAlert, onMarketplaceUpdate) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8080/notifications');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(' Connected to Notifications WebSocket');
        };

        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            console.log(' Notification received:', notification);

            handleNotification(notification);
          } catch (error) {
            console.error(' Error parsing notification:', error);
          }
        };

        ws.onerror = (error) => {
          console.error(' WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log(' Disconnected from Notifications WebSocket');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(' Reconnecting to Notifications WebSocket...');
            connectWebSocket();
          }, 5000);
        };
      } catch (error) {
        console.error(' Failed to connect to Notifications WebSocket:', error);
      }
    };

    const handleNotification = (notif) => {
      if (notif.category === 'MARKETPLACE') {
        showNotification(notif.message, notif.severity);
        
        if (onMarketplaceUpdate) {
          onMarketplaceUpdate(notif);
        }
      }
      
      else if (notif.category === 'SENSOR') {
        showNotification(notif.title, 'warning');
        
        if (onSensorAlert) {
          const alert = {
            id: Date.now(),
            type: notif.severity, // critical, offline, warning, info
            icon: notif.icon || 'fa-exclamation-triangle',
            title: notif.title,
            location: notif.message, 
            time: notif.timestamp || 'À l\'instant',
            payload: notif.payload 
          };
          onSensorAlert(alert);
        }
      }
      
      else if (notif.category === 'SYSTEM') {
        showNotification(notif.message, notif.severity);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onSensorAlert, onMarketplaceUpdate]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn(' WebSocket not connected');
    }
  };

  return { sendMessage };
};
