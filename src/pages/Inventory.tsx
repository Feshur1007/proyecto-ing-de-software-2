import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category } from '../types';
import { 
  Search, 
  Filter, 
  Edit, 
  AlertTriangle, 
  ChevronRight, 
  PackageSearch,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const categories: Category[] = ['Insumo Agrícola', 'Medicamento Veterinario', 'Alimento para Animales'];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [editingStock, setEditingStock] = useState<{ id: string, value: string } | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStock = async (id: string, newValue: number) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        currentStock: newValue,
        updatedAt: Timestamp.now()
      });
      setEditingStock(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Cargando inventario...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1 block">Agroveterinaria</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Avícola Campestre</h1>
          <p className="text-slate-500 font-medium">Control de Inventario y Existencias</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="Buscar producto..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all shadow-sm appearance-none font-medium text-slate-700"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
            >
              <option value="Todos">Todas las Categorías</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>

          {isAdmin && (
            <Link
              to="/products/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Nuevo
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-right">Precio Venta</th>
                <th className="px-6 py-4 font-bold text-center">Stock</th>
                <th className="px-6 py-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <AnimatePresence>
                {filteredProducts.map((p) => {
                  const isLowStock = p.currentStock <= p.minStock;
                  return (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            isLowStock ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {isLowStock ? <AlertTriangle className="w-4 h-4" /> : <PackageSearch className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 tracking-tight">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.unitOfMeasure}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm border",
                          p.category === 'Medicamento Veterinario' ? "bg-brand-dark text-white border-brand-dark" :
                          p.category === 'Insumo Agrícola' ? "bg-brand-primary text-brand-dark border-brand-primary" :
                          "bg-brand-accent text-brand-dark border-brand-accent"
                        )}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(p.salePrice)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingStock?.id === p.id ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              autoFocus
                              className="w-16 text-center py-1 border-2 border-brand-primary rounded-lg outline-none font-bold text-sm bg-brand-primary/5"
                              value={editingStock.value}
                              onChange={(e) => setEditingStock({ id: p.id, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateStock(p.id, Number(editingStock.value));
                                if (e.key === 'Escape') setEditingStock(null);
                              }}
                              onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                            />
                          </div>
                        ) : (
                          <div 
                            onClick={() => setEditingStock({ id: p.id, value: p.currentStock.toString() })}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all font-black border",
                              isLowStock ? "bg-brand-accent text-brand-dark border-brand-accent shadow-sm" : "bg-slate-50 text-slate-800 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                            )}
                          >
                            <span className="text-sm">{p.currentStock}</span>
                            <Edit className="w-3 h-3 opacity-30" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <Link
                              to={`/products/edit/${p.id}`}
                              className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/inventory?id=${p.id}`}
                            className="p-2 text-slate-400 hover:text-brand-dark hover:bg-brand-accent/20 rounded-lg transition-colors"
                            title="Detalles"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <PackageSearch className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium italic">No se encontraron productos en el inventario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
