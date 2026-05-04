import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PurchaseInvoice } from '../types';
import { 
  FileText, 
  Calendar, 
  User, 
  ChevronRight, 
  Search,
  PlusCircle,
  Eye
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Invoices() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'purchaseInvoices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseInvoice[];
      setInvoices(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'purchaseInvoices');
    });

    return () => unsubscribe();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Historial de Compras</h1>
          <p className="text-sm text-slate-500">Consulta y gestiona las facturas de tus proveedores</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar factura..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-64 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            to="/invoices/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {filteredInvoices.map((inv) => (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedInvoice(inv)}
                className={cn(
                  "p-4 bg-white border rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md flex items-center justify-between group",
                  selectedInvoice?.id === inv.id ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm border",
                    selectedInvoice?.id === inv.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:text-emerald-500 group-hover:bg-emerald-50"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 tracking-tight leading-none mb-1 uppercase">#{inv.invoiceNumber}</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{inv.supplierName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800 tracking-tight">{formatCurrency(inv.totalAmount)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inv.invoiceDate}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredInvoices.length === 0 && (
            <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-medium italic text-sm">No hay resultados</p>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AnimatePresence mode="wait">
              {selectedInvoice ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={selectedInvoice.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Comprobante</p>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">#{selectedInvoice.invoiceNumber}</h2>
                      </div>
                      <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Pagada
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fecha</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedInvoice.invoiceDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Proveedor</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{selectedInvoice.supplierName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 bg-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Items Recibidos</p>
                    <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                      {selectedInvoice.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start group">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{item.productName}</p>
                            <p className="text-xs text-slate-400">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700 tabular-nums">{(item.quantity * item.unitPrice).toLocaleString('es-CO')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 text-white">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Total</p>
                      <p className="text-2xl font-bold tracking-tighter">{formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200 border-dashed">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <Eye className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Selecciona una factura</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
