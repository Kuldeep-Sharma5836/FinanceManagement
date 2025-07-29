import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  convertCurrency: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  convertToDisplayCurrency: (amount: number, originalCurrency: Currency) => number;
}

// Exchange rates (you can update these or fetch from an API)
const EXCHANGE_RATES = {
  USD: {
    INR: 83.5, // 1 USD = 83.5 INR (approximate rate)
  },
  INR: {
    USD: 1 / 83.5, // 1 INR = 0.012 USD
  },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selected_currency') as Currency;
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'INR')) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selected_currency', newCurrency);
  };

  const formatCurrency = (amount: number): string => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', options).format(amount);
  };

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '₹';
  };

  // Convert amount from one currency to another
  const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
    if (!rate) {
      return amount; // Return original amount if conversion rate not available
    }
    
    return amount * rate;
  };

  // Convert amount to the currently selected display currency
  const convertToDisplayCurrency = (amount: number, originalCurrency: Currency): number => {
    return convertCurrency(amount, originalCurrency, currency);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatCurrency, 
      getCurrencySymbol, 
      convertCurrency, 
      convertToDisplayCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}; 