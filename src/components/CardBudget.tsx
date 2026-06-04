import { Briefcase } from 'lucide-react';
import { Link } from 'react-router';
import type { Budget } from '../types/budget';
import { THEME, formatCurrency, getStatusInfo } from '../constants/theme';

interface CardBudgetProps {
  budget: Budget;
}

export default function CardBudget({ budget }: CardBudgetProps) {
  const status = getStatusInfo(budget);
  const StatusIcon = status.icon;
  const progress = (budget.paid_amount / budget.total_amount) * 100 || 0;

  return (
    <Link
      to={`/budget/${budget.id}`}
      className={`p-5 rounded-2xl cursor-pointer ${THEME.glassCard} hover:scale-[1.01] flex flex-col justify-between block`}
    >
      <div>
        {/* Cabecera Tarjeta */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-base leading-tight truncate group-hover:text-amber-400">
              {budget.project_name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1">
              <Briefcase className="w-3 h-3 flex-shrink-0 text-slate-500" />
              {budget.client_name}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Avances e importes */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Obra</p>
            <p className="font-extrabold text-white text-lg">{formatCurrency(budget.total_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Cobrado</p>
            <p className="font-extrabold text-emerald-400 text-sm">{formatCurrency(budget.paid_amount)}</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-1">
          <div className="w-full bg-slate-900/90 rounded-full h-2 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Avance de Cobro</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
