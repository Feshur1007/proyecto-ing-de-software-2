import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  LogOut, 
  PlusCircle, 
  User as UserIcon,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Layout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, path: '/' },
    { name: 'Inventario', icon: Package, path: '/inventory' },
    { name: 'Módulo Facturas', icon: FileText, path: '/invoices' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-dark text-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-6 flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group hover:scale-105 transition-transform">
              <Logo className="w-9 h-9" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] leading-none mb-0.5">Agroveterinaria</span>
              <span className="text-lg font-black text-white leading-tight tracking-tighter italic uppercase">Avícola</span>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest leading-none">Campestre</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-white/10 text-brand-accent shadow-sm" 
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-brand-accent" : "text-slate-400 group-hover:text-slate-300"
                )} />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Administración</p>
              <Link
                to="/products/new"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                Nuevo Producto
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-xs text-brand-dark font-bold uppercase">
              {user?.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-brand-primary/80 font-bold uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-slate-400 hover:bg-rose-900/40 hover:text-rose-400 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {navItems.find(i => i.path === location.pathname)?.name || 'Panel de Control'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/invoices/new')}
                className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-brand-dark/20 hover:bg-brand-primary transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Compra</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                  <Bell className="w-5 h-5 text-slate-500" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-white"></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={location.pathname}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
