import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.error("Token invalid or expired");
            localStorage.removeItem('token');
          } else {
            console.error("Session verified locally, but API failed to return profile data", error);
            // Construct a fallback user based on the decoded token payload to prevent lockout
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload && payload.role) {
                setUser({ id: payload.id, email: payload.email, role: payload.role });
              }
            } catch (decodeErr) {
              console.error("Token decode failed", decodeErr);
              localStorage.removeItem('token');
            }
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    
    // Fetch full user details including profile
    const userRes = await api.get('/auth/me');
    setUser(userRes.data.user);
    return userRes.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
