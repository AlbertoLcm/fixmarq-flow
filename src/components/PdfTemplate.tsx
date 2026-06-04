import type { Budget } from '../types/budget';
import { formatCurrency } from '../constants/theme';

interface PdfTemplateProps {
  activeBudget: Budget;
}

export default function PdfTemplate({ activeBudget }: PdfTemplateProps) {
  // Paleta de colores Tailwind Slate (Hex)
  const colors = {
    white: '#ffffff',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate800: '#1e293b',
    slate900: '#0f172a',
    slate950: '#020617',
    emerald700: '#047857',
    amber600: '#d97706',
  };

  const styles = {
    container: {
      width: '100%',
      padding: '20px',
      backgroundColor: colors.white,
      color: colors.slate900,
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      borderBottom: `3px solid ${colors.slate900}`,
      paddingBottom: '10px',
      marginBottom: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Cambiado a flex-start para alinear mejor el texto de contacto largo
    },
    clientInfoCard: {
      backgroundColor: colors.slate50,
      padding: '10px 14px',
      borderRadius: '6px',
      border: `1px solid ${colors.slate200}`,
      marginBottom: '14px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '14px',
    },
    th: {
      backgroundColor: colors.slate900,
      color: colors.white,
      padding: '6px 12px',
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      fontWeight: 'bold',
      textAlign: 'left' as const,
    },
    td: {
      padding: '5px 12px', // Un píxel menos para ajustar aún más los conceptos de obra largos
      fontSize: '11px',
      borderBottom: `1px solid ${colors.slate200}`,
    },
    totalBox: {
      backgroundColor: colors.slate900,
      color: colors.white,
      padding: '10px 14px',
      borderRadius: '6px',
      textAlign: 'right' as const,
      width: '220px',
    },
    footer: {
      marginTop: '20px',
      paddingTop: '10px',
      borderTop: `1px solid ${colors.slate200}`,
      textAlign: 'center' as const,
      fontSize: '9px',
      color: colors.slate400,
    }
  };

  return (
    <div
      id="hidden-pdf-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      <div id="hidden-pdf-template" style={styles.container}>
        {/* Encabezado Principal */}
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: colors.slate950, letterSpacing: '-0.5px' }}>
              PRESUPUESTO DE OBRA
            </h1>
            <p style={{ margin: '2px 0 0', color: colors.slate500, fontSize: '10px', fontWeight: 600 }}>
              Referencia: {activeBudget.id?.toUpperCase()}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: colors.slate600, lineHeight: '1.3' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, letterSpacing: '-1px', color: colors.slate950 }}>
              Fixmarq
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: '8px', color: colors.slate400, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Soluciones de Construcción
            </p>
            {/* Datos de contacto del emisor */}
            <p style={{ margin: 0, fontWeight: 600, color: colors.slate800 }}>Marín Cruz Marquéz</p>
            <p style={{ margin: 0 }}>Tel / WhatsApp: +52 55 6778 4821</p>
          </div>
        </div>

        {/* Información del Cliente */}
        <div style={styles.clientInfoCard}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: 'bold', color: colors.slate400, margin: '0 0 2px', letterSpacing: '1px' }}>
              PROYECTO O COTIZACIÓN:
            </p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: colors.slate950, margin: 0 }}>
              {activeBudget.project_name}
            </p>
            <p style={{ fontSize: '11px', color: colors.slate600, margin: '2px 0 0' }}>
              Cliente: <strong style={{ color: colors.slate900 }}>{activeBudget.client_name}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right', flex: 1 }}>
            <p style={{ fontSize: '9px', fontWeight: 'bold', color: colors.slate400, margin: '0 0 2px', letterSpacing: '1px' }}>
              FECHA DE EMISIÓN:
            </p>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: colors.slate900, margin: 0 }}>
              {activeBudget.budget_date}
            </p>
            <p style={{ fontSize: '11px', color: colors.slate500, margin: '2px 0 0' }}>
              Validez: 30 días naturales
            </p>
          </div>
        </div>

        {/* Tabla de Conceptos */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, borderTopLeftRadius: '4px' }}>Descripción</th>
              <th style={{ ...styles.th, textAlign: 'center', width: '45px' }}>Cant.</th>
              <th style={{ ...styles.th, textAlign: 'center', width: '55px' }}>Unidad</th>
              <th style={{ ...styles.th, textAlign: 'right', width: '90px' }}>P. Unitario</th>
              <th style={{ ...styles.th, textAlign: 'right', width: '100px', borderTopRightRadius: '4px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {activeBudget.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{item.description}</td>
                <td style={{ ...styles.td, textAlign: 'center', color: colors.slate600 }}>{item.quantity}</td>
                <td style={{ ...styles.td, textAlign: 'center', color: colors.slate600 }}>{item.unit}</td>
                <td style={{ ...styles.td, textAlign: 'right', color: colors.slate600 }}>{formatCurrency(item.price)}</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gran Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <div style={styles.totalBox}>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: colors.slate400, letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>
              PRESUPUESTO ESTIMADO TOTAL
            </span>
            <span style={{ fontSize: '18px', fontWeight: 900 }}>{formatCurrency(activeBudget.total_amount)}</span>
          </div>
        </div>

        {/* Registro de Amortizaciones */}
        {activeBudget.payments && activeBudget.payments.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: `1px solid ${colors.slate200}`, paddingTop: '10px' }}>
            <h3 style={{ fontSize: '9px', fontWeight: 'bold', color: colors.slate900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              CONVENIO DE PAGOS / ABONOS REGISTRADOS
            </h3>
            <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.slate200}`, color: colors.slate500 }}>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '4px 0' }}>Descripción</th>
                  <th style={{ textAlign: 'right', padding: '4px 0' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {activeBudget.payments.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.slate100}` }}>
                    <td style={{ padding: '4px 0', color: colors.slate500, fontWeight: 600 }}>{p.date}</td>
                    <td style={{ padding: '4px 0', color: colors.slate800 }}>{p.description}</td>
                    <td style={{ padding: '4px 0', color: colors.slate900, fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', color: colors.slate600 }}>Importe Amortizado:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 900, color: colors.emerald700, fontSize: '11px' }}>{formatCurrency(activeBudget.paid_amount)}</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${colors.slate200}` }}>
                  <td colSpan={2} style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', color: colors.slate800 }}>Saldo Pendiente:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 900, color: colors.amber600, fontSize: '11px' }}>{formatCurrency(activeBudget.total_amount - activeBudget.paid_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ fontWeight: 'bold', color: colors.slate500, marginBottom: '2px', fontSize: '9px' }}>
            GRACIAS POR SU CONFIANZA
          </p>
          <p style={{ margin: 0, lineHeight: '1.3' }}>
            Este presupuesto no constituye un contrato definitivo de obra, es únicamente una proyección estimativa de costos sujeta a variaciones.
          </p>
        </div>
      </div>
    </div>
  );
}