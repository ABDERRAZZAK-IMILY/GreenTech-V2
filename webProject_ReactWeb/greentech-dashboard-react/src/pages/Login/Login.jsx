import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login(formData.email, formData.password);
      
      navigate('/'); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Email ou mot de passe incorrect";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <i className="fas fa-leaf"></i>
            </div>
            <h1>GreenTech Dashboard</h1>
            <p>Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@greentech.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>

        <div className="login-features">
          <div className="feature">
            <i className="fas fa-chart-line"></i>
            <span>Suivi en temps réel</span>
          </div>
          <div className="feature">
            <i className="fas fa-leaf"></i>
            <span>Gestion environnementale</span>
          </div>
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <span>Sécurisé et fiable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
