import React from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import type { LoginViewProps } from '../types/auth.d';
import loginBg from '../../../login-bg.png';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const {
    email, setEmail,
    password, setPassword,
    isLoading, error,
    showPassword, setShowPassword,
    handleLogin,
  } = useLogin(onLoginSuccess);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* ── Fondo — imagen a pantalla completa ── */}
      <img
        src={loginBg}
        alt="NovaCRM background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay suave para no tapar la imagen */}
      <div className="absolute inset-0 bg-black/20" />

      {/* ── Card de login — centrado en móvil, derecha en desktop ── */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:justify-end md:px-0 md:pr-14 lg:pr-20">
        <div className="w-full max-w-sm bg-white/40 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 my-6 sm:my-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
              <span className="text-white font-black text-2xl">H</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">
              Hydro<span className="text-blue-500">CRM</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Bienvenido de vuelta</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-gray-400" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-gray-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-400" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm text-gray-800 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-50 border border-red-100 p-3 rounded-xl fade-in">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold mt-1 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <><Loader2 className="animate-spin" size={18} /> Verificando...</>
                : 'Iniciar Sesión'
              }
            </button>

          </form>

          <p className="text-center text-xs text-gray-300 font-medium mt-6">
            © {new Date().getFullYear()} HydroCRM
          </p>

        </div>
      </div>
    </div>
  );
};
