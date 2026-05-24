import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, ArrowRight, User, Shield } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(formData);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await googleLogin(credentialResponse.credential);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard'); 
    } catch (err) {
      console.error('Frontend Error Object:', err);
      setError(err.response?.data?.details || err.response?.data?.error || err.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Ticket size={28} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => { setActiveTab('user'); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '0.6rem', 
              borderRadius: 'var(--radius-sm)', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'user' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'user' ? 'var(--text-primary)' : 'var(--text-light)',
              boxShadow: activeTab === 'user' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <User size={16} /> User
          </button>
          <button 
            onClick={() => { setActiveTab('admin'); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '0.6rem', 
              borderRadius: 'var(--radius-sm)', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'admin' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-light)',
              boxShadow: activeTab === 'admin' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Shield size={16} /> Admin
          </button>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--danger)', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Lock size={16} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Login Failed. Check console or backend logs.');
            }}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-light)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>or email login</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{activeTab === 'admin' ? 'Admin Email' : 'Email Address'}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder={activeTab === 'admin' ? "admin@company.com" : "name@company.com"}
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In as ${activeTab === 'admin' ? 'Admin' : 'User'}`}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          New here? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
