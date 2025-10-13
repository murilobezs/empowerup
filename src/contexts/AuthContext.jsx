import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import config from '../config/config';
import {
  getStoredUser,
  getStoredToken,
  persistUserSession,
  persistToken,
  clearAuthSession,
  hydrateUserFromCookie,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Declarar logout e updateUser como funções (hoisted) para uso em useEffect
  function logout() {
    setUser(null);
    clearAuthSession();
  }

  function updateUser(newUserData) {
    const updatedUser = { ...user, ...newUserData };
    // Ensure normalized avatar fields
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    persistUserSession(normalized);
  }

  // Normalize user object so frontend uses consistent avatar fields
  function normalizeUser(u) {
    if (!u) return u;
    const out = { ...u };
    // API uses `avatar_url` (relative path like /images/...), some components expect `foto_perfil` as full/public URL
    const avatarUrl = u.avatar_url || u.avatar || null;
    if (avatarUrl) {
      // Build full public URL based on API base (strip /api)
      const apiBase = (config.API_BASE_URL || '').replace(/\/api\/?$/i, '');
      const publicBase = apiBase || '';
      // If avatarUrl already looks like an absolute URL, keep it
      if (/^https?:\/\//.test(avatarUrl)) {
        out.foto_perfil = avatarUrl;
      } else {
        out.foto_perfil = `${publicBase}/public${avatarUrl}`;
      }
      out.avatar_url = avatarUrl;
    } else if (u.foto_perfil) {
      // keep existing foto_perfil and attempt to set avatar_url if missing
      out.foto_perfil = u.foto_perfil;
      if (!out.avatar_url) {
        out.avatar_url = u.foto_perfil.startsWith('/') ? u.foto_perfil : null;
      }
    }

    const coverUrl = u.capa_url || u.cover_url || u.capa || null;
    if (coverUrl) {
      const apiBase = (config.API_BASE_URL || '').replace(/\/api\/?$/i, '');
      const publicBase = apiBase || '';
      if (/^https?:\/\//.test(coverUrl)) {
        out.cover_image = coverUrl;
        out.capa_url = coverUrl;
      } else {
        const normalizedPath = coverUrl.startsWith('/') ? coverUrl : `/${coverUrl}`;
        out.capa_url = normalizedPath;
        out.cover_image = `${publicBase}/public${normalizedPath}`;
      }
    } else if (u.cover_image) {
      out.cover_image = u.cover_image;
      if (!out.capa_url && /^https?:\/\//.test(u.cover_image) === false) {
        out.capa_url = u.cover_image.startsWith('/') ? u.cover_image : null;
      }
    }
    return out;
  }

  useEffect(() => {
    let isMounted = true;

    async function validateAndHydrate(token, baseUser = null) {
      if (!token) return;
      try {
        console.log('AuthContext - Validating token in background...');
        const profile = await apiService.getProfile();
        console.log('AuthContext - Profile validation result:', profile);
        if (profile && profile.success && profile.user) {
          const mergedUser = normalizeUser({ ...(baseUser || {}), ...profile.user, token });
          if (isMounted) {
            setUser(mergedUser);
          }
          persistUserSession({ ...mergedUser, token });
          console.log('AuthContext - Token valid, user updated');
        }
      } catch (error) {
        console.error('AuthContext - Erro ao validar token:', error);
        const status = error && (error.status || (error.response && error.response.status));
        console.log('AuthContext - Error status:', status);
        if (status === 401 || status === 403) {
          console.warn('AuthContext - Token expirado/invalid. Efetuando logout.');
          logout();
        } else {
          console.warn('AuthContext - Falha temporária ao validar token; mantendo sessão local.', error);
        }
      }
    }

    async function bootstrapAuth() {
      try {
        console.log('AuthContext - Bootstrapping session state');
        let storedUser = getStoredUser();
        if (!storedUser) {
          storedUser = hydrateUserFromCookie();
        }

        if (storedUser) {
          console.log('AuthContext - Found stored user:', storedUser);
          const token = storedUser.token || getStoredToken();
          if (!token) {
            console.warn('AuthContext - Stored user missing token, clearing session');
            logout();
            return;
          }

          const normalizedUser = normalizeUser({ ...storedUser, token });
          persistUserSession({ ...normalizedUser, token });

          if (isMounted) {
            setUser(normalizedUser);
          }

          await validateAndHydrate(token, normalizedUser);
          return;
        }

        const cookieToken = getStoredToken();
        if (cookieToken) {
          console.log('AuthContext - Token found in cookie, hydrating profile');
          persistToken(cookieToken);
          await validateAndHydrate(cookieToken);
        } else {
          console.log('AuthContext - No stored auth found');
        }
      } catch (error) {
        console.error('AuthContext - Bootstrap error:', error);
      }
    }

    bootstrapAuth().finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // validateToken moved into useEffect to avoid hook dependency warnings

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('AuthContext - Starting login process');
      const response = await apiService.login(credentials);
      console.log('AuthContext - Login response:', response);
      
      if (response.success) {
        const userData = {
          ...response.user,
          token: response.token
        };
        console.log('AuthContext - Saving user data with token:', !!userData.token);
        
        const normalized = normalizeUser(userData);
        setUser(normalized);
  persistUserSession(normalized);
        
        console.log('AuthContext - User saved to localStorage');
        return { success: true, user: userData };
      } else {
        console.log('AuthContext - Login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('AuthContext - Erro no login:', error);
      return { success: false, message: error.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('AuthContext - Starting register process');
      const response = await apiService.register(userData);
      console.log('AuthContext - Register response:', response);
      
      if (response.success) {
        const newUser = {
          ...response.user,
          token: response.token
        };
        console.log('AuthContext - Saving new user data with token:', !!newUser.token);
        
        const normalized = normalizeUser(newUser);
        setUser(normalized);
  persistUserSession(normalized);
        
        console.log('AuthContext - New user saved to localStorage');
        return { success: true, user: newUser };
      } else {
        console.log('AuthContext - Register failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('AuthContext - Erro no registro:', error);
      // Extrair erros de validação se houver
      const backendErrors = error.data && error.data.errors ? error.data.errors : null;
      return { success: false, message: error.data?.message || error.message || 'Erro ao registrar usuário', errors: backendErrors };
    } finally {
      setLoading(false);
    }
  };

  // logout and updateUser are declared above to be used by useEffect

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        updateUser(normalizeUser(response.user));
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
        // API returns updated user under response.user
        const respUser = response.user ? response.user : response;
        const normalized = normalizeUser(respUser);
        updateUser(normalized);
        return { success: true, foto_perfil: normalized.foto_perfil };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      return { success: false, message: error.message || 'Erro ao atualizar avatar' };
    }
  };

  const updateCover = async (file) => {
    try {
      const response = await apiService.updateCover(file);

      if (response.success) {
        const respUser = response.user ? response.user : response;
        const normalized = normalizeUser(respUser);
        updateUser(normalized);
        return { success: true, user: normalized };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro ao atualizar capa:', error);
      return { success: false, message: error.message || 'Erro ao atualizar capa' };
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
  updateCover,
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
