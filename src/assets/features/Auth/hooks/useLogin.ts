import { useState } from 'react';
import { saveToken } from '../../../../lib/apiFetch';

export function useLogin(onLoginSuccess: (userData: any) => void) {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        saveToken(data.token);
        onLoginSuccess(data.userData);
      } else {
        setError(data.message || 'Correo o contraseña incorrectos.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    isLoading,
    error,
    showPassword, setShowPassword,
    handleLogin,
  };
}
