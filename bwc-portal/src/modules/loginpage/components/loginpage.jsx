import React from 'react';
import { useLogin } from '../hooks/useLogin';
import '../login.css';
import BWCLOGO from "../assets/BWCLOGO.png"; 

const LoginPage = () => {
  const [credentials, setCredentials] = React.useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const { loading, error, handleLogin, clearError } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!credentials.email || !credentials.password) return;
    await handleLogin(credentials);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) clearError();
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const canSubmit = credentials.email && credentials.password && !loading;

  return (
    <div className="login-page-container">
      <div className="background-overlay"></div>

      <div className="company-info">
        <div className="company-content">
          <div className="welcome-badge">Welcome</div>
          <h1>BrainWave Travel Hub</h1>
          <p className="tagline">Your trusted partner in managing travel requests seamlessly.</p>
          <p className="description">
            BrainWave Consulting Pvt. Ltd. is a global leader in digital transformation,
            offering solutions in AI, cloud computing, and enterprise automation.
            With 10+ years of excellence, we empower businesses worldwide.
          </p>
        </div>
      </div>

      <div className="login-card">
        <div className="card-content">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">
                <img src={BWCLOGO} alt="Brainwave Logo" />
              </div>
              <div className="logo-text">
                <h1>BrainWave Travel Hub</h1>
                <p>Travel Request Management System</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Login Failed</strong>
                <p>{error}</p>
              </div>
              <button 
                className="error-close"
                onClick={clearError}
                aria-label="Close error message"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your company email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <span className="input-icon">🔒</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" disabled={loading} />
                <span>Remember me</span>
              </label>
              {/* <a href="/forgot-password" className="forgot-link">Forgot Password?</a> */}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`login-btn ${loading ? 'loading' : ''} ${!canSubmit ? 'disabled' : ''}`}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="/contact-admin">Contact Administrator</a></p>
            <div className="security-note">
              🔒 Secure authentication system
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
