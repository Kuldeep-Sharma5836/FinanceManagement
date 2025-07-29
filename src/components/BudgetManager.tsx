import { useState, useEffect } from "react";
import { Transaction } from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Target,
  BarChart3
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string; // "monthly", "weekly", "yearly"
  createdAt: string;
}

interface BudgetManagerProps {
  transactions: Transaction[];
}

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Other"
];

export const BudgetManager = ({ transactions }: BudgetManagerProps) => {
  const { formatCurrency, convertToDisplayCurrency } = useCurrency();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly"
  });

  // Load budgets from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('finance_budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Calculate spent amounts for current month
  const calculateSpentAmounts = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions
      .filter(t => t.type === "expense")
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, transaction) => {
        const convertedAmount = convertToDisplayCurrency(transaction.originalAmount, transaction.originalCurrency);
        acc[transaction.category] = (acc[transaction.category] || 0) + convertedAmount;
        return acc;
      }, {} as Record<string, number>);

    return monthlyExpenses;
  };

  const spentAmounts = calculateSpentAmounts();

  // Update budgets with spent amounts
  const updatedBudgets = budgets.map(budget => ({
    ...budget,
    spent: spentAmounts[budget.category] || 0
  }));

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in both category and amount.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    // Check if budget already exists for this category
    if (budgets.some(b => b.category === newBudget.category)) {
      toast({
        title: "Budget already exists",
        description: "A budget for this category already exists.",
        variant: "destructive"
      });
      return;
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: amount,
      spent: spentAmounts[newBudget.category] || 0,
      period: newBudget.period,
      createdAt: new Date().toISOString()
    };

    setBudgets(prev => [...prev, budget]);
    setNewBudget({ category: "", amount: "", period: "monthly" });
    setIsAddingBudget(false);

    toast({
      title: "Budget added",
      description: `Budget of ${formatCurrency(amount)} set for ${newBudget.category}.`,
    });
  };

  const handleEditBudget = () => {
    if (!editingBudget || !newBudget.amount) return;

    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive"
      });
      return;
    }

    setBudgets(prev => prev.map(b => 
      b.id === editingBudget.id 
        ? { ...b, amount: amount, period: newBudget.period }
        : b
    ));

    setEditingBudget(null);
    setNewBudget({ category: "", amount: "", period: "monthly" });

    toast({
      title: "Budget updated",
      description: `Budget for ${editingBudget.category} updated to ${formatCurrency(amount)}.`,
    });
  };

  const handleDeleteBudget = (budget: Budget) => {
    setBudgets(prev => prev.filter(b => b.id !== budget.id));
    toast({
      title: "Budget deleted",
      description: `Budget for ${budget.category} has been removed.`,
    });
  };

  const getProgressColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressVariant = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 90) return "destructive";
    if (percentage >= 75) return "default";
    return "default";
  };

  const totalBudget = updatedBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = updatedBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-primary/20 shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gradient-green">Budget Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Set and track your monthly spending limits
              </p>
            </div>
            <Button 
              onClick={() => setIsAddingBudget(true)}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gradient-green">
              {formatCurrency(totalBudget)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {updatedBudgets.length} categories
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Budget Form */}
      {(isAddingBudget || editingBudget) && (
        <Card className="bg-gradient-card border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-gradient-green">
              {editingBudget ? 'Edit Budget' : 'Add New Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <select
                  id="category"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full mt-1 p-2 rounded-md border border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20"
                  disabled={!!editingBudget}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="amount" className="text-foreground">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  className="mt-1 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                />
              </div>
              
              <div>
                <Label htmlFor="period" className="text-foreground">Period</Label>
                <select
                  id="period"
                  value={newBudget.period}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full mt-1 p-2 rounded-md border border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingBudget ? handleEditBudget : handleAddBudget}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
              >
                {editingBudget ? 'Update Budget' : 'Add Budget'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsAddingBudget(false);
                  setEditingBudget(null);
                  setNewBudget({ category: "", amount: "", period: "monthly" });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <div className="space-y-4">
        {updatedBudgets.length === 0 ? (
          <Card className="bg-gradient-card border-primary/20 shadow-glow">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No budgets set</h3>
              <p className="text-muted-foreground mb-4">
                Create your first budget to start tracking your spending limits
              </p>
              <Button 
                onClick={() => setIsAddingBudget(true)}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          updatedBudgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = budget.spent > budget.amount;
            const isNearLimit = percentage >= 75 && percentage < 90;
            const isAtLimit = percentage >= 90;

            return (
              <Card key={budget.id} className="bg-gradient-card border-primary/20 shadow-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{budget.category}</h3>
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                      {isAtLimit && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Over Budget
                        </Badge>
                      )}
                      {isNearLimit && (
                        <Badge variant="default" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Near Limit
                        </Badge>
                      )}
                      {percentage < 75 && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          On Track
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBudget(budget);
                          setNewBudget({
                            category: budget.category,
                            amount: budget.amount.toString(),
                            period: budget.period
                          });
                        }}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget)}
                        className="hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">{formatCurrency(budget.spent)}</span>
                    </div>
                    
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                      indicatorClassName={getProgressColor(budget.spent, budget.amount)}
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatCurrency(budget.amount)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className={`font-medium ${budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budget.amount - budget.spent)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}; 