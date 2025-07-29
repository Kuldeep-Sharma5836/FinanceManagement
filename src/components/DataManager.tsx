import { useState } from "react";
import { Transaction } from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StorageManager } from "@/lib/storage";

interface DataManagerProps {
  userEmail: string;
  transactions: Transaction[];
  onDataUpdate: (transactions: Transaction[]) => void;
}

export const DataManager = ({ userEmail, transactions, onDataUpdate }: DataManagerProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExportData = () => {
    try {
      const userData = StorageManager.exportData(userEmail);
      if (userData) {
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance_data_${userEmail}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Data exported",
          description: "Your financial data has been exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (importedData.transactions && Array.isArray(importedData.transactions)) {
          // Validate transaction structure
          const validTransactions = importedData.transactions.filter((t: any) => 
            t.id && t.amount && t.description && t.category && t.type && t.date
          );
          
          if (validTransactions.length > 0) {
            onDataUpdate(validTransactions);
            toast({
              title: "Data imported",
              description: `${validTransactions.length} transactions imported successfully.`,
            });
          } else {
            toast({
              title: "Import failed",
              description: "No valid transactions found in the file.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Invalid file",
            description: "The file does not contain valid transaction data.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse the file. Please check the file format.",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive"
      });
      setIsImporting(false);
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      StorageManager.clearUserData(userEmail);
      onDataUpdate([]);
      toast({
        title: "Data cleared",
        description: "All your financial data has been cleared.",
      });
    }
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="text-gradient-green">Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Data */}
          <div className="text-center">
            <Button 
              onClick={handleExportData}
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
              disabled={transactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Download your data as JSON file
            </p>
          </div>

          {/* Import Data */}
          <div className="text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
              disabled={isImporting}
            />
            <label htmlFor="import-file">
              <Button 
                asChild
                className="w-full bg-gradient-secondary hover:opacity-90 transition-all duration-300 shadow-glow"
                disabled={isImporting}
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Import data from JSON file
            </p>
          </div>

          {/* Clear Data */}
          <div className="text-center">
            <Button 
              onClick={handleClearData}
              variant="destructive"
              className="w-full hover:opacity-90 transition-all duration-300"
              disabled={transactions.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Delete all your data
            </p>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
          <h4 className="font-medium text-foreground mb-2">Data Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Transactions:</span>
              <span className="ml-2 font-medium text-foreground">{transactions.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-medium text-foreground">
                {transactions.length > 0 
                  ? new Date(Math.max(...transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Data Storage Notice</p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              Your data is stored locally in your browser. For backup, regularly export your data. 
              Clearing browser data will remove all your financial records.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 