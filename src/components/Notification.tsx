import { AlertCircle } from 'lucide-react';
import { useBudgets } from '../context/BudgetContext';

export default function Notification() {
  const { notificacion } = useBudgets();

  if (!notificacion) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-amber-500/40 text-slate-100 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-bounce">
      <AlertCircle className="w-4 h-4 text-amber-400" />
      <span className="text-xs sm:text-sm font-bold">{notificacion.mensaje}</span>
    </div>
  );
}
