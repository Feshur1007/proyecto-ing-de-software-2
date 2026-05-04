import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, Timestamp, increment, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, PurchaseInvoice, InvoiceItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  User, 
  Hash, 
  ShoppingCart,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function PurchaseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [invoiceMetadata, setInvoiceMetadata] = useState({
    invoiceNumber: '',
    supplierName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    };
    fetchProducts();
  }, []);

  const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      newItems[index] = { 
        ...newItems[index], 
        productId: value, 
        productName: prod?.name || '',
        unitPrice: prod?.purchasePrice || 0 
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create the invoice
      const invoiceData = {
        ...invoiceMetadata,
        totalAmount,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        })),
        createdAt: Timestamp.now(),
        createdBy: user.uid
      };

      await addDoc(collection(db, 'purchaseInvoices'), invoiceData);

      // 2. Update stock for each product
      const updatePromises = items.map(item => {
        if (!item.productId) return Promise.resolve();
        return updateDoc(doc(db, 'products', item.productId), {
          currentStock: increment(Number(item.quantity)),
          purchasePrice: Number(item.unitPrice), // Update last purchase price
          updatedAt: Timestamp.now()
        });
      });

      await Promise.all(updatePromises);
      navigate('/invoices');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'purchaseInvoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="space-y-1">
        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1 block">Agroveterinaria</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Avícola Campestre</h1>
        <p className="text-slate-500 font-medium">Registro de Compras / Gestión de Inventario</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Metadata section */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 lg:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Núm. Factura</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold"
                value={invoiceMetadata.invoiceNumber}
                onChange={(e) => setInvoiceMetadata({ ...invoiceMetadata, invoiceNumber: e.target.value })}
                placeholder="PRO-00123"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Proveedor</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold"
                value={invoiceMetadata.supplierName}
                onChange={(e) => setInvoiceMetadata({ ...invoiceMetadata, supplierName: e.target.value })}
                placeholder="Nombre del distribuidor"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                type="date"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold"
                value={invoiceMetadata.invoiceDate}
                onChange={(e) => setInvoiceMetadata({ ...invoiceMetadata, invoiceDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Producto</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider w-32">Cantidad</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider w-48">P. Unitario</th>
                <th className="px-6 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider w-40 text-right">Subtotal</th>
                <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-wider w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex gap-2 items-center">
                        <select
                          required
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        >
                          <option value="">Seleccione un producto...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.unitOfMeasure})</option>
                          ))}
                        </select>
                        <Link 
                          to="/products/new" 
                          target="_blank"
                          className="p-3 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
                          title="Crear nuevo producto"
                        >
                          <Plus className="w-5 h-5" />
                        </Link>
                      </div>
                      {item.productId === '' && (
                        <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3" />
                          Seleccione un producto existente
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <input
                        required
                        type="number"
                        min="1"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-center"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-6">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          required
                          type="number"
                          className="w-full pl-7 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-mono font-bold text-slate-700">
                      {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="p-8 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
            <button
              type="button"
              onClick={addItem}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
              Agregar Producto
            </button>

            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Factura</p>
              <p className="text-4xl font-black text-emerald-900 tracking-tighter">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-8 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || items.some(i => !i.productId)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 py-4 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            {loading ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Factura</>}
          </button>
        </div>
      </form>
    </div>
  );
}
