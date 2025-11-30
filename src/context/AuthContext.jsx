import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('gymapp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('gymapp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const result = await window.electron.auth.login(username, password);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('gymapp_user', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error al conectar con el servidor' };
    }
  };

  const logout = async () => {
    try {
      await window.electron.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('gymapp_user');
  };

  const changePassword = async (newPassword) => {
    if (!user) return { success: false, message: 'No hay sesión activa' };
    try {
      const result = await window.electron.auth.changePassword(user.id, newPassword);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Error al cambiar contraseña' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      changePassword,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
