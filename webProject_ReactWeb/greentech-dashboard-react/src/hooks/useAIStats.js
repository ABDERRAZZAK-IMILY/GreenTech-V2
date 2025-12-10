import { useState, useEffect } from 'react';
import api from '../services/AI/AiService'; 

const useAIStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/chat/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching AI stats:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export default useAIStats;