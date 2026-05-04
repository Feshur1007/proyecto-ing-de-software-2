import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, PurchaseInvoice } from '../types';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart,
  ArrowRight,
  PlusCircle,
  FileText,
  Boxes
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Fetch products
    const unsubscribeProds = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    });

    // Fetch last 5 invoices
    const qInvoices = query(collection(db, 'purchaseInvoices'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeInv = onSnapshot(qInvoices, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })) as PurchaseInvoice[]);
      setLoading(false);
    });

    return () => {
      unsubscribeProds();
      unsubscribeInv();
    };
  }, []);

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
  const totalStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);

  const stats = [
    { label: 'Productos Totales', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Alertas de Stock', value: lowStockProducts.length, icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
    { label: 'Valor Inventario', value: formatCurrency(totalStockValue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Nuevas Facturas', value: invoices.length, icon: FileText, color: 'bg-amber-50 text-amber-600' },
  ];

  if (loading) return <div className="p-10 text-center font-medium animate-pulse text-slate-500 text-lg uppercase tracking-widest">Iniciando Panel...</div>;

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="flex gap-6 items-center flex-col md:flex-row text-center md:text-left relative z-10">
          <div className="w-24 h-24 bg-brand-dark rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-dark/20 flex-shrink-0 group hover:scale-105 transition-transform">
            <Logo className="w-16 h-16" />
          </div>
          <div>
            <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.5em] mb-1 block">Agroveterinaria</span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-4">Avícola Campestre</h1>
            <p className="text-slate-500 font-medium text-lg italic font-serif">Bienvenido de nuevo, <span className="text-brand-dark font-black not-italic">{user?.name}</span>. El sistema está listo para operar.</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link
            to="/invoices/new"
            className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1 active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            Nueva Compra
          </Link>
          {isAdmin && (
            <Link
              to="/products/new"
              className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Nuevo Producto
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md",
              stat.label === 'Alertas de Stock' && stat.value > 0 ? "ring-2 ring-brand-accent/50" : ""
            )}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              stat.label === 'Alertas de Stock' && stat.value > 0 ? "text-brand-dark" : "text-brand-dark"
            )}>{stat.value}</p>
            <div className="mt-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1">
              <stat.icon className="w-3 h-3 text-brand-accent" />
              Actualizado hoy
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Alertas de Inventario Bajo</h2>
            <span className="text-xs font-bold bg-brand-accent text-brand-dark px-2.5 py-1 rounded-full uppercase tracking-tighter">Atención Prioritaria</span>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Stock Actual</th>
                <th className="px-6 py-3">Mínimo</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex flex-col">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-[10px] text-brand-primary uppercase font-black tracking-widest">{p.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">{p.currentStock} {p.unitOfMeasure}</td>
                    <td className="px-6 py-4 text-slate-500">{p.minStock} {p.unitOfMeasure}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/invoices/new" className="text-brand-dark hover:text-brand-primary font-black text-[10px] uppercase tracking-widest border-b-2 border-brand-accent">Repo</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium italic">No hay alertas activas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Últimas Compras</h2>
            <Link to="/invoices" className="p-1 hover:bg-slate-50 rounded text-brand-primary transition-colors">
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 flex-1 space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group hover:ring-2 hover:ring-brand-accent/30 transition-all cursor-pointer border border-transparent hover:border-brand-accent/50">
                <div className="mt-1 text-brand-primary group-hover:text-brand-dark transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate tracking-tight">#{inv.invoiceNumber}</p>
                  <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-wider">{inv.supplierName}</p>
                  <p className="text-[10px] font-black text-brand-dark mt-1 uppercase tracking-tighter bg-brand-accent/20 px-2 py-0.5 rounded-full inline-block">{formatCurrency(inv.totalAmount)} • Completada</p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-10">Sin facturas recientes</p>
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Link to="/invoices" className="block w-full py-2 text-center text-[10px] font-black text-brand-dark hover:text-brand-primary uppercase tracking-[0.2em] bg-slate-50 rounded hover:bg-slate-100 transition-colors">
              Ver Historial Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
