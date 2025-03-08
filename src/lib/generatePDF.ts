import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import type { Invoice } from '../types/invoice';

// Register a custom font for better styling
Font.register({
  family: 'Inter',
  src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2'
});

Font.register({
  family: 'Inter-Bold',
  src: 'https://rsms.me/inter/font-files/Inter-Bold.woff2'
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 4,
    color: '#111111',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    marginBottom: 8,
    color: '#111111',
  },
  companyInfo: {
    marginBottom: 30,
  },
  companyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  description: {
    flex: 3,
    paddingRight: 8,
  },
  quantity: {
    flex: 1,
    textAlign: 'right',
  },
  price: {
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    flex: 1,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    width: 100,
    textAlign: 'right',
    marginRight: 16,
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 20,
  },
});

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const InvoicePDF = ({ invoice }: { invoice: Invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.invoiceNumber}>{invoice.number}</Text>
      </View>

      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{invoice.company?.name}</Text>
        <Text style={styles.text}>{invoice.company?.address}</Text>
        <Text style={styles.text}>Tax ID: {invoice.company?.taxId}</Text>
        <Text style={styles.text}>Phone: {invoice.company?.phone}</Text>
        <Text style={styles.text}>Email: {invoice.company?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BILL TO</Text>
        <Text style={[styles.text, { fontFamily: 'Inter-Bold' }]}>{invoice.client?.name}</Text>
        <Text style={styles.text}>{invoice.client?.address}</Text>
        <Text style={styles.text}>Phone: {invoice.client?.phone}</Text>
        <Text style={styles.text}>Email: {invoice.client?.email}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.description, { fontFamily: 'Inter-Bold' }]}>Description</Text>
          <Text style={[styles.quantity, { fontFamily: 'Inter-Bold' }]}>Qty</Text>
          <Text style={[styles.price, { fontFamily: 'Inter-Bold' }]}>Price</Text>
          <Text style={[styles.amount, { fontFamily: 'Inter-Bold' }]}>Amount</Text>
        </View>

        {invoice.items?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <Text style={styles.price}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={styles.amount}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.taxTotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount:</Text>
          <Text style={styles.totalAmount}>-{formatCurrency(invoice.discountTotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { fontSize: 14 }]}>Total:</Text>
          <Text style={[styles.totalAmount, { fontSize: 14 }]}>{formatCurrency(invoice.total)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

export const generatePDF = (invoice: Invoice) => {
  return <PDFViewer style={{ width: '100%', height: '100vh' }}><InvoicePDF invoice={invoice} /></PDFViewer>;
};

export default generatePDF;