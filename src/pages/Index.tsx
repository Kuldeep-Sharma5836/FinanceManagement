import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Transaction, TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Dashboard } from "@/components/Dashboard";
import { Reports } from "@/components/Reports";
import { DataManager } from "@/components/DataManager";
import { BudgetManager } from "@/components/BudgetManager";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { StorageManager } from "@/lib/storage";

const Index = () => {
  const { user, isLoading } = useAuth();
  const { formatCurrency, convertToDisplayCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toast } = useToast();

  // Load user's transactions on component mount
  useEffect(() => {
    if (user?.email) {
      const savedTransactions = StorageManager.loadTransactions(user.email);
      setTransactions(savedTransactions);
    }
  }, [user?.email]);

  // Save transactions whenever they change
  useEffect(() => {
    if (user?.email) {
      StorageManager.saveTransactions(user.email, transactions);
    }
  }, [transactions, user?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleAddTransaction = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    // Show converted amount in toast message
    const convertedAmount = convertToDisplayCurrency(transactionData.originalAmount, transactionData.originalCurrency);
    toast({
      title: "Transaction added",
      description: `${transactionData.type === "income" ? "Income" : "Expense"} of ${formatCurrency(convertedAmount)} recorded.`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction deleted",
      description: "Transaction has been removed from your records.",
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
    setEditingTransaction(null);
    toast({
      title: "Transaction updated",
      description: "Transaction has been successfully updated.",
    });
  };

  const handleDataUpdate = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard transactions={transactions} />;
      case "add":
        return (
          <div className="max-w-md mx-auto">
            <TransactionForm onAddTransaction={handleAddTransaction} />
          </div>
        );
      case "transactions":
        return (
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
          />
        );
      case "budget":
        return <BudgetManager transactions={transactions} />;
      case "reports":
        return <Reports transactions={transactions} />;
      case "data":
        return (
          <DataManager 
            userEmail={user.email}
            transactions={transactions}
            onDataUpdate={handleDataUpdate}
          />
        );
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(!isMobileOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-800">
              Hey {user.name}! 👋
            </h2>
            <p className="text-gray-600">
              Ready to take control of your finances? Let's make today count!
            </p>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {renderContent()}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
