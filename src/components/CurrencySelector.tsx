import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { DollarSign, IndianRupee } from 'lucide-react';

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center space-x-1 bg-muted/30 backdrop-blur-sm rounded-lg p-1 border border-primary/20">
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('USD')}
        className={`h-8 px-3 transition-all duration-200 ${
          currency === 'USD' 
            ? 'bg-gradient-primary text-primary-foreground shadow-md' 
            : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
        }`}
      >
        <DollarSign className="h-4 w-4 mr-1" />
        USD
      </Button>
      <Button
        variant={currency === 'INR' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('INR')}
        className={`h-8 px-3 transition-all duration-200 ${
          currency === 'INR' 
            ? 'bg-gradient-primary text-primary-foreground shadow-md' 
            : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
        }`}
      >
        <IndianRupee className="h-4 w-4 mr-1" />
        INR
      </Button>
    </div>
  );
}; 