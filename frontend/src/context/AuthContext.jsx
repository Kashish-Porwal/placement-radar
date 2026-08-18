import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const newUserData = { ...prev, ...updatedFields };
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
