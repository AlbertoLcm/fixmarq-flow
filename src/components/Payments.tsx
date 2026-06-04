import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, CheckCircle2, Calendar, Pencil, Trash2, Plus, TrendingUp, X, Save, AlertCircle } from 'lucide-react';
import type { Budget, Payment } from '../types/budget';
import { THEME, formatCurrency } from '../constants/theme';
import { useBudgets } from '../context/BudgetContext';
import api from '../api/axios';

interface PaymentsProps {
  activeBudget: Budget;
  setActiveBudget: (budget: Budget) => void;
}

export default function Payments({ activeBudget, setActiveBudget }: PaymentsProps) {
  const { budgets, setBudgets, mostrarNotificacion } = useBudgets();
  const [paymentInput, setPaymentInput] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal de registro de pago
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal de edición
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editPaymentInput, setEditPaymentInput] = useState('');
  const [editPaymentDesc, setEditPaymentDesc] = useState('');
  const [editPaymentDate, setEditPaymentDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (activeBudget.paid_amount / activeBudget.total_amount) * 100 || 0;
  const balance = Number((activeBudget.total_amount - activeBudget.paid_amount).toFixed(2));
  const isFullyPaid = balance <= 0;

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentInput);
    if (isNaN(amount) || amount <= 0) {
      mostrarNotificacion('Ingresa un monto de pago válido', 'warning');
      return;
    }
    if (amount > balance) {
      mostrarNotificacion('El abono supera el saldo restante del presupuesto', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/payments', {
        budget_id: activeBudget.id,
        amount,
        description: paymentDesc.trim() || 'Abono a cuenta de obra',
        payment_date: paymentDate,
      });

      const response = await api.get(`/budgets/${activeBudget.id}`);
      const updatedBudget = response.data;

      setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)));
      setActiveBudget(updatedBudget);
      setPaymentInput('');
      setPaymentDesc('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setIsAddModalOpen(false);
      mostrarNotificacion('¡Pago registrado correctamente!', 'success');
    } catch (error) {
      console.error(error);
      mostrarNotificacion('Error al registrar el pago', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setEditPaymentInput(payment.amount.toString());
    setEditPaymentDesc(payment.description);
    setEditPaymentDate(payment.date);
  };

  const handleSaveEditPayment = async () => {
    if (!editingPayment) return;
    const amount = parseFloat(editPaymentInput);
    if (isNaN(amount) || amount <= 0) {
      mostrarNotificacion('Ingresa un monto válido', 'warning');
      return;
    }

    const otherPaymentsTotal = (activeBudget.payments || [])
      .filter((p) => p.id !== editingPayment.id)
      .reduce((sum, p) => sum + p.amount, 0);

    if (otherPaymentsTotal + amount > activeBudget.total_amount) {
      mostrarNotificacion('La edición sobrepasa el total del presupuesto', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/payments/${editingPayment.id}`, {
        amount,
        description: editPaymentDesc.trim() || 'Abono a cuenta',
        payment_date: editPaymentDate,
      });

      const response = await api.get(`/budgets/${activeBudget.id}`);
      const updatedBudget = response.data;

      setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)));
      setActiveBudget(updatedBudget);
      setEditingPayment(null);
      mostrarNotificacion('Abono actualizado correctamente', 'success');
    } catch (error) {
      console.error(error);
      mostrarNotificacion('Error al actualizar el abono', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pago?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/payments/${paymentId}`);
      const response = await api.get(`/budgets/${activeBudget.id}`);
      const updatedBudget = response.data;

      setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)));
      setActiveBudget(updatedBudget);
      setEditingPayment(null);
      mostrarNotificacion('Abono eliminado', 'info');
    } catch (error) {
      console.error(error);
      mostrarNotificacion('Error al eliminar el abono', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const payments = activeBudget.payments || [];

  return (
    <section className="space-y-5">
      {/* ── Encabezado de sección ─────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Control Financiero</h3>
        </div>
        {!isFullyPaid && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Pago
          </button>
        )}
      </div>

      {/* ── Tarjetas de resumen ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total */}
        <div className={`p-4 rounded-2xl ${THEME.glassCard} flex flex-col gap-1`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-base sm:text-lg font-black text-white leading-tight">
            {formatCurrency(activeBudget.total_amount)}
          </span>
        </div>
        {/* Cobrado */}
        <div className={`p-4 rounded-2xl ${THEME.glassCard} flex flex-col gap-1`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cobrado</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 leading-tight">
            {formatCurrency(activeBudget.paid_amount)}
          </span>
        </div>
        {/* Saldo */}
        <div className={`p-4 rounded-2xl ${isFullyPaid ? 'bg-emerald-500/10 border border-emerald-500/20' : THEME.glassCard} flex flex-col gap-1`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo</span>
          <span className={`text-base sm:text-lg font-black leading-tight ${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isFullyPaid ? '¡Liquidado!' : formatCurrency(balance)}
          </span>
        </div>
      </div>

      {/* ── Barra de progreso ─────────────────────────────────── */}
      <div className={`p-5 rounded-2xl ${THEME.glass}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progreso de Amortización</span>
          </div>
          <span className={`text-xs font-black ${isFullyPaid ? 'text-emerald-400' : 'text-emerald-400'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/60">
          <div
            className="h-2.5 rounded-full transition-all duration-700 relative"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: isFullyPaid
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #059669, #10b981)',
            }}
          />
        </div>
        {isFullyPaid && (
          <div className="flex items-center gap-1.5 mt-3 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold">Obra 100% liquidada</span>
          </div>
        )}
      </div>

      {/* ── Historial de pagos (Timeline) ─────────────────────── */}
      <div className={`rounded-2xl ${THEME.glass} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Historial de Pagos
          </span>
          <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/40">
            {payments.length} {payments.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Sin pagos registrados</p>
            <p className="text-xs text-slate-600 mt-1">Los abonos y anticipos aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {payments.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors group"
              >
                {/* Número de pago */}
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-400">#{idx + 1}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{p.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="text-[11px] text-slate-500">{p.date}</span>
                  </div>
                </div>

                {/* Monto + acciones */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(p.amount)}</span>
                  <button
                    onClick={() => openEditModal(p)}
                    disabled={isSubmitting}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all disabled:pointer-events-none"
                    title="Editar pago"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════ MODAL: Registrar Pago ══════════════════ */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className={`relative w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl ${THEME.glass} border-t border-x sm:border border-slate-800 shadow-2xl z-10 animate-modal-enter`}>
            {/* Handle móvil */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Registrar Pago</h3>
                <p className="text-xs text-slate-500 mt-0.5">Saldo disponible: <span className="text-amber-400 font-bold">{formatCurrency(balance)}</span></p>
              </div>
              <button
                onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Monto */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Monto del Abono
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 text-sm disabled:opacity-50"
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Ej. Anticipo inicial, Estimación 1..."
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 text-sm disabled:opacity-50"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Fecha del Pago
                </label>
                <input
                  type="date"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/60 text-sm disabled:opacity-50"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPayment}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isSubmitting ? 'Guardando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════ MODAL: Editar Pago ══════════════════════ */}
      {editingPayment && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => !isSubmitting && setEditingPayment(null)} />
          <div className={`relative w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl ${THEME.glass} border-t border-x sm:border border-slate-800 shadow-2xl z-10 animate-modal-enter`}>
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Editar Pago</h3>
              <button
                onClick={() => !isSubmitting && setEditingPayment(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                  <input
                    type="number"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm disabled:opacity-50"
                    value={editPaymentInput}
                    onChange={(e) => setEditPaymentInput(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Descripción
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm disabled:opacity-50"
                  value={editPaymentDesc}
                  onChange={(e) => setEditPaymentDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Fecha
                </label>
                <input
                  type="date"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm disabled:opacity-50"
                  value={editPaymentDate}
                  onChange={(e) => setEditPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60">
              <button
                onClick={() => handleDeletePayment(editingPayment.id)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => !isSubmitting && setEditingPayment(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditPayment}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
