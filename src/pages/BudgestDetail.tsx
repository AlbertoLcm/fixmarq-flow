import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft, Download, Briefcase, Calendar, PlusCircle,
  Pencil, Trash2, Save, X, MoreVertical, Package, Hash,
  Layers, DollarSign, AlertTriangle, ChevronUp, ChevronDown
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { pdf } from '@react-pdf/renderer';
import { useBudgets } from '../context/BudgetContext';
import { THEME, formatCurrency } from '../constants/theme';
import Payments from '../components/Payments';
import BudgetPdfDocument from '../components/BudgetPdfDocument';
import Button from '../components/Button';
import type { Budget, BudgetItem } from '../types/budget';
import api from '../api/axios';

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function BudgetDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0b0f19]">
      <div className={`sticky top-0 z-10 px-4 py-4 ${THEME.glassHeader} flex items-center justify-between`}>
        <div className="w-10 h-10 bg-slate-800/80 rounded-xl animate-pulse"></div>
        <div className="h-5 bg-slate-800/80 rounded w-32 animate-pulse"></div>
        <div className="w-28 h-10 bg-slate-800/80 rounded-xl animate-pulse"></div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6 pb-24 animate-pulse">
        <div className={`p-6 sm:p-8 rounded-2xl ${THEME.glass} relative overflow-hidden space-y-6`}>
          <div className="h-6 bg-slate-800/85 rounded w-28"></div>
          <div className="h-8 bg-slate-800/85 rounded w-2/3 mt-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#20304c]/80 mt-6 pt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-850 rounded w-16"></div>
                <div className="h-4 bg-slate-800/85 rounded w-28"></div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${THEME.glass} space-y-4`}>
          <div className="h-4 bg-slate-800/85 rounded w-48"></div>
          <div className="h-2.5 bg-slate-900/60 rounded-full"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-900/40 rounded-2xl"></div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl ${THEME.glass} overflow-hidden`}>
          <div className="h-12 bg-slate-900/40 border-b border-slate-800/60"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 border-b border-slate-800/30 animate-pulse bg-slate-900/20"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HELPER FUNCTIONS FOR ITEM ORDER PERSISTENCE ────────────────────────────────
const getSavedItemOrder = (budgetId: string): string[] => {
  try {
    const data = localStorage.getItem(`budget_items_order_${budgetId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveItemOrder = (budgetId: string, itemIds: string[]) => {
  try {
    localStorage.setItem(`budget_items_order_${budgetId}`, JSON.stringify(itemIds));
  } catch (e) {
    console.error(e);
  }
};

const sortItemsByOrder = (items: BudgetItem[], savedOrder: string[]): BudgetItem[] => {
  if (!savedOrder || savedOrder.length === 0) return items;
  return [...items].sort((a, b) => {
    const idxA = savedOrder.indexOf(a.id || '');
    const idxB = savedOrder.indexOf(b.id || '');
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
};

// ─── EDITOR DE CONCEPTOS ───────────────────────────────────────────────────────

interface BudgetItemsEditorProps {
  activeBudget: Budget;
  setActiveBudget: React.Dispatch<React.SetStateAction<Budget | undefined>>;
  mostrarNotificacion: (msg: string, tipo?: 'info' | 'success' | 'warning' | 'danger') => void;
}

function BudgetItemsEditor({ activeBudget, setActiveBudget, mostrarNotificacion }: BudgetItemsEditorProps) {
  const { budgets, setBudgets } = useBudgets();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<BudgetItem | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  useEffect(() => {
    if (!openMenuId) return;
    const handleOutsideClick = () => setOpenMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openMenuId]);

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeBudget.items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...activeBudget.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updatedBudget = { ...activeBudget, items: newItems };
    setActiveBudget(updatedBudget);

    const itemIds = newItems.map(item => item.id || '');
    saveItemOrder(activeBudget.id!, itemIds);
  };

  const handleCreateIndividual = () => {
    setModalItem({ description: '', quantity: 1, unit: 'Pza', price: 0, total: 0 });
    setIsItemModalOpen(true);
  };

  const handleStartEditIndividual = (item: BudgetItem) => {
    setModalItem({ ...item });
    setIsItemModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteIndividual = async (item: BudgetItem) => {
    setOpenMenuId(null);
    if (activeBudget.items.length <= 1) {
      mostrarNotificacion('El presupuesto debe tener al menos 1 concepto', 'warning');
      return;
    }
    const confirmDelete = window.confirm(`¿Eliminar el concepto "${item.description}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/items/${item.id}`);
      const response = await api.get(`/budgets/${activeBudget.id}`);
      const updatedBudget = response.data;
      
      const savedOrder = getSavedItemOrder(updatedBudget.id);
      const newOrder = savedOrder.filter(id => id !== item.id);
      saveItemOrder(updatedBudget.id, newOrder);
      
      updatedBudget.items = sortItemsByOrder(updatedBudget.items, newOrder);
      setActiveBudget(updatedBudget);
      setBudgets(budgets.map(b => (b.id === updatedBudget.id ? updatedBudget : b)));
      mostrarNotificacion('Concepto eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar concepto:', error);
      mostrarNotificacion('Error al eliminar el concepto', 'danger');
    }
  };

  const handleSaveModalItem = async () => {
    if (!modalItem) return;
    if (!modalItem.description.trim()) {
      mostrarNotificacion('La descripción es obligatoria', 'warning');
      return;
    }

    setIsSubmittingItem(true);
    try {
      if (modalItem.id) {
        await api.patch(`/items/${modalItem.id}`, {
          description: modalItem.description,
          quantity: modalItem.quantity,
          unit: modalItem.unit,
          price: modalItem.price,
        });
        mostrarNotificacion('Concepto actualizado correctamente', 'success');
      } else {
        await api.post('/items', {
          budget_id: activeBudget.id,
          description: modalItem.description,
          quantity: modalItem.quantity,
          unit: modalItem.unit,
          price: modalItem.price,
        });
        mostrarNotificacion('Concepto agregado correctamente', 'success');
      }

      const response = await api.get(`/budgets/${activeBudget.id}`);
      const updatedBudget = response.data;
      
      const savedOrder = getSavedItemOrder(updatedBudget.id);
      const currentIds = updatedBudget.items.map((it: any) => it.id);
      const newOrder = savedOrder.filter(id => currentIds.includes(id));
      currentIds.forEach((id: string) => {
        if (!newOrder.includes(id)) {
          newOrder.push(id);
        }
      });
      saveItemOrder(updatedBudget.id, newOrder);
      
      updatedBudget.items = sortItemsByOrder(updatedBudget.items, newOrder);
      setActiveBudget(updatedBudget);
      setBudgets(budgets.map(b => (b.id === updatedBudget.id ? updatedBudget : b)));
      setIsItemModalOpen(false);
      setModalItem(null);
    } catch (error) {
      console.error('Error al guardar concepto:', error);
      mostrarNotificacion('Error al guardar el concepto', 'danger');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const totalItems = activeBudget.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <section className="space-y-5">
      {/* ── Encabezado de sección ─────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Desglose de Conceptos
          </h3>
        </div>
        <button
          onClick={handleCreateIndividual}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all text-xs font-bold"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {/* ── Tabla de conceptos ────────────────────────────────── */}
      <div className={`rounded-2xl ${THEME.glass} overflow-hidden`}>
        {/* Cabecera de tabla */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-5 py-3 border-b border-slate-800/60 bg-slate-900/30">
          <div className="col-span-5 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Package className="w-3 h-3" /> Concepto
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Hash className="w-3 h-3" /> Cant. / U.
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <DollarSign className="w-3 h-3" /> P. Unit.
          </div>
          <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
            Subtotal
          </div>
          <div className="col-span-1" />
        </div>

        {/* Filas de conceptos */}
        <div className="divide-y divide-slate-800/30">
          {activeBudget.items.map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="group px-5 py-4 hover:bg-slate-800/20 transition-colors"
            >
              {/* Móvil: card compacta */}
              <div className="sm:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[9px] font-black text-amber-400 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Mover arriba"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === activeBudget.items.length - 1}
                          className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Mover abajo"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 leading-tight">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-[11px] text-slate-500">×</span>
                      <span className="text-[11px] text-slate-400 font-semibold">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-600 uppercase block">Subtotal</span>
                      <span className="text-sm font-black text-white">{formatCurrency(item.total)}</span>
                    </div>
                    {/* Menú 3 puntos */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item.id ? null : (item.id || null));
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === item.id && createPortal(
                        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                          <div className="absolute inset-0" onClick={() => setOpenMenuId(null)} />
                          <div className="relative w-full bg-slate-900/95 border-t border-slate-800 rounded-t-2xl p-5 pb-8 shadow-2xl space-y-3 z-10 animate-slide-up">
                            <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto mb-3" />
                            <div className="text-center pb-3 border-b border-slate-800/60">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</h4>
                              <p className="text-sm text-slate-200 font-bold truncate mt-1">{item.description}</p>
                            </div>
                            <button
                              onClick={() => handleStartEditIndividual(item)}
                              className="w-full py-3.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-200 font-bold text-sm flex items-center justify-center gap-3"
                            >
                              <Pencil className="w-4 h-4 text-amber-400" />
                              Editar Concepto
                            </button>
                            <button
                              onClick={() => handleDeleteIndividual(item)}
                              className="w-full py-3.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar Concepto
                            </button>
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: fila de tabla */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                {/* Concepto */}
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[9px] font-black text-amber-400 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMoveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Mover arriba"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveItem(idx, 'down')}
                      disabled={idx === activeBudget.items.length - 1}
                      className="p-1 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 leading-snug truncate">{item.description}</p>
                </div>

                {/* Cantidad / Unidad */}
                <div className="col-span-2">
                  <span className="text-sm text-slate-400">
                    <span className="font-semibold text-slate-200">{item.quantity}</span>{' '}
                    <span className="text-slate-500">{item.unit}</span>
                  </span>
                </div>

                {/* Precio unitario */}
                <div className="col-span-2">
                  <span className="text-sm text-slate-400 font-medium">{formatCurrency(item.price)}</span>
                </div>

                {/* Subtotal */}
                <div className="col-span-2 text-right">
                  <span className="text-sm font-black text-white">{formatCurrency(item.total)}</span>
                </div>

                {/* Acciones */}
                <div className="col-span-1 flex justify-end">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item.id ? null : (item.id || null));
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === item.id && (
                      <div className="absolute right-0 top-8 w-36 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl z-30 overflow-hidden py-1 backdrop-blur-md animate-scale-in">
                        <button
                          onClick={() => handleStartEditIndividual(item)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-400" />
                          Editar
                        </button>
                        <div className="border-t border-slate-800/60 my-1" />
                        <button
                          onClick={() => handleDeleteIndividual(item)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pie de tabla: total */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {activeBudget.items.length} {activeBudget.items.length === 1 ? 'concepto' : 'conceptos'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total General</span>
            <span className="text-xl font-black text-amber-400">{formatCurrency(totalItems)}</span>
          </div>
        </div>
      </div>

      {/* ══════════════ MODAL: Agregar / Editar Concepto ═══════════════════ */}
      {isItemModalOpen && modalItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => {
            setIsItemModalOpen(false);
            setModalItem(null);
          }} />
          <div className={`relative w-full max-w-lg p-6 rounded-t-3xl sm:rounded-2xl ${THEME.glass} border-t border-x sm:border border-slate-800 shadow-2xl z-10 animate-modal-enter`}>
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalItem.id ? 'Editar Concepto' : 'Nuevo Concepto'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalItem.id ? 'Modifica los datos del concepto' : 'Agrega un concepto al presupuesto'}
                </p>
              </div>
              <button
                onClick={() => { setIsItemModalOpen(false); setModalItem(null); }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Descripción */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                  Descripción del Concepto
                </label>
                <textarea
                  placeholder="Ej. Suministro y colocación de piso cerámico..."
                  rows={3}
                  autoFocus
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 text-sm resize-none"
                  value={modalItem.description}
                  onChange={(e) => setModalItem(prev => (prev ? { ...prev, description: e.target.value } : null))}
                />
              </div>

              {/* Cantidad / Unidad / Precio */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-amber-500/60"
                    value={modalItem.quantity}
                    onChange={(e) => setModalItem(prev => (prev ? { ...prev, quantity: parseFloat(e.target.value) || 0 } : null))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Unidad
                  </label>
                  <input
                    type="text"
                    placeholder="Pza, m², ml..."
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-amber-500/60"
                    value={modalItem.unit}
                    onChange={(e) => setModalItem(prev => (prev ? { ...prev, unit: e.target.value } : null))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    P. Unitario
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-7 pr-3 py-3 text-white text-sm focus:outline-none focus:border-amber-500/60"
                      value={modalItem.price}
                      onChange={(e) => setModalItem(prev => (prev ? { ...prev, price: parseFloat(e.target.value) } : null))}
                    />
                  </div>
                </div>
              </div>

              {/* Preview subtotal */}
              <div className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal calculado</span>
                <span className="text-lg font-black text-amber-400">
                  {formatCurrency(modalItem.quantity * modalItem.price)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setIsItemModalOpen(false); setModalItem(null); }}
                disabled={isSubmittingItem}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModalItem}
                disabled={isSubmittingItem}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {isSubmittingItem ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmittingItem ? 'Guardando...' : 'Guardar Concepto'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarNotificacion, setBudgets, budgets } = useBudgets();

  const [activeBudget, setActiveBudget] = useState<Budget>();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function getBudget() {
      setIsLoading(true);
      try {
        const response = await api.get(`/budgets/${id}`);
        const budget = response.data;
        const savedOrder = getSavedItemOrder(budget.id);
        if (savedOrder.length > 0) {
          budget.items = sortItemsByOrder(budget.items, savedOrder);
        }
        setActiveBudget(budget);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    getBudget();
  }, [id]);

  if (isLoading) return <BudgetDetailSkeleton />;

  if (!activeBudget) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h2 className="text-xl font-bold mb-4">Presupuesto no encontrado</h2>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (!activeBudget) return;
    setIsExporting(true);
    try {
      const blob = await pdf(
        <BudgetPdfDocument budget={activeBudget} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Presupuesto_${(activeBudget.project_name || 'Obra').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      mostrarNotificacion('¡PDF descargado con éxito!', 'success');
    } catch (err) {
      console.error(err);
      mostrarNotificacion('Error al generar PDF', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!activeBudget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/budgets/${activeBudget.id}`);
      setBudgets(budgets.filter(b => b.id !== activeBudget.id));
      mostrarNotificacion('Presupuesto eliminado correctamente', 'success');
      navigate('/');
    } catch (err) {
      console.error(err);
      mostrarNotificacion('Error al eliminar el presupuesto', 'danger');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${THEME.bg}`}>
      {/* ── Cabecera Fija ─────────────────────────────────────── */}
      <div className={`sticky top-0 z-10 px-4 py-3.5 ${THEME.glassHeader} flex items-center justify-between`}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold">Volver</span>
        </button>

        <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[180px] sm:max-w-[360px]">
          {activeBudget.project_name}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 rounded-xl flex items-center gap-2 transition-all"
            title="Eliminar presupuesto"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">Eliminar</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="p-2 sm:px-4 sm:py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:text-slate-950 hover:bg-amber-500 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar a PDF profesional"
          >
            {isExporting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs font-bold">
              {isExporting ? 'Generando...' : 'Exportar PDF'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Modal de confirmación: Eliminar Presupuesto ────────── */}
      {isDeleteModalOpen && activeBudget && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className={`relative w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl ${THEME.glass} border-t border-x sm:border border-slate-800 shadow-2xl z-10 animate-modal-enter`}>
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5 sm:hidden" />

            {/* Icono de advertencia */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-white">Eliminar Presupuesto</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                ¿Estás seguro de que deseas eliminar{' '}
                <span className="text-white font-bold">&ldquo;{activeBudget.project_name}&rdquo;</span>?
              </p>
              <p className="text-xs text-red-400/80 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                Esta acción es irreversible. Se eliminarán todos los conceptos y pagos asociados.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBudget}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Contenido principal ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-8 pb-24">

          {/* ── Ficha de la obra ─────────────────────────────── */}
          <div className={`p-6 sm:p-8 rounded-2xl ${THEME.glass} relative overflow-hidden`}>
            {/* Decoración de fondo */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-500/4 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 mb-5">
                Proyecto en Control
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-6">
                {activeBudget.project_name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cliente</p>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5">{activeBudget.client_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Presupuesto</p>
                    <p className="text-lg font-black text-amber-400 mt-0.5">{formatCurrency(activeBudget.total_amount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fecha</p>
                    <p className="text-sm font-semibold text-slate-300 mt-0.5">{activeBudget.budget_date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Control Financiero (Payments) ─────────────────── */}
          <Payments activeBudget={activeBudget} setActiveBudget={setActiveBudget} />

          {/* ── Desglose de Conceptos ─────────────────────────── */}
          <BudgetItemsEditor
            activeBudget={activeBudget}
            setActiveBudget={setActiveBudget}
            mostrarNotificacion={mostrarNotificacion}
          />
        </div>
      </div>


    </div>
  );
}