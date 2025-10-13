import { useState, useEffect } from 'react';
import config from '../config/config';

const useUsername = () => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const checkUsername = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      setError('Username deve ter pelo menos 3 caracteres');
      return;
    }

    // Validar formato
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(usernameToCheck)) {
      setIsAvailable(false);
      setError('Username deve conter apenas letras, números e underscore');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(config.getApiUrl(`username.php?action=check_username&username=${encodeURIComponent(usernameToCheck)}`));
      const result = await response.json();

      if (result.success) {
        setIsAvailable(result.available);
        setError(result.available ? '' : result.message);
      } else {
        setIsAvailable(false);
        setError(result.message);
      }
    } catch (error) {
      setError('Erro ao verificar username');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const generateUsername = async (nome, email) => {
    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(config.getApiUrl('username.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'generate_username',
          nome: nome || '',
          email: email || '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUsername(result.username);
        setIsAvailable(true);
        return result.username;
      } else {
        setError(result.message);
        return null;
      }
    } catch (error) {
      setError('Erro ao gerar username');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const updateUsername = async (userId, newUsername) => {
    setIsChecking(true);
    setError('');

    try {
      const response = await fetch(config.getApiUrl('username.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'update_username',
          user_id: userId,
          username: newUsername,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUsername(newUsername);
        setIsAvailable(true);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (error) {
      setError('Erro ao atualizar username');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Debounce para checagem automática
  useEffect(() => {
    if (username) {
      const timeoutId = setTimeout(() => {
        checkUsername(username);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
      setError('');
    }
  }, [username]);

  return {
    username,
    setUsername,
    isAvailable,
    isChecking,
    error,
    checkUsername,
    generateUsername,
    updateUsername,
  };
};

export default useUsername;
