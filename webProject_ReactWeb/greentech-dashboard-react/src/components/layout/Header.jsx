import React, { useState, useEffect } from 'react';

const Header = ({ onLogout }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('green');
  const [activeBg, setActiveBg] = useState('default');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  const [userEmail, setUserEmail] = useState('');

  // Get user role, name and email from localStorage
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    // Get user data from localStorage (saved during login)
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        // Use name from backend response
        if (userData.name) {
          setUserName(userData.name);
        } else if (role === 'admin') {
          setUserName('Admin PME');
        } else {
          setUserName('Utilisateur');
        }
        // Set email from backend response
        if (userData.email) {
          setUserEmail(userData.email);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserName(role === 'admin' ? 'Admin PME' : 'Utilisateur');
      }
    } else {
      // Fallback if no user data
      setUserName(role === 'admin' ? 'Admin PME' : 'Utilisateur');
    }
  }, []);

  // Load saved theme and background on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('greentech-theme') || 'green';
    const savedBg = localStorage.getItem('greentech-bg') || 'default';

    setActiveTheme(savedTheme);
    setActiveBg(savedBg);

    if (savedTheme !== 'default') {
      document.body.setAttribute('data-theme', savedTheme);
    }
    if (savedBg !== 'default') {
      document.body.setAttribute('data-bg', savedBg);
    }
  }, []);

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);

    if (theme === 'default') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }

    localStorage.setItem('greentech-theme', theme);
  };

  const handleBgChange = (bg) => {
    setActiveBg(bg);

    if (bg === 'default') {
      document.body.removeAttribute('data-bg');
    } else {
      document.body.setAttribute('data-bg', bg);
    }

    localStorage.setItem('greentech-bg', bg);
  };

  // Admin notifications
  const adminNotifications = [
    {
      icon: 'shopping-cart',
      iconType: 'warning',
      title: '🔔 Admin: Nouvelle demande d\'achat',
      text: 'Jean Martin - Formation Éco-Conduite (3,000 coins)',
      time: 'Il y a 5min',
      unread: true
    },
    {
      icon: 'shopping-cart',
      iconType: 'warning',
      title: '🔔 Admin: Nouvelle demande d\'achat',
      text: 'Lisa Anderson - Café Gratuit 1 Semaine (500 coins)',
      time: 'Il y a 15min',
      unread: true
    },
    {
      icon: 'shopping-cart',
      iconType: 'warning',
      title: '🔔 Admin: Nouvelle demande d\'achat',
      text: 'Fatima El Amrani - Télétravail Bonus (1,500 coins)',
      time: 'Il y a 1h',
      unread: true
    },
    {
      icon: 'exclamation-circle',
      iconType: 'critical',
      title: 'Consommation critique ESP32-ELEC-002',
      text: 'Atelier (+45% vs moyenne)',
      time: 'Il y a 10min',
      unread: true
    },
    {
      icon: 'power-off',
      iconType: 'offline',
      title: 'ESP32-ELEC-003 hors ligne',
      text: 'Entrepôt - Connexion perdue',
      time: 'Il y a 2h',
      unread: true
    },
    {
      icon: 'map-marker-alt',
      iconType: 'warning',
      title: 'Signal GPS faible ESP32-GPS-003',
      text: 'Dernière position: Zone industrielle',
      time: 'Il y a 1h',
      unread: true
    },
    {
      icon: 'weight',
      iconType: 'warning',
      title: 'Seuil déchets dépassé ESP32-WASTE-002',
      text: 'Cuisine - 85.3 kg / 80 kg max',
      time: 'Il y a 45min',
      unread: true
    },
    {
      icon: 'battery-half',
      iconType: 'info',
      title: 'Batterie faible ESP32-GPS-005',
      text: 'Voiture Commerciale - 15% restant',
      time: 'Il y a 3h',
      unread: false
    },
    {
      icon: 'fire',
      iconType: 'critical',
      title: 'Température anormale détectée',
      text: 'Salle Serveurs - 38°C',
      time: 'Il y a 20min',
      unread: true
    },
    {
      icon: 'truck',
      iconType: 'warning',
      title: 'Kilométrage élevé ESP32-GPS-004',
      text: 'Camion Transport - 8500 km ce mois',
      time: 'Il y a 5h',
      unread: false
    },
    {
      icon: 'sync',
      iconType: 'info',
      title: 'Mise à jour firmware disponible',
      text: '3 capteurs - Version 2.1.4',
      time: 'Il y a 1 jour',
      unread: false
    }
  ];

  // Employee notifications
  const employeeNotifications = [
    {
      icon: 'trophy',
      iconType: 'success',
      title: '🏆 Nouveau badge débloqué!',
      text: 'Félicitations! Vous avez débloqué "Transport Vert"',
      time: 'Il y a 30min',
      unread: true
    },
    {
      icon: 'coins',
      iconType: 'warning',
      title: '💰 Points gagnés',
      text: '+150 points pour votre éco-conduite aujourd\'hui',
      time: 'Il y a 2h',
      unread: true
    },
    {
      icon: 'check-circle',
      iconType: 'success',
      title: '✅ Objectif atteint',
      text: 'Vous avez économisé 50 kg de CO2 cette semaine!',
      time: 'Il y a 3h',
      unread: true
    },
    {
      icon: 'gift',
      iconType: 'info',
      title: '🎁 Demande approuvée',
      text: 'Votre demande de Café Gratuit a été approuvée',
      time: 'Il y a 5h',
      unread: true
    },
    {
      icon: 'car',
      iconType: 'info',
      title: '🚗 Rappel transport',
      text: 'Pensez à activer l\'éco-conduite sur votre trajet',
      time: 'Il y a 1 jour',
      unread: false
    },
    {
      icon: 'chart-line',
      iconType: 'info',
      title: '📊 Rapport hebdomadaire',
      text: 'Votre performance de la semaine est disponible',
      time: 'Il y a 1 jour',
      unread: false
    },
    {
      icon: 'bullhorn',
      iconType: 'warning',
      title: '📢 Nouveau défi',
      text: 'Défi de la semaine: Économisez 100 kg CO2',
      time: 'Il y a 2 jours',
      unread: false
    }
  ];

  const notifications = userRole === 'admin' ? adminNotifications : employeeNotifications;
  const notificationCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <i className="fas fa-leaf"></i>
          <h1>GreenTech</h1>
        </div>
        <div className="header-actions">
          <div className="theme-selector">
            <i className="fas fa-palette"></i>
            <span className="selector-label">Thème</span>
            <div className="theme-circles">
              <div
                className={`theme-circle ${activeTheme === 'default' ? 'active' : ''}`}
                data-theme="default"
                title="Bleu/Violet"
                onClick={() => handleThemeChange('default')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
              </div>
              <div
                className={`theme-circle ${activeTheme === 'green' ? 'active' : ''}`}
                data-theme="green"
                title="Vert Foncé"
                onClick={() => handleThemeChange('green')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #0f4c3a 0%, #1b6e4f 100%)' }}></div>
              </div>
              <div
                className={`theme-circle ${activeTheme === 'ocean' ? 'active' : ''}`}
                data-theme="ocean"
                title="Océan"
                onClick={() => handleThemeChange('ocean')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}></div>
              </div>
              <div
                className={`theme-circle ${activeTheme === 'dark' ? 'active' : ''}`}
                data-theme="dark"
                title="Nuit"
                onClick={() => handleThemeChange('dark')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}></div>
              </div>
              <div
                className={`theme-circle ${activeTheme === 'sunset' ? 'active' : ''}`}
                data-theme="sunset"
                title="Coucher de Soleil"
                onClick={() => handleThemeChange('sunset')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}></div>
              </div>
            </div>
          </div>
          <div className="bg-selector">
            <i className="fas fa-fill-drip"></i>
            <span className="selector-label">Fond</span>
            <div className="bg-circles">
              <div
                className={`bg-circle ${activeBg === 'default' ? 'active' : ''}`}
                data-bg="default"
                title="Bleu Foncé (Original)"
                onClick={() => handleBgChange('default')}
              >
                <div className="circle-gradient" style={{ background: '#0a0e27' }}></div>
              </div>
              <div
                className={`bg-circle ${activeBg === 'purple' ? 'active' : ''}`}
                data-bg="purple"
                title="Violet Profond"
                onClick={() => handleBgChange('purple')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 50%, #3a1c5d 100%)' }}></div>
              </div>
              <div
                className={`bg-circle ${activeBg === 'dark' ? 'active' : ''}`}
                data-bg="dark"
                title="Noir"
                onClick={() => handleBgChange('dark')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)' }}></div>
              </div>
              <div
                className={`bg-circle ${activeBg === 'blue' ? 'active' : ''}`}
                data-bg="blue"
                title="Bleu Nuit"
                onClick={() => handleBgChange('blue')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}></div>
              </div>
              <div
                className={`bg-circle ${activeBg === 'warm' ? 'active' : ''}`}
                data-bg="warm"
                title="Chaud"
                onClick={() => handleBgChange('warm')}
              >
                <div className="circle-gradient" style={{ background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}></div>
              </div>
            </div>
          </div>
          <div className="notification-bell-container">
            <button className="notification-bell" onClick={() => setNotificationOpen(!notificationOpen)}>
              <i className="fas fa-bell"></i>
              <span className="notification-badge">{notificationCount}</span>
            </button>
            <div className={`notification-dropdown ${notificationOpen ? 'show' : ''}`}>
              <div className="notification-dropdown-header">
                <h4>Notifications</h4>
                <button className="mark-all-read">
                  <i className="fas fa-check-double"></i> Tout marquer lu
                </button>
              </div>
              <div className="notification-list">
                {notifications.map((notification, index) => (
                  <div key={index} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                    <div className={`notification-icon ${notification.iconType}`}>
                      <i className={`fas fa-${notification.icon}`}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-text">{notification.text}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-dropdown-footer">
                <a href="#" onClick={(e) => e.preventDefault()}>Voir toutes les notifications</a>
              </div>
            </div>
          </div>
          <div className="user-menu-container">
            <button className="user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <i className="fas fa-user-circle"></i>
              <span style={{ color: 'white' }}>{userName}</span>
              <i className="fas fa-chevron-down" style={{ fontSize: '12px', marginLeft: '8px' }}></i>
            </button>
            <div className={`user-dropdown ${userMenuOpen ? 'show' : ''}`}>
              <div className="user-dropdown-header">
                <i className="fas fa-user-circle" style={{ fontSize: '40px', color: 'var(--primary-color)' }}></i>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{userName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {userEmail || 'utilisateur@greentech.ma'}
                  </div>
                </div>
              </div>
              <div className="user-dropdown-divider"></div>
              <button className="user-dropdown-item" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
