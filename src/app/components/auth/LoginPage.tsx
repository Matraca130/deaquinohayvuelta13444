// ============================================================
// Axon — Login Page
// Connects to the real Supabase auth endpoints
// ============================================================
import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { AxonLogo } from '@/app/components/shared/AxonLogo';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export function LoginPage() {
  const { signIn, signUp, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const switchMode = (newMode: AuthMode) => {
    setEmail(''); setPassword(''); setName('');
    setError(null); setSuccess(null);
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Error al iniciar sesion');
        } else {
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      } else {
        if (!name.trim()) { setError('El nombre es obligatorio'); setLoading(false); return; }
        const res = await signUp(email, password, name);
        if (!res.success) {
          setError(res.error || 'Error al crear cuenta');
        } else {
          setSuccess('Cuenta creada exitosamente');
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-teal-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-500 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <AxonLogo size="lg" theme="light" />
            <p className="text-white/60 text-sm mt-4 max-w-xs mx-auto leading-relaxed">Plataforma de Estudos Medicos</p>
            <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
              {['Flashcards con repeticion espaciada (FSRS)', 'Quizzes adaptativos con IA', 'Dashboard de progreso en tiempo real', 'Sistema multi-institucional'].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span className="text-white/50 text-xs">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8"><AxonLogo size="md" theme="gradient" /></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{mode === 'signin' ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h1>
              <p className="text-sm text-gray-500 mt-1">{mode === 'signin' ? 'Ingresa tus credenciales para continuar' : 'Registrate para empezar a estudiar'}</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-emerald-700">{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" required autoComplete="name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" required autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contrasena" className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm hover:shadow-md disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Conectando...' : mode === 'signin' ? 'Iniciar sesion' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">{mode === 'signin' ? 'No tienes cuenta?' : 'Ya tienes cuenta?'}</span>
              <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} className="ml-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                {mode === 'signin' ? 'Registrate' : 'Inicia sesion'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">Conectado a Supabase (xdnciktarvxyhkrokbng)</span>
          </div>
          {/* TEMPORARY: Link to diagnostics */}
          <div className="mt-3 text-center">
            <Link to="/diagnostics" className="text-xs text-teal-500 hover:text-teal-400 underline">
              🔍 API Diagnostics (temporal)
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}