import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import config from '../config/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Declarar logout e updateUser como funções (hoisted) para uso em useEffect
  function logout() {
    setUser(null);
    localStorage.removeItem(config.AUTH.USER_KEY);
  }

  function updateUser(newUserData) {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(updatedUser));
  }

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem(config.AUTH.USER_KEY);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);

        // Valida token imediatamente, mas somente desloga em caso de 401/403
        (async (token) => {
          try {
            const profile = await apiService.getProfile();
            // Se válido, atualizar usuário com profile (inline para evitar dependência de closure)
            setUser(prev => {
              const updated = { ...prev, ...profile };
              localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(updated));
              return updated;
            });
          } catch (error) {
            console.error('Erro ao validar token:', error);
            const status = error && (error.status || (error.response && error.response.status));
            if (status === 401 || status === 403) {
              console.warn('Token expirado/invalid. Efetuando logout.');
              logout();
            } else {
              console.warn('Falha temporária ao validar token; mantendo sessão local.', error);
            }
          }
        })(userData.token);

      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem(config.AUTH.USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // validateToken moved into useEffect to avoid hook dependency warnings

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const userData = {
          ...response.user,
          token: response.token
        };
        setUser(userData);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: error.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success) {
        const newUser = {
          ...response.user,
          token: response.token
        };
        setUser(newUser);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(newUser));
        return { success: true, user: newUser };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: error.message || 'Erro ao registrar usuário' };
    } finally {
      setLoading(false);
    }
  };

  // logout and updateUser are declared above to be used by useEffect

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        updateUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: error.message || 'Erro ao atualizar perfil' };
    }
  };

  const updateAvatar = async (file) => {
    try {
      const response = await apiService.updateAvatar(file);
      
      if (response.success) {
        updateUser({ foto_perfil: response.foto_perfil });
        return { success: true, foto_perfil: response.foto_perfil };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      return { success: false, message: error.message || 'Erro ao atualizar avatar' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    updateAvatar,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Exportar o contexto também para uso direto
export { AuthContext };
