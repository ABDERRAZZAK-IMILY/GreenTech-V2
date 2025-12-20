import React, { useState, useEffect } from 'react';
import gamificationService from '../../services/gamificationService';

// Helper component for Glass Cards to reduce repetition
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:translate-y-[-5px] transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const EmployeeDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for API data
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, leaderboardData, submissionsData] = await Promise.all([
          gamificationService.getMyStats(),
          gamificationService.getLeaderboard(),
          gamificationService.getMySubmissions()
        ]);

        setUserStats(statsData);
        setLeaderboard(leaderboardData || []);
        setMySubmissions(submissionsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate user rank from leaderboard
  const getUserRank = () => {
    if (!userStats || !leaderboard.length) return { rank: 0, total: 0 };
    const rank = leaderboard.findIndex(u => u.userId === userStats.userId) + 1;
    return { rank: rank || leaderboard.length + 1, total: leaderboard.length };
  };

  // Calculate level progress
  const getLevelProgress = () => {
    if (!userStats) return 0;
    const currentLevelPoints = (userStats.level - 1) * 1000;
    const nextLevelPoints = userStats.level * 1000;
    const progress = ((userStats.currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Calculate CO2 saved (estimation based on actions)
  const getCO2Saved = () => {
    if (!userStats) return 0;
    return Math.round((userStats.totalActions || 0) * 3.2);
  };

  // Calculate stats by period (simulated based on total)
  const getStatsByPeriod = () => {
    if (!userStats) return { points: 0, co2: 0, actions: 0 };
    
    const totalPoints = userStats.totalPointsEarned || 0;
    const totalActions = userStats.totalActions || 0;
    const co2Saved = getCO2Saved();
    
    switch (selectedPeriod) {
      case 'week':
        return {
          points: Math.round(totalPoints * 0.1),
          co2: Math.round(co2Saved * 0.1),
          actions: Math.round(totalActions * 0.1)
        };
      case 'month':
        return {
          points: Math.round(totalPoints * 0.3),
          co2: Math.round(co2Saved * 0.3),
          actions: Math.round(totalActions * 0.3)
        };
      case 'year':
      default:
        return { points: totalPoints, co2: co2Saved, actions: totalActions };
    }
  };

  // Get approved/pending/rejected submission counts
  const getSubmissionStats = () => {
    const approved = mySubmissions.filter(s => s.status === 'APPROVED').length;
    const pending = mySubmissions.filter(s => s.status === 'PENDING').length;
    const rejected = mySubmissions.filter(s => s.status === 'REJECTED').length;
    return { approved, pending, rejected, total: mySubmissions.length };
  };

  // Static badges data
  const badges = [
    { id: 1, name: 'Éco-Warrior', icon: '🌿', unlocked: (userStats?.totalActions || 0) >= 10 },
    { id: 2, name: 'Transport Vert', icon: '🚴', unlocked: (userStats?.totalActions || 0) >= 20 },
    { id: 3, name: 'Recycleur Pro', icon: '♻️', unlocked: (userStats?.totalActions || 0) >= 30 },
    { id: 4, name: 'Économie d\'Énergie', icon: '💡', unlocked: (userStats?.totalActions || 0) >= 50 },
    { id: 5, name: 'Champion CO2', icon: '🏆', unlocked: (userStats?.currentPoints || 0) >= 5000 },
    { id: 6, name: 'Mentor Écologique', icon: '🎓', unlocked: (userStats?.level || 0) >= 10 },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400">Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
        <p className="text-slate-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const { rank, total } = getUserRank();
  const progressPercentage = getLevelProgress();
  const rankPercentage = total > 0 ? ((total - rank) / total) * 100 : 0;
  const co2Saved = getCO2Saved();
  const periodStats = getStatsByPeriod();
  const submissionStats = getSubmissionStats();
  const nextLevelPoints = (userStats?.level || 1) * 1000;

  return (
    <section className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-white">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Bonjour, {userStats?.userName || 'Utilisateur'} 👋
          </h1>
          <p className="text-slate-400 text-lg">Continuez vos actions écologiques !</p>
        </div>

        <GlassCard className="w-full lg:w-auto min-w-[350px]">
          <div className="flex justify-between items-center gap-6 mb-4">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
              <i className="fas fa-star text-2xl"></i>
              <span>Niveau {userStats?.level || 1}</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {(userStats?.currentPoints || 0).toLocaleString()} / {nextLevelPoints.toLocaleString()} points
            </div>
          </div>
          
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </GlassCard>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Points Card */}
        <GlassCard className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shrink-0">
            <i className="fas fa-coins text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">Mes Points</h3>
            <div className="text-3xl font-bold text-white mb-1">{(userStats?.currentPoints || 0).toLocaleString()}</div>
            <div className="text-sm text-slate-500">Points disponibles</div>
          </div>
        </GlassCard>

        {/* Rank Card */}
        <GlassCard className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shrink-0">
            <i className="fas fa-trophy text-2xl text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">Classement</h3>
            <div className="text-3xl font-bold text-white mb-1">#{rank || '-'}</div>
            <div className="text-sm text-slate-500 mb-3">Sur {total} employés</div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" style={{ width: `${rankPercentage}%` }}></div>
              </div>
              <span className="text-xs font-bold text-indigo-400 whitespace-nowrap">Top {Math.round(rankPercentage)}%</span>
            </div>
          </div>
        </GlassCard>

        {/* CO2 Impact Card */}
        <GlassCard className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-500 shadow-lg shrink-0">
            <i className="fas fa-leaf text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">Mon Impact CO2</h3>
            <div className="text-3xl font-bold text-white mb-1">{co2Saved} kg</div>
            <div className="text-sm text-slate-500 mb-3">CO2 économisé</div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <i className="fas fa-tree text-emerald-500"></i>
                <span>{Math.round(co2Saved / 22)} arbres plantés</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <i className="fas fa-car text-emerald-500"></i>
                <span>{Math.round(co2Saved / 0.12)} km évités</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Badges Section */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-medal text-emerald-400"></i>
            Mes Badges
          </h2>
          <span className="text-sm font-semibold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {badges.filter(b => b.unlocked).length} / {badges.length}
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {badges.map(badge => (
            <div 
              key={badge.id} 
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 
                ${badge.unlocked ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'opacity-50 grayscale'}`}
            >
              <div className="text-4xl drop-shadow-md">{badge.icon}</div>
              <div className="text-xs font-semibold text-center text-white">{badge.name}</div>
              {!badge.unlocked && (
                <i className="fas fa-lock absolute top-2 right-2 text-xs text-slate-500"></i>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Submissions Status Section */}
      <GlassCard>
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-tasks text-emerald-400"></i>
            État de mes Soumissions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Soumissions Totales</div>
            <div className="text-3xl font-bold text-white mb-2">{submissionStats.total}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <i className="fas fa-paper-plane text-indigo-400"></i>
              Actions soumises
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">En Attente</div>
            <div className="text-3xl font-bold text-amber-500 mb-2">{submissionStats.pending}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <i className="fas fa-clock text-amber-500"></i>
              En cours de validation
            </div>
          </div>

          {/* Approved */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 hover:bg-emerald-500/20 transition-colors">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Approuvées</div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">{submissionStats.approved}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <i className="fas fa-check-circle text-emerald-400"></i>
              Validées par l'admin
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Performance Chart / Stats */}
      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-chart-line text-emerald-400"></i>
            Mon Évolution
          </h2>
          
          <div className="flex bg-white/5 p-1 rounded-lg">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 capitalize
                  ${selectedPeriod === period 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-400 text-white shadow-md">
              <i className="fas fa-coins text-xl"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Points Gagnés</div>
              <div className="text-2xl font-bold text-white">{periodStats.points}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-600 text-white shadow-md">
              <i className="fas fa-leaf text-xl"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">CO2 Économisé</div>
              <div className="text-2xl font-bold text-white">{periodStats.co2} kg</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500 text-white shadow-md">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Actions Réalisées</div>
              <div className="text-2xl font-bold text-white">{periodStats.actions}</div>
            </div>
          </div>
        </div>
      </GlassCard>
      
    </section>
  );
};

export default EmployeeDashboard;