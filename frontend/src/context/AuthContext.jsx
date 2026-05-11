import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data.data);
    return res.data;
  };

  // Login user
  const login = async (userData) => {
    const res = await api.post('/auth/login', userData);
    localStorage.setItem('token', res.data.token);
    const userRes = await api.get('/auth/me');
    setUser(userRes.data.data);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Development bypass (mocks login without backend)
  const devBypass = (role) => {
    const mockUser = {
      _id: 'mock-id-' + role,
      name: role === 'admin' ? 'Demo Admin' : 'Demo User',
      email: role + '@demo.com',
      role: role
    };
    localStorage.setItem('token', 'mock-token-' + role);
    setUser(mockUser);
    return mockUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        devBypass,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
