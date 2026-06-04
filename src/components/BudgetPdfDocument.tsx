import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Budget } from '../types/budget';
import { formatCurrency } from '../constants/theme';

// ─── PALETA DE COLORES ─────────────────────────────────────────────────────────
const C = {
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
  emerald: '#047857',
  amber: '#d97706',
};

// ─── ESTILOS ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    paddingVertical: 28,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.slate900,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: C.slate900,
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.slate950, letterSpacing: -0.5 },
  headerRef: { fontSize: 9, color: C.slate500, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  brandName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.slate950, letterSpacing: -1 },
  brandSub: { fontSize: 7, color: C.slate400, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1, marginBottom: 4 },
  brandContact: { fontSize: 9, color: C.slate800, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  brandPhone: { fontSize: 9, color: C.slate600 },

  // Client card
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 5,
    padding: 10,
    marginBottom: 14,
  },
  clientLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.slate400, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  clientName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.slate950 },
  clientSub: { fontSize: 10, color: C.slate600, marginTop: 2 },
  clientSubBold: { fontFamily: 'Helvetica-Bold', color: C.slate900 },
  dateLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.slate400, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2, textAlign: 'right' },
  dateValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.slate900, textAlign: 'right' },
  dateValidity: { fontSize: 9, color: C.slate500, marginTop: 2, textAlign: 'right' },

  // Table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.slate900,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  thBase: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tableRowAlt: { backgroundColor: C.slate50 },
  tdBase: { fontSize: 10, color: C.slate900 },

  // Columns widths (flex)
  colDesc: { flex: 4 },
  colCant: { flex: 1, textAlign: 'center' },
  colUnit: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },

  // Total box
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 14, marginTop: 6 },
  totalBox: {
    backgroundColor: C.slate900,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
    minWidth: 160,
  },
  totalLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.slate400, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  totalValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white },

  // Payments section
  paymentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    paddingTop: 10,
  },
  paymentsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.slate900,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  payHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingBottom: 4,
    marginBottom: 2,
  },
  payRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.slate100,
    paddingVertical: 3,
  },
  paySummaryRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  payTh: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.slate500 },
  payTd: { fontSize: 9, color: C.slate800 },
  payColDate: { flex: 2 },
  payColDesc: { flex: 5 },
  payColAmt: { flex: 2, textAlign: 'right' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.slate500, marginBottom: 2 },
  footerText: { fontSize: 7.5, color: C.slate400, textAlign: 'center', lineHeight: 1.4 },
});

// ─── COMPONENTE ────────────────────────────────────────────────────────────────

interface BudgetPdfDocumentProps {
  budget: Budget;
}

export default function BudgetPdfDocument({ budget }: BudgetPdfDocumentProps) {
  const payments = budget.payments ?? [];

  return (
    <Document
      title={`Presupuesto - ${budget.project_name}`}
      author="Fixmarq"
      creator="Fixmarq Flow"
    >
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>PRESUPUESTO DE OBRA</Text>
            <Text style={s.headerRef}>Referencia: {budget.id?.toUpperCase()}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.brandName}>Fixmarq</Text>
            <Text style={s.brandSub}>Soluciones de Construcción</Text>
            <Text style={s.brandContact}>Martín Cruz Marquéz</Text>
            <Text style={s.brandPhone}>Tel / WhatsApp: +52 55 6778 4821</Text>
          </View>
        </View>

        {/* ── DATOS DEL CLIENTE ── */}
        <View style={s.clientCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.clientLabel}>Proyecto o Cotización:</Text>
            <Text style={s.clientName}>{budget.project_name}</Text>
            <Text style={s.clientSub}>
              Cliente: <Text style={s.clientSubBold}>{budget.client_name}</Text>
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>Fecha de Emisión:</Text>
            <Text style={s.dateValue}>{budget.budget_date}</Text>
            <Text style={s.dateValidity}>Validez: 30 días naturales</Text>
          </View>
        </View>

        {/* ── TABLA DE CONCEPTOS ── */}
        <View style={s.tableHead}>
          <Text style={[s.thBase, s.colDesc]}>Descripción</Text>
          <Text style={[s.thBase, s.colCant]}>Cant.</Text>
          <Text style={[s.thBase, s.colUnit]}>Unidad</Text>
          <Text style={[s.thBase, s.colPrice]}>P. Unit.</Text>
          <Text style={[s.thBase, s.colTotal]}>Total</Text>
        </View>

        {budget.items.map((item, idx) => (
          <View key={idx} style={[s.tableRow, idx % 2 !== 0 ? s.tableRowAlt : {}]}>
            <Text style={[s.tdBase, s.colDesc, { fontFamily: 'Helvetica-Bold' }]}>{item.description}</Text>
            <Text style={[s.tdBase, s.colCant, { color: C.slate600 }]}>{item.quantity}</Text>
            <Text style={[s.tdBase, s.colUnit, { color: C.slate600 }]}>{item.unit}</Text>
            <Text style={[s.tdBase, s.colPrice, { color: C.slate600 }]}>{formatCurrency(item.price)}</Text>
            <Text style={[s.tdBase, s.colTotal, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        {/* ── TOTAL GENERAL ── */}
        <View style={s.totalRow}>
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Presupuesto Estimado Total</Text>
            <Text style={s.totalValue}>{formatCurrency(budget.total_amount)}</Text>
          </View>
        </View>

        {/* ── PAGOS / AMORTIZACIONES ── */}
        {payments.length > 0 && (
          <View style={s.paymentsSection}>
            <Text style={s.paymentsTitle}>Convenio de Pagos / Abonos Registrados</Text>

            {/* Cabecera */}
            <View style={s.payHead}>
              <Text style={[s.payTh, s.payColDate]}>Fecha</Text>
              <Text style={[s.payTh, s.payColDesc]}>Descripción</Text>
              <Text style={[s.payTh, s.payColAmt]}>Monto</Text>
            </View>

            {/* Filas */}
            {payments.map((p, idx) => (
              <View key={idx} style={s.payRow}>
                <Text style={[s.payTd, s.payColDate, { color: C.slate500, fontFamily: 'Helvetica-Bold' }]}>{p.date}</Text>
                <Text style={[s.payTd, s.payColDesc]}>{p.description}</Text>
                <Text style={[s.payTd, s.payColAmt, { fontFamily: 'Helvetica-Bold' }]}>{formatCurrency(p.amount)}</Text>
              </View>
            ))}

            {/* Resumen */}
            <View style={[s.paySummaryRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: C.slate200 }]}>
              <Text style={[s.payTh, { flex: 7, textAlign: 'right', paddingRight: 8, color: C.slate600 }]}>Importe Amortizado:</Text>
              <Text style={[s.payTh, s.payColAmt, { color: C.emerald, fontSize: 10 }]}>{formatCurrency(budget.paid_amount)}</Text>
            </View>
            <View style={s.paySummaryRow}>
              <Text style={[s.payTh, { flex: 7, textAlign: 'right', paddingRight: 8, color: C.slate800 }]}>Saldo Pendiente:</Text>
              <Text style={[s.payTh, s.payColAmt, { color: C.amber, fontSize: 10 }]}>{formatCurrency(budget.total_amount - budget.paid_amount)}</Text>
            </View>
          </View>
        )}

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerBold}>GRACIAS POR SU CONFIANZA</Text>
          <Text style={s.footerText}>
            Este presupuesto no constituye un contrato definitivo de obra, es únicamente una proyección estimativa de costos sujeta a variaciones.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
