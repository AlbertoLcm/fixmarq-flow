import { AlertCircle, Briefcase, CheckCircle2 } from "lucide-react";
import type { Budget } from "../types/budget";

export const THEME = {
  bg: 'bg-[#0b0f19]',
  gradientBg: 'from-slate-950 via-slate-900 to-slate-950',
  glassHeader: 'bg-[#0b0f19]/80 backdrop-blur-xl border-b border-[#20304c]/85',
  glassCard: 'bg-[#131d31]/75 backdrop-blur-md border border-[#20304c]/70 hover:border-amber-500/35 hover:bg-[#17253d]/80 transition-all duration-300 shadow-xl shadow-black/20',
  glass: 'bg-[#131d31]/90 border border-[#20304c]/80 shadow-xl shadow-black/30',
  accentBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  primary: 'bg-sky-500/90 hover:bg-sky-500/95 text-white shadow-lg',
  buttonOutline: 'bg-transparent border-slate-700 hover:border-sky-500/60 hover:bg-sky-500/10 text-slate-300',
};

export const calculateTotal = (items: any[]): number => {
  return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

export const getStatusInfo = (budget: Budget) => {
  const paid = budget.paid_amount ?? 0;
  const total = budget.total_amount ?? 0;
  if (paid >= total) {
    return { label: 'Pagado', status: 'paid', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: CheckCircle2 };
  }
  if (paid > 0) {
    return { label: 'En Curso', status: 'ongoing', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: AlertCircle };
  }
  return { label: 'Pendiente', status: 'pending', color: 'text-slate-400 border-slate-700/50 bg-slate-800/50', icon: Briefcase };
};