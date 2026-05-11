import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LayoutDashboard, LogOut, Shield, Bell, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        color: 'var(--primary)',
        fontWeight: 800,
        fontSize: '1.5rem',
        letterSpacing: '-0.025em'
      }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
        }}>
          <Ticket size={24} />
        </div>
        <span>SupTicket</span>
        <div style={{
          fontSize: '0.625rem',
          backgroundColor: 'var(--success)',
          color: 'white',
          padding: '0.125rem 0.375rem',
          borderRadius: '4px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginLeft: '-0.25rem',
          marginTop: '-1rem'
        }}>
          <Zap size={8} fill="white" />
          LIVE
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ 
              display: 'flex', 
              gap: '0.25rem', 
              marginRight: '1rem', 
              padding: '0.25rem', 
              backgroundColor: 'var(--background)', 
              borderRadius: '12px' 
            }}>
              <Link to="/dashboard" style={{ 
                ...navLinkStyle, 
                ...(isActive('/dashboard') ? activeNavLinkStyle : {}) 
              }}>
                <LayoutDashboard size={18} />
                <span>My Tickets</span>
              </Link>
              
              {isAdmin && (
                <Link to="/admin" style={{ 
                  ...navLinkStyle, 
                  ...adminNavLinkStyle, 
                  ...(isActive('/admin') ? activeAdminNavLinkStyle : {}) 
                }}>
                  <Shield size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <button className="btn" style={{ padding: '0.5rem', borderRadius: '10px', color: 'var(--text-light)', position: 'relative' }}>
                <Bell size={20} />
                <div style={{ 
                  position: 'absolute', 
                  top: '6px', 
                  right: '6px', 
                  width: '8px', 
                  height: '8px', 
                  backgroundColor: 'var(--danger)', 
                  borderRadius: '50%',
                  border: '2px solid var(--surface)'
                }}></div>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isAdmin ? '#fee2e2' : '#dbeafe',
                color: isAdmin ? '#991b1b' : '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 800
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.8125rem' }}>{user.name}</span>
                <span style={{ 
                  fontSize: '0.6875rem', 
                  color: isAdmin ? '#991b1b' : 'var(--text-light)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-outline" style={{ 
              padding: '0.5rem', 
              borderRadius: '10px',
              color: 'var(--text-light)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent'
            }} title="Logout">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline" style={{ borderRadius: '10px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ borderRadius: '10px' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};


const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  color: 'var(--text-light)',
  padding: '0.625rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontWeight: 600,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};

const adminNavLinkStyle = {
  color: '#b91c1c',
};

const activeNavLinkStyle = {
  backgroundColor: 'var(--surface)',
  color: 'var(--primary)',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
};

const activeAdminNavLinkStyle = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  boxShadow: '0 1px 3px 0 rgba(153, 27, 27, 0.1)'
};

export default Navbar;
