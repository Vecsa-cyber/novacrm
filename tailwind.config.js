/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: '#f8fafc', // Fondo principal
          emerald: '#10b981', // Acento éxito/crecimiento
          slate: '#475569', // Textos secundarios
          blue: '#3b82f6', // Acento principal
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)', // Sombra muy difuminada y elegante
      },
      borderRadius: {
        'nova': '2rem', // Tu borde súper redondeado
      }
    },
  },
  plugins: [],
}