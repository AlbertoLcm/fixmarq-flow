import { useState } from 'react';
import { PlusCircle, Trash2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useBudgets } from '../context/BudgetContext';
import { THEME, calculateTotal, formatCurrency } from '../constants/theme';
import type { BudgetItem } from '../types/budget';
import InputText from '../components/InputText';
import Button from '../components/Button';
import api from '../api/axios';

export default function CreateBudget() {
  const navigate = useNavigate();
  const { mostrarNotificacion, refetchBudgets } = useBudgets();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<BudgetItem[]>([
    { id: Date.now().toString(), description: '', quantity: 1, unit: 'Pza', price: 0, total: 0 }
  ]);

  const handleItemChange = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value } as BudgetItem;
        if (field === 'quantity' || field === 'price') {
          const qty = parseFloat(String(updatedItem.quantity)) || 0;
          const prc = parseFloat(String(updatedItem.price)) || 0;
          updatedItem.total = Number((qty * prc).toFixed(2));
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unit: 'Pza', price: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      mostrarNotificacion("El presupuesto debe contener al menos 1 concepto", "warning");
    }
  };

  const handleSave = async () => {
    if (!formData.projectName.trim()) {
      mostrarNotificacion("Por favor ingrese el nombre de la obra o proyecto", "warning");
      return;
    }
    if (!formData.clientName.trim()) {
      mostrarNotificacion("Por favor especifique el cliente", "warning");
      return;
    }

    const validItems = items.filter(i => i.description.trim() !== '');
    if (validItems.length === 0) {
      mostrarNotificacion("Agrega por lo menos un concepto con descripción válida", "warning");
      return;
    }

    const newBudget = {
      project_name: formData.projectName,
      client_name: formData.clientName,
      budget_date: new Date(formData.date).toISOString(),
      items: validItems.map(item => { const { id, total, ...rest } = item; return rest }),
    };

    setIsSaving(true);
    try {
      await api.post('/budgets', newBudget);
      await refetchBudgets();
      mostrarNotificacion("¡Presupuesto guardado con éxito!", "success");
      navigate('/');
    } catch (error) {
      console.error('Error al guardar el presupuesto:', error);
      mostrarNotificacion("Error al guardar el presupuesto", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${THEME.bg} pb-28`}>
      {/* Cabecera Fija */}
      <div className={`sticky top-0 z-10 px-4 py-4 ${THEME.glassHeader} flex items-center justify-between`}>
        <Button variant="secondary" onClick={() => navigate('/')} disabled={isSaving} className="px-3 py-2">
          Volver
        </Button>
        <h2 className="text-base sm:text-lg font-bold text-white">Nuevo Presupuesto</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {/* Formulario de Datos Clave */}
        <div className={`p-5 sm:p-6 rounded-2xl ${THEME.glass} space-y-4`}>
          <div className="border-b border-slate-800 pb-3 mb-2">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> Datos de la Obra
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputText
                label="Proyecto / Obra"
                type="text"
                placeholder="Ej. Remodelación Fachada Principal Residencial"
                disabled={isSaving}
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>
            <div>
              <InputText
                label="Cliente"
                type="text"
                placeholder="Inmobiliaria, Particular, etc."
                disabled={isSaving}
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div>
              <InputText
                label="Fecha de Creación"
                type="date"
                disabled={isSaving}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Listado Dinámico de Conceptos de Obra */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Conceptos y Suministros</h3>
            <span className="text-xs text-slate-500">{items.length} concepto(s)</span>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className={`p-4 sm:p-5 rounded-2xl ${THEME.glassCard} relative border-l-4 border-l-amber-500/80`}>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id!)}
                    disabled={isSaving}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    title="Eliminar concepto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-3 pr-6">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Descripción del Concepto</label>
                    <input
                      type="text"
                      disabled={isSaving}
                      placeholder="Ej. Suministro y colocación de piso cerámico..."
                      className="w-full bg-transparent border-b border-slate-700/60 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      value={item.description}
                      onChange={e => handleItemChange(item.id!, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Cant.</label>
                      <input
                        type="number"
                        disabled={isSaving}
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id!, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Unidad</label>
                      <input
                        type="text"
                        disabled={isSaving}
                        placeholder="m2, pza, lote"
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        value={item.unit}
                        onChange={e => handleItemChange(item.id!, 'unit', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">P. Unitario</label>
                      <input
                        type="number"
                        disabled={isSaving}
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2.5 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        value={item.price}
                        onChange={e => handleItemChange(item.id!, 'price', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col justify-end text-right">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Subtotal</span>
                      <span className="font-extrabold text-amber-500 text-base py-1">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            disabled={isSaving}
            className="w-full py-4 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-slate-850/50 flex items-center justify-center gap-2 transition-all text-sm font-bold disabled:opacity-50 disabled:pointer-events-none"
          >
            <PlusCircle className="w-5 h-5" />
            Agregar Otro Concepto de Obra
          </button>
        </div>

        {/* Panel Resumen Totalizador */}
        <div className={`p-6 rounded-2xl ${THEME.glass} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-sm uppercase">Total Estimación</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{formatCurrency(calculateTotal(items))}</span>
        </div>
      </div>

      {/* Acciones de Guardado */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 ${THEME.glassHeader} border-t-slate-850 z-20`}>
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/')} disabled={isSaving} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} className="flex-[2]">
            Guardar Presupuesto
          </Button>
        </div>
      </div>
    </div>
  );
}
