import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (userData: any) => void;
}

// ⚠️ Reemplaza esta URL con la que te dé Google Apps Script al implementarlo
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxswNEhkJp8ozyWyIYJ2U7jxcvrNd-pfCd5vMWtNzfYqgqSjrbevLlUCjgWw38etq_-/exec';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Enviamos el correo y contraseña a tu Google Apps Script
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          // Usamos text/plain para evitar errores de CORS con Google
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({ email, password }),
        redirect: 'follow'
      });

      // Recibimos la respuesta
      const data = await response.json();
      console.log('🔍 Respuesta API:', data);

      if (data.success) {
        console.log('✅ Usuario recibido:', data.userData);
        onLoginSuccess(data.userData);
      } else {
        // Si falló (contraseña incorrecta), mostramos el mensaje que nos mande Sheets
        setError(data.message || 'Correo o contraseña incorrectos.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-nova-bg flex items-center justify-center p-4">
      {/* ... (Todo tu código visual del formulario se queda EXACTAMENTE IGUAL) ... */}
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 fade-in border border-blue-100" style={{ boxShadow: '0 0 40px 8px rgba(59,130,246,0.12), 0 10px 40px -10px rgba(0,0,0,0.08)' }}>
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-nova-blue rounded-2xl flex items-center justify-center shadow-lg shadow-nova-blue/30 mb-4">
            <span className="text-white font-black text-3xl">N</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800">
            Nova<span className="text-nova-blue">CRM</span>
          </h1>
          <p className="text-nova-slate text-sm mt-2 font-medium">Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Input Email */}
          <div>
            <label className="text-sm font-bold text-nova-slate mb-1.5 block">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@novacrm.com" 
                className="w-full bg-nova-bg/50 border border-gray-100 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nova-blue/20 focus:border-nova-blue transition-all text-sm text-gray-800 font-medium" 
                required
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="text-sm font-bold text-nova-slate mb-1.5 block">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-nova-bg/50 border border-gray-100 pl-11 pr-11 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nova-blue/20 focus:border-nova-blue transition-all text-sm text-gray-800 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 text-gray-400 hover:text-nova-blue transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl fade-in">{error}</p>}

          {/* Botón Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold mt-2 shadow-soft hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
};