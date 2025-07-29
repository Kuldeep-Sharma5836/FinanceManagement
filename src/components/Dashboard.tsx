import { Transaction } from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard = ({ transactions }: DashboardProps) => {
  const { formatCurrency, convertToDisplayCurrency } = useCurrency();
  
  // Convert all amounts to the current display currency
  const convertedTransactions = transactions.map(transaction => ({
    ...transaction,
    convertedAmount: convertToDisplayCurrency(transaction.originalAmount, transaction.originalCurrency)
  }));

  const totalIncome = convertedTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.convertedAmount, 0);

  const totalExpenses = convertedTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.convertedAmount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expensesByCategory = convertedTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Monthly trend (simplified - using transaction date)
  const monthlyData = convertedTransactions.reduce((acc, transaction) => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    if (transaction.type === "income") {
      acc[month].income += transaction.convertedAmount;
    } else {
      acc[month].expenses += transaction.convertedAmount;
    }
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const monthlyTrendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Enhanced color palette matching green theme
  const COLORS = [
    '#16a34a', // Green
    '#10b981', // Emerald
    '#059669', // Dark green
    '#047857', // Teal
    '#065f46', // Dark teal
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#6366f1'  // Indigo
  ];

  const recentTransactions = convertedTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow-mint transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-mint">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              💰 Your earnings
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow-mint transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              💸 Your spending
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-primary/20 shadow-glow hover:shadow-glow-mint transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-gradient-mint' : 'text-destructive'}`}>
              {formatCurrency(netBalance)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {netBalance >= 0 ? '📈 Positive balance' : '📉 Negative balance'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-gradient-green">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-gradient-green">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                  <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>No monthly data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gradient-card border-primary/20 shadow-glow">
        <CardHeader>
          <CardTitle className="text-gradient-green">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
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
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};