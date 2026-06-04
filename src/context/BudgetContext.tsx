import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Budget } from '../types/budget';
import api from '../api/axios';

// --- TIPOS DEL CONTEXTO ---
interface Notification {
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'danger';
}

interface BudgetContextValue {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  refetchBudgets: () => Promise<void>;
  notificacion: Notification | null;
  mostrarNotificacion: (mensaje: string, tipo?: Notification['tipo']) => void;
  isLoading: boolean;
}

// --- CREACIÓN DEL CONTEXTO ---
const BudgetContext = createContext<BudgetContextValue | null>(null);

// --- PROVIDER ---
export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [notificacion, setNotificacion] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/budgets?stats=true');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error al obtener los presupuestos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem('bldpro_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const mostrarNotificacion = useCallback((mensaje: string, tipo: Notification['tipo'] = 'info') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, setBudgets, refetchBudgets: fetchBudgets, notificacion, mostrarNotificacion, isLoading }}>
      {children}
    </BudgetContext.Provider>
  );
}

// --- HOOK ---
export function useBudgets(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgets debe usarse dentro de <BudgetProvider>');
  return ctx;
}
