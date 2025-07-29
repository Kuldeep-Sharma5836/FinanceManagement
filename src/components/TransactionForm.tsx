import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface Transaction {
  id: string;
  amount: number;
  originalAmount: number; // Store the original amount in the original currency
  originalCurrency: 'USD' | 'INR'; // Store the original currency
  description: string;
  category: string;
  type: "income" | "expense";
  date: string;
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
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
  "Salary",
  "Business",
  "Other"
];

export const TransactionForm = ({ onAddTransaction }: TransactionFormProps) => {
  const { currency, formatCurrency, convertCurrency } = useCurrency();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    const numericAmount = parseFloat(amount);
    
    // Store the original amount and currency
    const originalAmount = numericAmount;
    const originalCurrency = currency;

    onAddTransaction({
      amount: numericAmount,
      originalAmount: originalAmount,
      originalCurrency: originalCurrency,
      description,
      category,
      type,
      date: new Date().toISOString().split("T")[0],
    });

    setAmount("");
    setDescription("");
    setCategory("");
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="text-gradient-green">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-foreground">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-foreground">Type</Label>
              <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
                <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gradient-card border-border/50">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Input
              id="description"
              placeholder="Transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-card border-border/50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};