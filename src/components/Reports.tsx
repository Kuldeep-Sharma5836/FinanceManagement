import { useState } from "react";
import { Transaction } from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ReportGenerator } from "@/lib/reports";
import { useToast } from "@/hooks/use-toast";

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports = ({ transactions }: ReportsProps) => {
  const { formatCurrency, convertToDisplayCurrency, currency } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all_time");
  const [reportType, setReportType] = useState<"pdf" | "excel">("excel");
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Convert transactions to display currency
  const convertedTransactions = transactions.map(transaction => ({
    ...transaction,
    convertedAmount: convertToDisplayCurrency(transaction.originalAmount, transaction.originalCurrency)
  }));

  // Filter transactions by selected period
  const filteredTransactions = ReportGenerator.filterTransactionsByPeriod(convertedTransactions, selectedPeriod);

  // Calculate totals for filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.convertedAmount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.convertedAmount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Category breakdown
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleDownloadReport = async () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No data available",
        description: "There are no transactions to download for the selected period.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const periodLabel = ReportGenerator.getPeriodLabel(selectedPeriod);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `finance_report_${selectedPeriod}_${timestamp}`;

      if (reportType === "excel") {
        // Generate and download CSV
        const csvContent = ReportGenerator.generateCSV(filteredTransactions, currency);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Report downloaded",
          description: `CSV report for ${periodLabel} has been downloaded successfully.`,
        });
      } else {
        // Generate text report as fallback
        const reportContent = generateTextReport(filteredTransactions, currency, periodLabel);
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Report downloaded",
          description: `Text report for ${periodLabel} has been downloaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const generateTextReport = (transactions: Transaction[], currency: string, period: string) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.convertedAmount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.convertedAmount, 0);
    
    const netBalance = totalIncome - totalExpenses;

    return `
FINANCE TRACKER REPORT
======================

Period: ${period}
Currency: ${currency}
Generated: ${new Date().toLocaleDateString()}
Total Transactions: ${transactions.length}

SUMMARY
-------
Total Income: ${formatCurrency(totalIncome)}
Total Expenses: ${formatCurrency(totalExpenses)}
Net Balance: ${formatCurrency(netBalance)}

TOP SPENDING CATEGORIES
-----------------------
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([category, amount], index) => 
    `${index + 1}. ${category}: ${formatCurrency(amount)}`
  ).join('\n')}

TRANSACTIONS
------------
${transactions.map(t => 
  `${t.date} | ${t.description} | ${t.category} | ${t.type} | ${formatCurrency(t.convertedAmount)}`
).join('\n')}

REPORT STATISTICS
-----------------
Income Transactions: ${transactions.filter(t => t.type === 'income').length}
Expense Transactions: ${transactions.filter(t => t.type === 'expense').length}
Average Income: ${formatCurrency(totalIncome / Math.max(transactions.filter(t => t.type === 'income').length, 1))}
Average Expense: ${formatCurrency(totalExpenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1))}
Savings Rate: ${totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0}%

Generated by Finance Tracker
${new Date().toLocaleString()}
    `.trim();
  };

  const periods = [
    { value: "current_month", label: "Current Month" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "last_6_months", label: "Last 6 Months" },
    { value: "this_year", label: "This Year" },
    { value: "all_time", label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with filters and download */}
      <Card className="bg-gradient-card border-primary/20 shadow-glow">
        <CardHeader>
          <CardTitle className="text-gradient-green">Financial Reports</CardTitle>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-card border-border/50">
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <Select value={reportType} onValueChange={(value: "pdf" | "excel") => setReportType(value)}>
                <SelectTrigger className="w-32 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gradient-card border-border/50">
                  <SelectItem value="excel">Excel (CSV)</SelectItem>
                  <SelectItem value="pdf">Text Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleDownloadReport}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
              disabled={filteredTransactions.length === 0 || isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download Report"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Data Status */}
      <Card className="bg-gradient-card border-primary/20 shadow-glow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {filteredTransactions.length > 0 ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {filteredTransactions.length} transactions found for {ReportGenerator.getPeriodLabel(selectedPeriod)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Report will include all transaction details and summaries
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No transactions found for {ReportGenerator.getPeriodLabel(selectedPeriod)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try selecting a different period or add some transactions first
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-mint">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "income").length} transactions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.type === "expense").length} transactions
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-gradient-mint' : 'text-destructive'}`}>
              {formatCurrency(netBalance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.length} total transactions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-gradient-green">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-foreground">{category}</span>
                  </div>
                  <span className="font-semibold text-destructive">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="bg-gradient-card border-primary/20 shadow-glow">
        <CardHeader>
          <CardTitle className="text-gradient-green">
            Recent Transactions ({ReportGenerator.getPeriodLabel(selectedPeriod)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-muted-foreground">No transactions found for this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                    <div>
                      <div className="font-medium text-foreground">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.date}
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-gradient-mint" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.convertedAmount)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 