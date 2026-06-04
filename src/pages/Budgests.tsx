import { Plus, Building2, TrendingUp, Wallet, FileText } from 'lucide-react';
import { Link } from 'react-router';
import { useBudgets } from '../context/BudgetContext';
import CardBudget from '../components/CardBudget';
import { THEME, formatCurrency } from '../constants/theme';

function MetricCardSkeleton() {
  return (
    <div className={`p-5 rounded-2xl ${THEME.glassCard} animate-pulse relative overflow-hidden h-[116px] flex flex-col justify-between`}>
      <div>
        <div className="h-3 bg-slate-800/80 rounded w-24 mb-2"></div>
        <div className="h-7 bg-slate-800/80 rounded w-36"></div>
      </div>
      <div className="h-2 bg-slate-850 rounded w-28"></div>
    </div>
  );
}

function BudgetCardSkeleton() {
  return (
    <div className={`p-5 rounded-2xl ${THEME.glassCard} animate-pulse flex flex-col justify-between h-[180px]`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
            <div className="h-3 bg-slate-850 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-slate-800/80 rounded-full w-16"></div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="h-2.5 bg-slate-850 rounded w-12"></div>
            <div className="h-4 bg-slate-805/85 rounded w-20"></div>
          </div>
          <div className="space-y-1">
            <div className="h-2.5 bg-slate-850 rounded w-12"></div>
            <div className="h-3.5 bg-slate-805/85 rounded w-16"></div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-800/80 h-2 w-1/3 rounded-full"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-2 bg-slate-850 rounded w-16"></div>
            <div className="h-2 bg-slate-850 rounded w-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Budgets() {
  const { budgets, isLoading } = useBudgets();

  const totalPresupuestado = budgets.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCobrado = budgets.reduce((sum, b) => sum + b.paid_amount, 0);
  const porCobrar = totalPresupuestado - totalCobrado;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      {/* Cabecera Responsiva con Glassmorphism */}
      <div className={`sticky top-0 z-10 px-6 py-5 ${THEME.glassHeader} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Fixmarq<span className="font-light text-slate-400">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Control Inteligente de Obra & Presupuestos</p>
        </div>
        <Link
          to="/create"
          className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#0F172A] ${THEME.accentBg} transition-all shadow-lg shadow-amber-500/10`}
        >
          <Plus className="w-4 h-4" /> Nuevo Presupuesto
        </Link>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Tarjetas de Métricas Adaptables */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <div className={`p-5 rounded-2xl ${THEME.glassCard} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-16 h-16 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Presupuestado</p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white">{formatCurrency(totalPresupuestado)}</h3>
                <p className="text-[10px] text-slate-500 mt-2">Monto global estimado de obras</p>
              </div>

              <div className={`p-5 rounded-2xl ${THEME.glassCard} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-16 h-16 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ingresos (Cobrado)</p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-400">{formatCurrency(totalCobrado)}</h3>
                <p className="text-[10px] text-emerald-500 mt-2">
                  {totalPresupuestado > 0 ? `${Math.round((totalCobrado / totalPresupuestado) * 100)}% de avance financiero` : '0% cobrado'}
                </p>
              </div>

              <div className={`p-5 rounded-2xl ${THEME.glassCard} relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText className="w-16 h-16 text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Por Cobrar / Restante</p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-amber-500">{formatCurrency(porCobrar)}</h3>
                <p className="text-[10px] text-amber-400 mt-2">Saldos pendientes de clientes</p>
              </div>
            </>
          )}
        </div>

        {/* Listado Principal de Proyectos */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-white tracking-wide">Presupuestos Recientes</h2>
            <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
              {isLoading ? 'Cargando...' : `${budgets.length} en total`}
            </span>
          </div>

          {/* Lista responsiva */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {isLoading ? (
              <>
                <BudgetCardSkeleton />
                <BudgetCardSkeleton />
                <BudgetCardSkeleton />
              </>
            ) : budgets.length === 0 ? (
              <div className={`col-span-full p-12 text-center rounded-2xl ${THEME.glass} flex flex-col items-center justify-center`}>
                <FileText className="w-16 h-16 text-slate-600 mb-4" />
                <p className="text-slate-300 font-semibold text-lg">No hay presupuestos registrados</p>
                <p className="text-slate-500 text-sm mt-1 mb-6">Comienza creando tu primera cotización de obra profesional.</p>
                <Link
                  to="/create"
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm text-[#0F172A] ${THEME.accentBg}`}
                >
                  Crear presupuesto
                </Link>
              </div>
            ) : (
              budgets.map(budget => (
                <CardBudget key={budget.id} budget={budget} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Botón Flotante para Móviles */}
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <Link
          to="/create"
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl shadow-amber-500/20 ${THEME.accentBg} text-[#0F172A]`}
        >
          <Plus className="w-7 h-7" />
        </Link>
      </div>
    </div>
  );
}