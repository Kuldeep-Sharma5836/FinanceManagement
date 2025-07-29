import { useState } from "react";
import { Transaction } from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const TransactionList = ({ 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction 
}: TransactionListProps) => {
  const { formatCurrency, convertToDisplayCurrency } = useCurrency();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const categories = [...new Set(transactions.map(t => t.category))];
  
  const filteredTransactions = transactions.filter(transaction => {
    const categoryMatch = filterCategory === "all" || transaction.category === filterCategory;
    const typeMatch = filterType === "all" || transaction.type === filterType;
    return categoryMatch && typeMatch;
  });

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="text-gradient-green">Transactions</CardTitle>
        <div className="flex gap-4 flex-wrap">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-gradient-card border-border/50">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-gradient-card border-border/50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-muted-foreground text-lg">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new transaction</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const convertedAmount = convertToDisplayCurrency(transaction.originalAmount, transaction.originalCurrency);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-primary/10 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 hover:shadow-glow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{transaction.description}</span>
                      <Badge 
                        variant={transaction.type === "income" ? "default" : "secondary"}
                        className={transaction.type === "income" ? "bg-gradient-mint text-white hover:bg-gradient-mint/80" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.category} • {transaction.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold text-lg ${
                        transaction.type === "income" ? "text-gradient-mint" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(convertedAmount)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTransaction(transaction)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};