import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Credenciales incorrectas. Por favor intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name: userName,
        email: email,
        role: 'admin' // First users registered this way are admins for setup
      });
      navigate('/');
    } catch (err: any) {
      setError('Error al registrar usuario. Intente con otro correo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-brand-accent rounded-full blur-3xl opacity-10"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
      >
        <div className="p-8 pb-4 text-center">
          <div className="w-24 h-24 bg-brand-dark rounded-3xl flex items-center justify-center shadow-lg shadow-brand-dark/20 mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
            <Logo className="w-16 h-16" />
          </div>
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] leading-none mb-1">Agroveterinaria</span>
            <h2 className="text-4xl font-black text-brand-dark tracking-tighter leading-none italic uppercase">Avícola</h2>
            <h3 className="text-sm font-black text-brand-primary tracking-[0.3em] uppercase leading-none">Campestre</h3>
          </div>
          <p className="text-slate-500 text-xs font-medium px-4">
            {isRegistering ? 'Cree su cuenta de administrador' : 'Gestión Integral Veterinaria y Agrícola'}
          </p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="p-8 pt-4 space-y-4">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:outline-none transition-all text-sm"
                  placeholder="Juan Pérez"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:outline-none transition-all text-sm"
                placeholder="usuario@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary focus:outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark hover:bg-brand-primary text-white font-black py-4 rounded-xl shadow-xl shadow-brand-dark/10 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? 'Procesando...' : isRegistering ? 'Crear Cuenta' : 'Acceder'}
          </button>

          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-center text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-[0.2em] transition-colors py-2"
          >
            {isRegistering ? '¿Ya tiene cuenta? Inicie sesión' : '¿No tiene cuenta? Regístrese'}
          </button>
        </form>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Avícola Campestre<br />
            Agroveterinaria
          </p>
        </div>
      </motion.div>

      {/* Info helper for development */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
        <p className="text-[9px] text-white/40 tracking-[0.3em] uppercase font-black text-center">
            Veterinaria Avícola Campestre
        </p>
      </div>
    </div>
  );
}
