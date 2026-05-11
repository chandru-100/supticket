import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, devBypass } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = (role) => {
    devBypass(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
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
          <p className="login-subtitle">Enter your credentials to access your account</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#991b1b', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Lock size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="name@company.com"
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
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="bypass-section">
          <h3 className="bypass-title">Quick Demo Access</h3>
          <div className="bypass-grid">
            <button 
              onClick={() => handleBypass('user')} 
              className="bypass-btn"
            >
              <User size={18} />
              <span>User Mode</span>
            </button>
            <button 
              onClick={() => handleBypass('admin')} 
              className="bypass-btn admin"
            >
              <Shield size={18} />
              <span>Admin Mode</span>
            </button>
          </div>
        </div>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
