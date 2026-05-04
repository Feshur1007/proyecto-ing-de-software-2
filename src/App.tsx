/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductForm from './pages/ProductForm';
import Invoices from './pages/Invoices';
import PurchaseForm from './pages/PurchaseForm';
import Login from './pages/Login';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50 font-sans text-slate-500">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="products/new" element={
              <ProtectedRoute adminOnly>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="products/edit/:id" element={
              <ProtectedRoute adminOnly>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<PurchaseForm />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
