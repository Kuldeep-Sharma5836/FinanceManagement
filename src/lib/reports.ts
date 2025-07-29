import { Transaction } from "@/components/TransactionForm";

export interface ReportData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  period: string;
  currency: string;
}

// Helper function for currency formatting
const formatCurrencyAmount = (amount: number, currency: string): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', options).format(amount);
};

export class ReportGenerator {
  static generateCSV(transactions: Transaction[], currency: string): string {
    const headers = [
      'Date',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Original Amount',
      'Original Currency'
    ];

    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      formatCurrencyAmount(t.amount, currency),
      formatCurrencyAmount(t.originalAmount, t.originalCurrency),
      t.originalCurrency
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  static downloadCSV(transactions: Transaction[], currency: string, filename: string): void {
    const csvContent = this.generateCSV(transactions, currency);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static generatePDF(transactions: Transaction[], currency: string, period: string): void {
    try {
      // Try to use jsPDF if available
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const { jsPDF } = (window as any).jsPDF;
        this.generatePDFWithJsPDF(transactions, currency, period, jsPDF);
      } else {
        // Fallback: Generate a simple text report and download as .txt
        this.generateTextReport(transactions, currency, period);
      }
    } catch (error) {
      console.error('PDF generation failed, falling back to text report:', error);
      this.generateTextReport(transactions, currency, period);
    }
  }

  private static generatePDFWithJsPDF(transactions: Transaction[], currency: string, period: string, jsPDF: any): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(20);
    doc.text('Finance Tracker Report', pageWidth / 2, 20, { align: 'center' });
    
    // Period
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 20, 35);
    doc.text(`Currency: ${currency}`, 20, 45);
    
    // Summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;
    
    doc.text(`Total Income: ${formatCurrencyAmount(totalIncome, currency)}`, 20, 60);
    doc.text(`Total Expenses: ${formatCurrencyAmount(totalExpenses, currency)}`, 20, 70);
    doc.text(`Net Balance: ${formatCurrencyAmount(netBalance, currency)}`, 20, 80);
    
    // Transactions table
    let yPosition = 100;
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const colWidths = [25, 60, 30, 25, 30];
    let xPosition = 20;
    
    // Table headers
    doc.setFontSize(10);
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 10;
    
    // Table data
    transactions.forEach(transaction => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      const rowData = [
        transaction.date,
        transaction.description,
        transaction.category,
        transaction.type,
        formatCurrencyAmount(transaction.amount, currency)
      ];
      
      rowData.forEach((cell, index) => {
        doc.text(cell, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 7;
    });
    
    // Save PDF
    doc.save(`finance_report_${period}.pdf`);
  }

  private static generateTextReport(transactions: Transaction[], currency: string, period: string): void {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalIncome - totalExpenses;

    const reportContent = `
FINANCE TRACKER REPORT
======================

Period: ${period}
Currency: ${currency}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
-------
Total Income: ${formatCurrencyAmount(totalIncome, currency)}
Total Expenses: ${formatCurrencyAmount(totalExpenses, currency)}
Net Balance: ${formatCurrencyAmount(netBalance, currency)}

TRANSACTIONS
------------
${transactions.map(t => 
  `${t.date} | ${t.description} | ${t.category} | ${t.type} | ${formatCurrencyAmount(t.amount, currency)}`
).join('\n')}

Total Transactions: ${transactions.length}
Income Transactions: ${transactions.filter(t => t.type === 'income').length}
Expense Transactions: ${transactions.filter(t => t.type === 'expense').length}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `finance_report_${period}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static filterTransactionsByPeriod(transactions: Transaction[], period: string): Transaction[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    switch (period) {
      case 'current_month':
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        });
      
      case 'last_month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === lastMonth && 
                 transactionDate.getFullYear() === lastMonthYear;
        });
      
      case 'last_3_months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= threeMonthsAgo;
        });
      
      case 'last_6_months':
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= sixMonthsAgo;
        });
      
      case 'this_year':
        return transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getFullYear() === currentYear;
        });
      
      default:
        return transactions;
    }
  }

  static getPeriodLabel(period: string): string {
    switch (period) {
      case 'current_month':
        return 'Current Month';
      case 'last_month':
        return 'Last Month';
      case 'last_3_months':
        return 'Last 3 Months';
      case 'last_6_months':
        return 'Last 6 Months';
      case 'this_year':
        return 'This Year';
      case 'all_time':
        return 'All Time';
      default:
        return 'All Time';
    }
  }
} 