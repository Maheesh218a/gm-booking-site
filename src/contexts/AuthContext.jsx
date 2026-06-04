import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Hardcoded credentials
    if (email === 'gmsuperservice@gmail.com' && password === 'GMBusCar@2013') {
      const userData = { email, name: 'Admin', role: 'owner' };
      localStorage.setItem('gm_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    
    // Demo Mode Credentials
    if (email === 'sample@gmail.com' && password === 'sample') {
      const userData = { email, name: 'Demo Guest', role: 'demo' };
      localStorage.setItem('gm_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem('gm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
