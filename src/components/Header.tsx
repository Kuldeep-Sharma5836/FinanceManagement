import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Logo } from "./Logo";
import { CurrencySelector } from "./CurrencySelector";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-xs text-gray-600">Currency:</span>
              <span className="text-sm font-medium text-emerald-700">{currency}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};