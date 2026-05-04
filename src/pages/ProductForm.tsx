import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp, collection } from 'firebase/firestore';
import { Product, Category } from '../types';
import { ArrowLeft, Save, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const categories: Category[] = ['Insumo Agrícola', 'Medicamento Veterinario', 'Alimento para Animales'];

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Medicamento Veterinario',
    unitOfMeasure: 'unidad',
    purchasePrice: 0,
    salePrice: 0,
    currentStock: 0,
    minStock: 5,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'products', id));
          if (docSnap.exists()) {
            setFormData(docSnap.data() as Product);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `products/${id}`);
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { id: _, ...rest } = formData;
      const productData = {
        ...rest,
        updatedAt: Timestamp.now(),
      };

      if (isEdit && id) {
        await updateDoc(doc(db, 'products', id), productData);
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, productData);
      }
      navigate('/inventory');
    } catch (error) {
      handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center font-medium animate-pulse text-slate-500">Cargando datos del producto...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/inventory" className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Volver al Inventario
        </Link>
        {isEdit && (
          <button className="text-rose-600 hover:text-rose-700 transition-colors font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-rose-50 text-sm">
            <Trash2 className="w-4 h-4" />
            Eliminar Producto
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-8 lg:p-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-slate-500 font-medium italic font-serif">Complete la información técnica del artículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Nombre del Producto</label>
              <input
                required
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold"
                placeholder="Ej: Multivitamínico 500ml"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Categoría</label>
              <select
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Unidad de Medida</label>
              <input
                required
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-semibold"
                placeholder="Ej: unidad, kg, litro, frasco"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">P. de Compra</label>
                <input
                  required
                  type="number"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-bold"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">P. de Venta</label>
                <input
                  required
                  type="number"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-bold"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Stock Actual</label>
                <input
                  required
                  type="number"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-bold"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Stock Mínimo</label>
                <input
                  required
                  type="number"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 focus:outline-none transition-all font-bold"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-3xl shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Producto</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
