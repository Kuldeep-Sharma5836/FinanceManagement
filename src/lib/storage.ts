import { Transaction } from "@/components/TransactionForm";

const STORAGE_PREFIX = 'finance_tracker_';

export interface UserData {
  transactions: Transaction[];
  lastUpdated: string;
}

export class StorageManager {
  private static getUserKey(email: string): string {
    return `${STORAGE_PREFIX}${email}`;
  }

  static saveTransactions(email: string, transactions: Transaction[]): void {
    try {
      const userData: UserData = {
        transactions,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.getUserKey(email), JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  static loadTransactions(email: string): Transaction[] {
    try {
      const userKey = this.getUserKey(email);
      const storedData = localStorage.getItem(userKey);
      
      if (storedData) {
        const userData: UserData = JSON.parse(storedData);
        return userData.transactions || [];
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    
    return [];
  }

  static clearUserData(email: string): void {
    try {
      localStorage.removeItem(this.getUserKey(email));
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  static exportData(email: string): UserData | null {
    try {
      const userKey = this.getUserKey(email);
      const storedData = localStorage.getItem(userKey);
      
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    
    return null;
  }
} 