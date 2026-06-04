import { BrowserRouter } from 'react-router';
import { BudgetProvider } from './context/BudgetContext';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { THEME } from './constants/theme';
import ScrollToTop from './components/ScrollTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BudgetProvider>
        <div className={`min-h-screen w-full font-sans selection:bg-amber-500/30 text-slate-200 ${THEME.bg} relative overflow-x-hidden flex justify-center`}>
          {/* Luces y efectos decorativos de fondo */}
          <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-700/10 blur-[120px] pointer-events-none"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/5 blur-[120px] pointer-events-none"></div>

          {/* Notificación Emergente */}
          <Notification />

          {/* Contenedor Adaptable e Inmersivo */}
          <div className="w-full min-h-screen flex flex-col bg-[#0F172A]/70 backdrop-blur-xl relative">
            <AppRoutes />
          </div>
        </div>
      </BudgetProvider>
    </BrowserRouter>
  );
}

export default App;
