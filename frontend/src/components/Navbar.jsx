import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ticket, LayoutDashboard, LogOut, Shield, Bell, Sun, Moon, CheckCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

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
      <Link to={isAdmin ? "/admin" : "/"} style={{
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
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Ticket size={24} />
        </div>
        <span>Support Ticket System</span>
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
              {!isAdmin && (
                <Link to="/dashboard" style={{ 
                  ...navLinkStyle, 
                  ...(isActive('/dashboard') ? activeNavLinkStyle : {}) 
                }}>
                  <LayoutDashboard size={18} />
                  <span>My Tickets</span>
                </Link>
              )}
              
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
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="btn" style={{ padding: '0.5rem', borderRadius: '10px', color: 'var(--text-light)', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Bell size={20} />
                  {hasUnread && (
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
                  )}
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '320px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 200,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '400px'
                  }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Notifications</h3>
                      {hasUnread && (
                        <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                      )}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>No notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif._id} style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: notif.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: notif.isRead ? 'var(--text)' : 'var(--text-primary)' }}>{notif.title}</div>
                              {!notif.isRead && (
                                <button onClick={(e) => handleMarkAsRead(notif._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }} title="Mark as read">
                                  <CheckCircle size={14} />
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: 1.4 }}>{notif.message}</div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{new Date(notif.createdAt).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={toggleTheme} 
                className="btn btn-outline" 
                style={{ padding: '0.5rem', borderRadius: '10px', color: 'var(--text-light)', border: '1px solid var(--border)', backgroundColor: 'transparent' }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.8125rem' }}>{user?.name || 'User'}</span>
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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
                onClick={toggleTheme} 
                className="btn btn-outline" 
                style={{ padding: '0.5rem', borderRadius: '10px', color: 'var(--text-light)', border: '1px solid var(--border)', backgroundColor: 'transparent' }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="btn btn-outline" style={{ borderRadius: '10px' }}>Login</Link>
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
