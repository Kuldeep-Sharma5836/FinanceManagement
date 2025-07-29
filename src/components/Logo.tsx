import { TrendingUp } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
          <TrendingUp className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        {/* Hand-drawn style accent */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80"></div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent tracking-wide">
          Finance Management
        </h1>
        <p className="text-xs text-gray-500 -mt-1 font-mono">by Kuldeep</p>
      </div>
    </div>
  );
}; 